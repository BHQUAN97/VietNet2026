import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Them cot scheduled_publish_at TIMESTAMP NULL cho articles/projects/products.
 * Cron worker se quet cot nay: khi scheduled_publish_at <= NOW() va status='draft',
 * tu dong chuyen sang 'published' + set published_at=NOW().
 *
 * Index don tren scheduled_publish_at (MySQL 8 khong ho tro partial index nen khong filter
 * status o cap index — composite (status, scheduled_publish_at) cung duoc nhung don gian
 * hoa van cover duoc truy van theo scheduled_publish_at IS NOT NULL AND <= NOW()).
 *
 * Idempotent: check information_schema.COLUMNS / STATISTICS truoc khi ALTER / CREATE.
 */
export class AddScheduledPublishAt1776510000000 implements MigrationInterface {
  private readonly tables = ['articles', 'projects', 'products'] as const;

  private async columnExists(
    queryRunner: QueryRunner,
    table: string,
    column: string,
  ): Promise<boolean> {
    const rows = await queryRunner.query(
      `SELECT COUNT(1) AS cnt FROM information_schema.COLUMNS
       WHERE table_schema = DATABASE()
         AND table_name = ?
         AND column_name = ?`,
      [table, column],
    );
    return Number(rows?.[0]?.cnt ?? 0) > 0;
  }

  private async indexExists(
    queryRunner: QueryRunner,
    table: string,
    idxName: string,
  ): Promise<boolean> {
    const rows = await queryRunner.query(
      `SELECT COUNT(1) AS cnt FROM information_schema.STATISTICS
       WHERE table_schema = DATABASE()
         AND table_name = ?
         AND index_name = ?`,
      [table, idxName],
    );
    return Number(rows?.[0]?.cnt ?? 0) > 0;
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const table of this.tables) {
      if (!(await this.columnExists(queryRunner, table, 'scheduled_publish_at'))) {
        await queryRunner.query(
          `ALTER TABLE \`${table}\` ADD COLUMN \`scheduled_publish_at\` TIMESTAMP NULL DEFAULT NULL`,
        );
      }

      const idxName = `IDX_${table}_scheduled_publish_at`;
      if (!(await this.indexExists(queryRunner, table, idxName))) {
        await queryRunner.query(
          `CREATE INDEX \`${idxName}\` ON \`${table}\` (\`scheduled_publish_at\`)`,
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const table of [...this.tables].reverse()) {
      const idxName = `IDX_${table}_scheduled_publish_at`;
      if (await this.indexExists(queryRunner, table, idxName)) {
        await queryRunner.query(
          `DROP INDEX \`${idxName}\` ON \`${table}\``,
        );
      }
      if (await this.columnExists(queryRunner, table, 'scheduled_publish_at')) {
        await queryRunner.query(
          `ALTER TABLE \`${table}\` DROP COLUMN \`scheduled_publish_at\``,
        );
      }
    }
  }
}

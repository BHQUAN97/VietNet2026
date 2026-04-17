import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Them index performance cho list queries tren articles/products/projects/consultations.
 * - articles/products/projects: published_at + (status, published_at) cho filter & sort public list
 * - consultations: created_at + (status, created_at) cho admin list filter & sort
 *
 * Slug da unique (MySQL auto-create unique index) nen khong can them rieng.
 * Idempotent: check information_schema truoc khi CREATE/DROP.
 * Tung statement mot vi TypeORM mysql2 khong bat multipleStatements mac dinh.
 */
export class AddPerformanceIndexes1776382906653 implements MigrationInterface {
  // [table, indexName, columnList]
  private readonly indexes: Array<[string, string, string]> = [
    ['articles', 'IDX_articles_published_at', 'published_at'],
    ['articles', 'IDX_articles_status_published_at', 'status, published_at'],
    ['products', 'IDX_products_published_at', 'published_at'],
    ['products', 'IDX_products_status_published_at', 'status, published_at'],
    ['projects', 'IDX_projects_published_at', 'published_at'],
    ['projects', 'IDX_projects_status_published_at', 'status, published_at'],
    ['consultations', 'IDX_consultations_created_at', 'created_at'],
    [
      'consultations',
      'IDX_consultations_status_created_at',
      'status, created_at',
    ],
  ];

  private async indexExists(
    queryRunner: QueryRunner,
    table: string,
    idxName: string,
  ): Promise<boolean> {
    const rows = await queryRunner.query(
      `SELECT COUNT(1) AS cnt FROM information_schema.statistics
       WHERE table_schema = DATABASE()
         AND table_name = ?
         AND index_name = ?`,
      [table, idxName],
    );
    const cnt = Number(rows?.[0]?.cnt ?? 0);
    return cnt > 0;
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const [table, idxName, cols] of this.indexes) {
      if (await this.indexExists(queryRunner, table, idxName)) continue;
      // Identifier interpolation an toan vi list cung trong migration.
      await queryRunner.query(
        `CREATE INDEX \`${idxName}\` ON \`${table}\` (${cols})`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const [table, idxName] of [...this.indexes].reverse()) {
      if (!(await this.indexExists(queryRunner, table, idxName))) continue;
      await queryRunner.query(
        `DROP INDEX \`${idxName}\` ON \`${table}\``,
      );
    }
  }
}

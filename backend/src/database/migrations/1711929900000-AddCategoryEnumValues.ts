import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Them 'article' va 'material' vao enum type cua bang categories.
 * Ban dau chi co ('project','product').
 */
export class AddCategoryEnumValues1711929900000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE categories MODIFY COLUMN \`type\` enum('project','product','article','material') NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE categories MODIFY COLUMN \`type\` enum('project','product') NOT NULL`,
    );
  }
}

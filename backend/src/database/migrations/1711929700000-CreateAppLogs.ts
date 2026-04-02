import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Tạo bảng app_logs để lưu trữ log Error/Warn/Info từ GlobalExceptionFilter
 */
export class CreateAppLogs1711929700000 implements MigrationInterface {
  name = 'CreateAppLogs1711929700000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`app_logs\` (
        \`id\` char(26) NOT NULL,
        \`level\` enum('error','warn','info','debug','trace') NOT NULL DEFAULT 'info',
        \`message\` varchar(500) NOT NULL,
        \`stack_trace\` text NULL,
        \`endpoint\` varchar(255) NULL,
        \`status_code\` smallint NULL,
        \`ip\` varchar(45) NULL,
        \`user_id\` char(26) NULL,
        \`user_agent\` varchar(500) NULL,
        \`context\` json NULL,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        INDEX \`idx_app_logs_level\` (\`level\`),
        INDEX \`idx_app_logs_created_at\` (\`created_at\`),
        INDEX \`idx_app_logs_level_created\` (\`level\`, \`created_at\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS `app_logs`');
  }
}

import {MigrationInterface, QueryRunner} from 'typeorm';

export class DynamicSchemas1780450000000 implements MigrationInterface {
  name = 'DynamicSchemas1780450000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `gustav_dynamic_schemas` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `name` varchar(255) NOT NULL, `slug` varchar(255) NOT NULL, `description` text NULL, `fields` text NOT NULL, UNIQUE INDEX `IDX_gustav_dynamic_schemas_slug` (`slug`), PRIMARY KEY (`id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `gustav_dynamic_records` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `schema_id` int NOT NULL, `data` text NOT NULL, INDEX `IDX_gustav_dynamic_records_schemaId` (`schema_id`), PRIMARY KEY (`id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'ALTER TABLE `gustav_dynamic_records` ADD CONSTRAINT `FK_gustav_dynamic_records_schema_id` FOREIGN KEY (`schema_id`) REFERENCES `gustav_dynamic_schemas`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `gustav_dynamic_records` DROP FOREIGN KEY `FK_gustav_dynamic_records_schema_id`'
    );
    await queryRunner.query('DROP TABLE `gustav_dynamic_records`');
    await queryRunner.query('DROP TABLE `gustav_dynamic_schemas`');
  }
}

import {MigrationInterface, QueryRunner} from 'typeorm';

export class DataViewModel1780900000000 implements MigrationInterface {
  name = 'DataViewModel1780900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `gustav_page_versions` ADD `data_view_model` text NULL'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `gustav_page_versions` DROP COLUMN `data_view_model`'
    );
  }
}

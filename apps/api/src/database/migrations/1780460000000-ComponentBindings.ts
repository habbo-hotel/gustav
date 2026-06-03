import {MigrationInterface, QueryRunner} from 'typeorm';

export class ComponentBindings1780460000000 implements MigrationInterface {
  name = 'ComponentBindings1780460000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `gustav_page_components` ADD `bindings` text NULL'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `gustav_page_components` DROP COLUMN `bindings`'
    );
  }
}

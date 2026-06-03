import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddComponentSlot1780442000000 implements MigrationInterface {
  name = 'AddComponentSlot1780442000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `gustav_page_components` ADD `slot` int NULL'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `gustav_page_components` DROP COLUMN `slot`'
    );
  }
}

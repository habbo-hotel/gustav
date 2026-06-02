import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddComponentParentId1780432000000 implements MigrationInterface {
  name = 'AddComponentParentId1780432000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `gustav_page_components` ADD `parentId` int NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `gustav_page_components` ADD CONSTRAINT `FK_component_parent` FOREIGN KEY (`parentId`) REFERENCES `gustav_page_components`(`id`) ON DELETE CASCADE'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `gustav_page_components` DROP FOREIGN KEY `FK_component_parent`'
    );
    await queryRunner.query(
      'ALTER TABLE `gustav_page_components` DROP COLUMN `parentId`'
    );
  }
}

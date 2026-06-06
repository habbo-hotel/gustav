import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddPageShowInNavigation1780416403032
  implements MigrationInterface
{
  name = 'AddPageShowInNavigation1780416403032';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `gustav_pages` ADD `showInNavigation` tinyint NOT NULL DEFAULT 1'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `gustav_pages` DROP COLUMN `showInNavigation`'
    );
  }
}

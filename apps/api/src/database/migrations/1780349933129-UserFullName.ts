import {MigrationInterface, QueryRunner} from 'typeorm';

export class UserFullName1780349933129 implements MigrationInterface {
  name = 'UserFullName1780349933129';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `gustav_users` ADD `firstName` varchar(255) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `gustav_users` ADD `lastName` varchar(255) NULL'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `gustav_users` DROP COLUMN `lastName`'
    );
    await queryRunner.query(
      'ALTER TABLE `gustav_users` DROP COLUMN `firstName`'
    );
  }
}

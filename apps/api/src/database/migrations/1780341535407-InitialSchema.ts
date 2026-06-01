import {MigrationInterface, QueryRunner} from 'typeorm';

export class InitialSchema1780341535407 implements MigrationInterface {
  name = 'InitialSchema1780341535407';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `gustav_users` (`id` int NOT NULL AUTO_INCREMENT, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `username` varchar(255) NOT NULL, `email` varchar(255) NOT NULL, `password` varchar(255) NULL, `discordId` varchar(255) NULL, `isSuperAdmin` tinyint NOT NULL DEFAULT 0, UNIQUE INDEX `IDX_c7ce4368ca79d7d286e723c83a` (`username`), UNIQUE INDEX `IDX_8d069bb585639808fdad7446a1` (`email`), PRIMARY KEY (`id`)) ENGINE=InnoDB'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX `IDX_8d069bb585639808fdad7446a1` ON `gustav_users`'
    );
    await queryRunner.query(
      'DROP INDEX `IDX_c7ce4368ca79d7d286e723c83a` ON `gustav_users`'
    );
    await queryRunner.query('DROP TABLE `gustav_users`');
  }
}

import {MigrationInterface, QueryRunner} from 'typeorm';

export class PluginSettings1780370825714 implements MigrationInterface {
  name = 'PluginSettings1780370825714';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `gustav_plugin_settings` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `plugin_name` varchar(255) NOT NULL, `settings` text NOT NULL, UNIQUE INDEX `IDX_73341489a8924e43fbc60830d8` (`plugin_name`), PRIMARY KEY (`id`)) ENGINE=InnoDB'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX `IDX_73341489a8924e43fbc60830d8` ON `gustav_plugin_settings`'
    );
    await queryRunner.query('DROP TABLE `gustav_plugin_settings`');
  }
}

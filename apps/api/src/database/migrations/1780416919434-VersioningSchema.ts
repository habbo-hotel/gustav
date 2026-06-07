import {MigrationInterface, QueryRunner} from 'typeorm';

export class VersioningSchema1780416919434 implements MigrationInterface {
  name = 'VersioningSchema1780416919434';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create the new versions table
    await queryRunner.query(`CREATE TABLE \`gustav_page_versions\` (
            \`id\` int NOT NULL AUTO_INCREMENT, 
            \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), 
            \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), 
            \`page_id\` int NOT NULL, 
            \`version_number\` int NOT NULL DEFAULT '1', 
            \`title\` varchar(255) NOT NULL, 
            \`slug\` varchar(255) NOT NULL, 
            \`path\` varchar(255) NOT NULL, 
            \`status\` enum ('draft', 'published', 'archived') NOT NULL DEFAULT 'draft', 
            \`show_in_navigation\` tinyint NOT NULL DEFAULT 1, 
            \`parent_id\` int NULL, 
            PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB`);

    // 2. Migrate existing data from gustav_pages to gustav_page_versions
    // Each existing page becomes version 1 of itself.
    await queryRunner.query(`INSERT INTO \`gustav_page_versions\` 
            (\`page_id\`, \`version_number\`, \`title\`, \`slug\`, \`path\`, \`status\`, \`show_in_navigation\`, \`parent_id\`, \`created_at\`, \`updated_at\`)
            SELECT \`id\`, 1, \`title\`, \`slug\`, \`path\`, \`status\`, \`show_in_navigation\`, \`parent_id\`, \`created_at\`, \`updated_at\`
            FROM \`gustav_pages\``);

    // 3. Update gustav_page_components to point to the new version IDs
    // Since we did a direct mapping (version ID 1 corresponds to page ID 1 in this initial migration),
    // we can update based on pageId matching.
    // Actually, the version ID is AUTO_INCREMENT, so version.id might not match page.id.
    // Let's join to be sure.
    await queryRunner.query(`UPDATE \`gustav_page_components\` c
            JOIN \`gustav_page_versions\` v ON c.page_id = v.page_id
            SET c.page_id = v.id`);

    // 4. Rename column in gustav_page_components
    await queryRunner.query(
      'ALTER TABLE `gustav_page_components` CHANGE `page_id` `page_version_id` int NOT NULL'
    );

    // 5. Clean up gustav_pages and fix constraints
    await queryRunner.query(
      'ALTER TABLE `gustav_page_components` DROP FOREIGN KEY `FK_b8974df2d713c59416f08d98a35`'
    );
    await queryRunner.query(
      'ALTER TABLE `gustav_pages` DROP FOREIGN KEY `FK_e754143f3a10d1e1e21e376488c`'
    );
    await queryRunner.query(
      'DROP INDEX `IDX_3986099a9e2b28e80eeadf0179` ON `gustav_pages`'
    );
    await queryRunner.query(
      'DROP INDEX `IDX_bf48e91d9667478f9d0ac8fadc` ON `gustav_pages`'
    );

    await queryRunner.query('ALTER TABLE `gustav_pages` DROP COLUMN `title`');
    await queryRunner.query('ALTER TABLE `gustav_pages` DROP COLUMN `slug`');
    await queryRunner.query('ALTER TABLE `gustav_pages` DROP COLUMN `path`');
    await queryRunner.query('ALTER TABLE `gustav_pages` DROP COLUMN `status`');
    await queryRunner.query(
      'ALTER TABLE `gustav_pages` DROP COLUMN `parent_id`'
    );
    await queryRunner.query(
      'ALTER TABLE `gustav_pages` DROP COLUMN `show_in_navigation`'
    );

    // 6. Add final constraints
    await queryRunner.query(
      'ALTER TABLE `gustav_page_components` ADD CONSTRAINT `FK_ba44d913142fe7ffbd1e8fdc61a` FOREIGN KEY (`page_version_id`) REFERENCES `gustav_page_versions`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `gustav_page_versions` ADD CONSTRAINT `FK_17e689bcb6a03bee6be4ba74da7` FOREIGN KEY (`page_id`) REFERENCES `gustav_pages`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `gustav_page_versions` ADD CONSTRAINT `FK_a8cd938cd77f79e7d6c59f9a427` FOREIGN KEY (`parent_id`) REFERENCES `gustav_pages`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Down migration would be complex and likely unnecessary for this task.
    // Implementing basic reversal.
    await queryRunner.query(
      'ALTER TABLE `gustav_page_versions` DROP FOREIGN KEY `FK_a8cd938cd77f79e7d6c59f9a427`'
    );
    await queryRunner.query(
      'ALTER TABLE `gustav_page_versions` DROP FOREIGN KEY `FK_17e689bcb6a03bee6be4ba74da7`'
    );
    await queryRunner.query(
      'ALTER TABLE `gustav_page_components` DROP FOREIGN KEY `FK_ba44d913142fe7ffbd1e8fdc61a`'
    );

    await queryRunner.query(
      'ALTER TABLE `gustav_pages` ADD `show_in_navigation` tinyint NOT NULL DEFAULT 1'
    );
    await queryRunner.query(
      'ALTER TABLE `gustav_pages` ADD `parent_id` int NULL'
    );
    await queryRunner.query(
      "ALTER TABLE `gustav_pages` ADD `status` enum ('draft', 'published', 'archived') NOT NULL DEFAULT 'draft'"
    );
    await queryRunner.query(
      "ALTER TABLE `gustav_pages` ADD `path` varchar(255) NOT NULL DEFAULT ''"
    );
    await queryRunner.query(
      "ALTER TABLE `gustav_pages` ADD `slug` varchar(255) NOT NULL DEFAULT ''"
    );
    await queryRunner.query(
      "ALTER TABLE `gustav_pages` ADD `title` varchar(255) NOT NULL DEFAULT ''"
    );

    await queryRunner.query(`UPDATE \`gustav_pages\` p
            JOIN \`gustav_page_versions\` v ON p.id = v.page_id
            SET p.title = v.title, p.slug = v.slug, p.path = v.path, p.status = v.status, p.parent_id = v.parent_id, p.show_in_navigation = v.show_in_navigation
            WHERE v.status = 'published'`);

    await queryRunner.query(
      'ALTER TABLE `gustav_page_components` CHANGE `page_version_id` `page_id` int NOT NULL'
    );
    await queryRunner.query(`UPDATE \`gustav_page_components\` c
            JOIN \`gustav_page_versions\` v ON c.page_id = v.id
            SET c.page_id = v.page_id`);

    await queryRunner.query('DROP TABLE `gustav_page_versions`');
    await queryRunner.query(
      'CREATE UNIQUE INDEX `IDX_bf48e91d9667478f9d0ac8fadc` ON `gustav_pages` (`path`)'
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX `IDX_3986099a9e2b28e80eeadf0179` ON `gustav_pages` (`slug`)'
    );
    await queryRunner.query(
      'ALTER TABLE `gustav_pages` ADD CONSTRAINT `FK_e754143f3a10d1e1e21e376488c` FOREIGN KEY (`parent_id`) REFERENCES `gustav_pages`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `gustav_page_components` ADD CONSTRAINT `FK_b8974df2d713c59416f08d98a35` FOREIGN KEY (`page_id`) REFERENCES `gustav_pages`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION'
    );
  }
}

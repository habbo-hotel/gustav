import {MigrationInterface, QueryRunner} from 'typeorm';

export class VersioningSchema1780416919434 implements MigrationInterface {
  name = 'VersioningSchema1780416919434';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create the new versions table
    await queryRunner.query(`CREATE TABLE \`gustav_page_versions\` (
            \`id\` int NOT NULL AUTO_INCREMENT, 
            \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), 
            \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), 
            \`pageId\` int NOT NULL, 
            \`versionNumber\` int NOT NULL DEFAULT '1', 
            \`title\` varchar(255) NOT NULL, 
            \`slug\` varchar(255) NOT NULL, 
            \`path\` varchar(255) NOT NULL, 
            \`status\` enum ('draft', 'published', 'archived') NOT NULL DEFAULT 'draft', 
            \`showInNavigation\` tinyint NOT NULL DEFAULT 1, 
            \`parentId\` int NULL, 
            PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB`);

    // 2. Migrate existing data from gustav_pages to gustav_page_versions
    // Each existing page becomes version 1 of itself.
    await queryRunner.query(`INSERT INTO \`gustav_page_versions\` 
            (\`pageId\`, \`versionNumber\`, \`title\`, \`slug\`, \`path\`, \`status\`, \`showInNavigation\`, \`parentId\`, \`createdAt\`, \`updatedAt\`)
            SELECT \`id\`, 1, \`title\`, \`slug\`, \`path\`, \`status\`, \`showInNavigation\`, \`parentId\`, \`createdAt\`, \`updatedAt\`
            FROM \`gustav_pages\``);

    // 3. Update gustav_page_components to point to the new version IDs
    // Since we did a direct mapping (version ID 1 corresponds to page ID 1 in this initial migration),
    // we can update based on pageId matching.
    // Actually, the version ID is AUTO_INCREMENT, so version.id might not match page.id.
    // Let's join to be sure.
    await queryRunner.query(`UPDATE \`gustav_page_components\` c
            JOIN \`gustav_page_versions\` v ON c.pageId = v.pageId
            SET c.pageId = v.id`);

    // 4. Rename column in gustav_page_components
    await queryRunner.query(
      'ALTER TABLE `gustav_page_components` CHANGE `pageId` `pageVersionId` int NOT NULL'
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
      'ALTER TABLE `gustav_pages` DROP COLUMN `parentId`'
    );
    await queryRunner.query(
      'ALTER TABLE `gustav_pages` DROP COLUMN `showInNavigation`'
    );

    // 6. Add final constraints
    await queryRunner.query(
      'ALTER TABLE `gustav_page_components` ADD CONSTRAINT `FK_ba44d913142fe7ffbd1e8fdc61a` FOREIGN KEY (`pageVersionId`) REFERENCES `gustav_page_versions`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `gustav_page_versions` ADD CONSTRAINT `FK_17e689bcb6a03bee6be4ba74da7` FOREIGN KEY (`pageId`) REFERENCES `gustav_pages`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `gustav_page_versions` ADD CONSTRAINT `FK_a8cd938cd77f79e7d6c59f9a427` FOREIGN KEY (`parentId`) REFERENCES `gustav_pages`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION'
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
      'ALTER TABLE `gustav_pages` ADD `showInNavigation` tinyint NOT NULL DEFAULT 1'
    );
    await queryRunner.query(
      'ALTER TABLE `gustav_pages` ADD `parentId` int NULL'
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
            JOIN \`gustav_page_versions\` v ON p.id = v.pageId
            SET p.title = v.title, p.slug = v.slug, p.path = v.path, p.status = v.status, p.parentId = v.parentId, p.showInNavigation = v.showInNavigation
            WHERE v.status = 'published'`);

    await queryRunner.query(
      'ALTER TABLE `gustav_page_components` CHANGE `pageVersionId` `pageId` int NOT NULL'
    );
    await queryRunner.query(`UPDATE \`gustav_page_components\` c
            JOIN \`gustav_page_versions\` v ON c.pageId = v.id
            SET c.pageId = v.pageId`);

    await queryRunner.query('DROP TABLE `gustav_page_versions`');
    await queryRunner.query(
      'CREATE UNIQUE INDEX `IDX_bf48e91d9667478f9d0ac8fadc` ON `gustav_pages` (`path`)'
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX `IDX_3986099a9e2b28e80eeadf0179` ON `gustav_pages` (`slug`)'
    );
    await queryRunner.query(
      'ALTER TABLE `gustav_pages` ADD CONSTRAINT `FK_e754143f3a10d1e1e21e376488c` FOREIGN KEY (`parentId`) REFERENCES `gustav_pages`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `gustav_page_components` ADD CONSTRAINT `FK_b8974df2d713c59416f08d98a35` FOREIGN KEY (`pageId`) REFERENCES `gustav_pages`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION'
    );
  }
}

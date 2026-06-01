import { MigrationInterface, QueryRunner } from "typeorm";

export class CMSPages1780352648759 implements MigrationInterface {
    name = 'CMSPages1780352648759'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`gustav_page_components\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`pageId\` int NOT NULL, \`pluginName\` varchar(255) NOT NULL, \`componentName\` varchar(255) NOT NULL, \`props\` text NOT NULL, \`displayOrder\` int NOT NULL DEFAULT '0', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`gustav_pages\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`title\` varchar(255) NOT NULL, \`slug\` varchar(255) NOT NULL, \`path\` varchar(255) NOT NULL, \`status\` enum ('draft', 'published') NOT NULL DEFAULT 'draft', \`parentId\` int NULL, UNIQUE INDEX \`IDX_3986099a9e2b28e80eeadf0179\` (\`slug\`), UNIQUE INDEX \`IDX_bf48e91d9667478f9d0ac8fadc\` (\`path\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`gustav_page_components\` ADD CONSTRAINT \`FK_b8974df2d713c59416f08d98a35\` FOREIGN KEY (\`pageId\`) REFERENCES \`gustav_pages\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`gustav_pages\` ADD CONSTRAINT \`FK_e754143f3a10d1e1e21e376488c\` FOREIGN KEY (\`parentId\`) REFERENCES \`gustav_pages\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`gustav_pages\` DROP FOREIGN KEY \`FK_e754143f3a10d1e1e21e376488c\``);
        await queryRunner.query(`ALTER TABLE \`gustav_page_components\` DROP FOREIGN KEY \`FK_b8974df2d713c59416f08d98a35\``);
        await queryRunner.query(`DROP INDEX \`IDX_bf48e91d9667478f9d0ac8fadc\` ON \`gustav_pages\``);
        await queryRunner.query(`DROP INDEX \`IDX_3986099a9e2b28e80eeadf0179\` ON \`gustav_pages\``);
        await queryRunner.query(`DROP TABLE \`gustav_pages\``);
        await queryRunner.query(`DROP TABLE \`gustav_page_components\``);
    }

}

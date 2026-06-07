import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFolderToDynamicSchema1780856116971 implements MigrationInterface {
    name = 'AddFolderToDynamicSchema1780856116971'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`gustav_page_components\` DROP FOREIGN KEY \`FK_component_parent\``);
        await queryRunner.query(`ALTER TABLE \`gustav_dynamic_records\` DROP FOREIGN KEY \`FK_gustav_dynamic_records_schema_id\``);
        await queryRunner.query(`DROP INDEX \`IDX_gustav_dynamic_schemas_slug\` ON \`gustav_dynamic_schemas\``);
        await queryRunner.query(`DROP INDEX \`IDX_gustav_dynamic_records_schemaId\` ON \`gustav_dynamic_records\``);
        await queryRunner.query(`ALTER TABLE \`gustav_dynamic_schemas\` ADD \`folder\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`gustav_dynamic_schemas\` ADD UNIQUE INDEX \`IDX_f7fa62afb66e09dbfad4c4a022\` (\`slug\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_fcd2d0e10dc0e7b5940854ccbf\` ON \`gustav_dynamic_records\` (\`schema_id\`)`);
        await queryRunner.query(`ALTER TABLE \`gustav_page_components\` ADD CONSTRAINT \`FK_16f1db2be968bdf852711685959\` FOREIGN KEY (\`parent_id\`) REFERENCES \`gustav_page_components\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`gustav_dynamic_records\` ADD CONSTRAINT \`FK_fcd2d0e10dc0e7b5940854ccbfc\` FOREIGN KEY (\`schema_id\`) REFERENCES \`gustav_dynamic_schemas\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`gustav_dynamic_records\` DROP FOREIGN KEY \`FK_fcd2d0e10dc0e7b5940854ccbfc\``);
        await queryRunner.query(`ALTER TABLE \`gustav_page_components\` DROP FOREIGN KEY \`FK_16f1db2be968bdf852711685959\``);
        await queryRunner.query(`DROP INDEX \`IDX_fcd2d0e10dc0e7b5940854ccbf\` ON \`gustav_dynamic_records\``);
        await queryRunner.query(`ALTER TABLE \`gustav_dynamic_schemas\` DROP INDEX \`IDX_f7fa62afb66e09dbfad4c4a022\``);
        await queryRunner.query(`ALTER TABLE \`gustav_dynamic_schemas\` DROP COLUMN \`folder\``);
        await queryRunner.query(`CREATE INDEX \`IDX_gustav_dynamic_records_schemaId\` ON \`gustav_dynamic_records\` (\`schema_id\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_gustav_dynamic_schemas_slug\` ON \`gustav_dynamic_schemas\` (\`slug\`)`);
        await queryRunner.query(`ALTER TABLE \`gustav_dynamic_records\` ADD CONSTRAINT \`FK_gustav_dynamic_records_schema_id\` FOREIGN KEY (\`schema_id\`) REFERENCES \`gustav_dynamic_schemas\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`gustav_page_components\` ADD CONSTRAINT \`FK_component_parent\` FOREIGN KEY (\`parent_id\`) REFERENCES \`gustav_page_components\`(\`id\`) ON DELETE CASCADE ON UPDATE RESTRICT`);
    }

}

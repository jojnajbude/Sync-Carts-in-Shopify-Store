import { MigrationInterface, QueryRunner } from "typeorm";

export class migrations1685455045580 implements MigrationInterface {
    name = 'migrations1685455045580'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "items" ADD "variant_title" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "items" DROP COLUMN "variant_title"`);
    }
}

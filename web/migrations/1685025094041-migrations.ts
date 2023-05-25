import { MigrationInterface, QueryRunner } from "typeorm";

export class migrations1685025094041 implements MigrationInterface {
    name = 'migrations1685025094041'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "analytics" DROP COLUMN "total_sales"`);
        await queryRunner.query(`ALTER TABLE "analytics" DROP COLUMN "locations"`);
        await queryRunner.query(`ALTER TABLE "analytics" DROP COLUMN "average_open_time"`);
        await queryRunner.query(`ALTER TABLE "analytics" DROP COLUMN "average_price"`);
        await queryRunner.query(`ALTER TABLE "analytics" DROP COLUMN "conversion_rates"`);
        await queryRunner.query(`ALTER TABLE "analytics" DROP COLUMN "device_statistic"`);
        await queryRunner.query(`ALTER TABLE "analytics" DROP COLUMN "top_sold"`);
        await queryRunner.query(`ALTER TABLE "analytics" DROP COLUMN "top_abandoned"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "os"`);
        await queryRunner.query(`ALTER TABLE "shops" ADD "email_domain" character varying`);
        await queryRunner.query(`ALTER TABLE "shops" ADD "domain_verified" json`);
        await queryRunner.query(`ALTER TABLE "analytics" ADD "type" character varying`);
        await queryRunner.query(`ALTER TABLE "analytics" ADD "value" json NOT NULL`);
        await queryRunner.query(`ALTER TABLE "analytics" ADD "date" TIMESTAMP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "carts" ADD "os" character varying`);
        await queryRunner.query(`ALTER TABLE "analytics" DROP CONSTRAINT "FK_aca1e7055002c464863b4b1557c"`);
        await queryRunner.query(`ALTER TABLE "analytics" DROP CONSTRAINT "REL_aca1e7055002c464863b4b1557"`);
        await queryRunner.query(`ALTER TABLE "analytics" ADD CONSTRAINT "FK_aca1e7055002c464863b4b1557c" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "analytics" DROP CONSTRAINT "FK_aca1e7055002c464863b4b1557c"`);
        await queryRunner.query(`ALTER TABLE "analytics" ADD CONSTRAINT "REL_aca1e7055002c464863b4b1557" UNIQUE ("shop_id")`);
        await queryRunner.query(`ALTER TABLE "analytics" ADD CONSTRAINT "FK_aca1e7055002c464863b4b1557c" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "carts" DROP COLUMN "os"`);
        await queryRunner.query(`ALTER TABLE "analytics" DROP COLUMN "date"`);
        await queryRunner.query(`ALTER TABLE "analytics" DROP COLUMN "value"`);
        await queryRunner.query(`ALTER TABLE "analytics" DROP COLUMN "type"`);
        await queryRunner.query(`ALTER TABLE "shops" DROP COLUMN "domain_verified"`);
        await queryRunner.query(`ALTER TABLE "shops" DROP COLUMN "email_domain"`);
        await queryRunner.query(`ALTER TABLE "customers" ADD "os" character varying`);
        await queryRunner.query(`ALTER TABLE "analytics" ADD "top_abandoned" json`);
        await queryRunner.query(`ALTER TABLE "analytics" ADD "top_sold" json`);
        await queryRunner.query(`ALTER TABLE "analytics" ADD "device_statistic" json`);
        await queryRunner.query(`ALTER TABLE "analytics" ADD "conversion_rates" json`);
        await queryRunner.query(`ALTER TABLE "analytics" ADD "average_price" json`);
        await queryRunner.query(`ALTER TABLE "analytics" ADD "average_open_time" json`);
        await queryRunner.query(`ALTER TABLE "analytics" ADD "locations" json`);
        await queryRunner.query(`ALTER TABLE "analytics" ADD "total_sales" json`);
    }

}

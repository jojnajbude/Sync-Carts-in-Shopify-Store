import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1683619416755 implements MigrationInterface {
    name = 'migration1683619416755'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "shops" ("id" SERIAL NOT NULL, "domain" character varying NOT NULL, "shopify_id" bigint NOT NULL, "email" character varying, "session" character varying, "currency" character varying, "plan" character varying NOT NULL DEFAULT 'free', "charge_id" bigint, "carts" integer NOT NULL DEFAULT '0', "limit" integer NOT NULL DEFAULT '50', "status" character varying NOT NULL DEFAULT 'active', "tutorial" boolean DEFAULT true, "priorities" json, "cart_reminder_html" json, "cart_updated_html" json, "expiring_soon_html" json, "expired_items_html" json, "cart_reminder_json" json, "cart_updated_json" json, "expiring_soon_json" json, "expired_items_json" json, CONSTRAINT "PK_3c6aaa6607d287de99815e60b96" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "analytics" ("id" SERIAL NOT NULL, "shop_id" integer NOT NULL, "total_sales" json, "locations" json, "average_open_time" json, "average_price" json, "conversion_rates" json, "device_statistic" json, "top_sold" json, "top_abandoned" json, CONSTRAINT "REL_aca1e7055002c464863b4b1557" UNIQUE ("shop_id"), CONSTRAINT "PK_3c96dcbf1e4c57ea9e0c3144bff" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "customers" ("id" SERIAL NOT NULL, "shop_id" integer NOT NULL, "name" character varying, "shopify_user_id" bigint NOT NULL, "priority" character varying NOT NULL DEFAULT 'normal', "email" character varying, "location" character varying, "os" character varying, CONSTRAINT "PK_133ec679a801fab5e070f73d3ea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "carts" ("id" SERIAL NOT NULL, "customer_id" integer, "shop_id" integer NOT NULL, "cart_token" character varying, "created_at" TIMESTAMP DEFAULT now(), "last_action" TIMESTAMP DEFAULT now(), "closed_at" TIMESTAMP, "final_price" numeric, CONSTRAINT "PK_b5f695a59f5ebb50af3c8160816" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "items" ("id" SERIAL NOT NULL, "variant_id" bigint NOT NULL, "qty" bigint NOT NULL, "cart_id" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "expire_at" TIMESTAMP NOT NULL, "status" character varying NOT NULL DEFAULT 'reserved', "price" character varying NOT NULL, "title" character varying, "image_link" character varying, "product_id" bigint, CONSTRAINT "PK_ba5885359424c15ca6b9e79bcf6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "analytics" ADD CONSTRAINT "FK_aca1e7055002c464863b4b1557c" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "customers" ADD CONSTRAINT "FK_1ca3d079cbf5aaa058e9385c272" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "carts" ADD CONSTRAINT "FK_5a9dade7a4baafc128f8e0d8041" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "carts" ADD CONSTRAINT "FK_8714d579c062406f39f59230b2a" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "items" ADD CONSTRAINT "FK_e18e87dca227ffef10b99c8dae3" FOREIGN KEY ("cart_id") REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "items" DROP CONSTRAINT "FK_e18e87dca227ffef10b99c8dae3"`);
        await queryRunner.query(`ALTER TABLE "carts" DROP CONSTRAINT "FK_8714d579c062406f39f59230b2a"`);
        await queryRunner.query(`ALTER TABLE "carts" DROP CONSTRAINT "FK_5a9dade7a4baafc128f8e0d8041"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP CONSTRAINT "FK_1ca3d079cbf5aaa058e9385c272"`);
        await queryRunner.query(`ALTER TABLE "analytics" DROP CONSTRAINT "FK_aca1e7055002c464863b4b1557c"`);
        await queryRunner.query(`DROP TABLE "items"`);
        await queryRunner.query(`DROP TABLE "carts"`);
        await queryRunner.query(`DROP TABLE "customers"`);
        await queryRunner.query(`DROP TABLE "analytics"`);
        await queryRunner.query(`DROP TABLE "shops"`);
    }

}

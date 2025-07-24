import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1747282198047 implements MigrationInterface {
    name = 'InitialSchema1747282198047'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "introduction" character varying(200)`);
        await queryRunner.query(`CREATE TYPE "public"."user_gender_enum" AS ENUM('male', 'female', 'other')`);
        await queryRunner.query(`ALTER TABLE "user" ADD "Gender" "public"."user_gender_enum" NOT NULL DEFAULT 'other'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "Gender"`);
        await queryRunner.query(`DROP TYPE "public"."user_gender_enum"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "introduction"`);
    }

}

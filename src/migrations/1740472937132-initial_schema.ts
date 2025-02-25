import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1740472937132 implements MigrationInterface {
    name = 'InitialSchema1740472937132'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "hash" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "hash"`);
    }

}

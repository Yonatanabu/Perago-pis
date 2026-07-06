import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSalaryColumn1782977057551 implements MigrationInterface {
    name = 'AddSalaryColumn1782977057551'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "positions_closure" DROP CONSTRAINT "FK_positions_closure_ancestor"`);
        await queryRunner.query(`ALTER TABLE "positions_closure" DROP CONSTRAINT "FK_positions_closure_descendant"`);
        await queryRunner.query(`ALTER TABLE "positions" RENAME COLUMN "testColumn" TO "salary"`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "photo" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "description" text NOT NULL, "filename" character varying NOT NULL, "views" double precision NOT NULL, "isPublished" boolean NOT NULL, CONSTRAINT "PK_723fa50bf70dcfd06fb5a44d4ff" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "positions" DROP COLUMN "salary"`);
        await queryRunner.query(`ALTER TABLE "positions" ADD "salary" integer DEFAULT '1000'`);
        await queryRunner.query(`CREATE INDEX "IDX_b55ad2b0e2b11b94e0b8a03f9d" ON "positions_closure" ("id_ancestor") `);
        await queryRunner.query(`CREATE INDEX "IDX_98261b5fa64b7a505c9d04994b" ON "positions_closure" ("id_descendant") `);
        await queryRunner.query(`ALTER TABLE "positions_closure" ADD CONSTRAINT "FK_b55ad2b0e2b11b94e0b8a03f9d5" FOREIGN KEY ("id_ancestor") REFERENCES "positions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "positions_closure" ADD CONSTRAINT "FK_98261b5fa64b7a505c9d04994b6" FOREIGN KEY ("id_descendant") REFERENCES "positions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "positions_closure" DROP CONSTRAINT "FK_98261b5fa64b7a505c9d04994b6"`);
        await queryRunner.query(`ALTER TABLE "positions_closure" DROP CONSTRAINT "FK_b55ad2b0e2b11b94e0b8a03f9d5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_98261b5fa64b7a505c9d04994b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b55ad2b0e2b11b94e0b8a03f9d"`);
        await queryRunner.query(`ALTER TABLE "positions" DROP COLUMN "salary"`);
        await queryRunner.query(`ALTER TABLE "positions" ADD "salary" character varying`);
        await queryRunner.query(`DROP TABLE "photo"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`ALTER TABLE "positions" RENAME COLUMN "salary" TO "testColumn"`);
        await queryRunner.query(`ALTER TABLE "positions_closure" ADD CONSTRAINT "FK_positions_closure_descendant" FOREIGN KEY ("id_descendant") REFERENCES "positions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "positions_closure" ADD CONSTRAINT "FK_positions_closure_ancestor" FOREIGN KEY ("id_ancestor") REFERENCES "positions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}

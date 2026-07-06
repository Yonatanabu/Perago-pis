import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreatePositions1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {

    // 1. Main positions table
    await queryRunner.createTable(
      new Table({
        name: "positions",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "name",
            type: "varchar",
          },
          {
            name: "description",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "parentId",
            type: "uuid",
            isNullable: true,
          },
        ],
        foreignKeys: [
          {
            columnNames: ["parentId"],
            referencedTableName: "positions",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
        ],
      }),
      true
    );

    // 2. Closure table (THIS makes it hierarchical)
    await queryRunner.query(`
      CREATE TABLE "positions_closure" (
        "id_ancestor" uuid NOT NULL,
        "id_descendant" uuid NOT NULL,
        CONSTRAINT "PK_positions_closure" PRIMARY KEY ("id_ancestor", "id_descendant"),
        CONSTRAINT "FK_positions_closure_ancestor"
          FOREIGN KEY ("id_ancestor") REFERENCES "positions"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_positions_closure_descendant"
          FOREIGN KEY ("id_descendant") REFERENCES "positions"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {

    await queryRunner.query(`DROP TABLE "positions_closure"`);

    await queryRunner.dropTable("positions");
  }
}
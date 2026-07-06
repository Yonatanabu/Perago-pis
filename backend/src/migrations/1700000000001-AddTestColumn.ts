import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddTestColumn1700000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "positions",
      new TableColumn({
        name: "testColumn",
        type: "varchar",
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("positions", "testColumn");
  }
}

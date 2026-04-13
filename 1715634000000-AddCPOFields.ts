import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCPOFields1715634000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" 
             ADD COLUMN "is_certified_pre_owned" boolean DEFAULT false,
             ADD COLUMN "battery_health" integer,
             ADD COLUMN "grading_data" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" 
             DROP COLUMN "is_certified_pre_owned",
             DROP COLUMN "battery_health",
             DROP COLUMN "grading_data"`,
    );
  }
}

-- DropForeignKey
ALTER TABLE "programme_vol" DROP CONSTRAINT "programme_vol_type_avion_id_fkey";

-- AlterTable
ALTER TABLE "programme_vol" ADD COLUMN     "type_avion_manual" TEXT,
ALTER COLUMN "type_avion_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "programme_vol" ADD CONSTRAINT "programme_vol_type_avion_id_fkey" FOREIGN KEY ("type_avion_id") REFERENCES "type_avion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "avitaillement" ADD COLUMN     "type_avion_manual" TEXT;

-- AddForeignKey
ALTER TABLE "avitaillement" ADD CONSTRAINT "avitaillement_type_avion_id_fkey" FOREIGN KEY ("type_avion_id") REFERENCES "type_avion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

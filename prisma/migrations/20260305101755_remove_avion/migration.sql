-- CreateEnum
CREATE TYPE "ProfilUtilisateur" AS ENUM ('AVITAILLEUR', 'SUPERVISEUR', 'DIRECTEUR', 'ADMINISTRATEUR');

-- CreateEnum
CREATE TYPE "EquipementType" AS ENUM ('BAC', 'CAMION');

-- CreateEnum
CREATE TYPE "VolStatut" AS ENUM ('PREVU', 'ARRIVE', 'PARTI', 'ANNULE');

-- CreateEnum
CREATE TYPE "MouvementType" AS ENUM ('RECEPTION', 'TRANSFERT_ENTREE', 'TRANSFERT_SORTIE', 'AVITAILLEMENT', 'AJUSTEMENT');

-- CreateEnum
CREATE TYPE "ReferenceType" AS ENUM ('RECEPTION', 'TRANSFERT', 'AVITAILLEMENT', 'AJUSTEMENT');

-- CreateTable
CREATE TABLE "compagnie_aerienne" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "code_iata" TEXT NOT NULL,
    "code_icao" TEXT NOT NULL,
    "pays" TEXT NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "compagnie_aerienne_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aeroport" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "ville" TEXT NOT NULL,
    "pays" TEXT NOT NULL,
    "code_iata" TEXT NOT NULL,
    "code_icao" TEXT NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "aeroport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "type_avion" (
    "id" SERIAL NOT NULL,
    "constructeur" TEXT NOT NULL,
    "modele" TEXT NOT NULL,
    "code_iata" TEXT NOT NULL,
    "code_icao" TEXT NOT NULL,
    "capacite_reservoir" INTEGER NOT NULL,

    CONSTRAINT "type_avion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipement_stockage" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "type_equipement" "EquipementType" NOT NULL,
    "capacite_maximale" INTEGER NOT NULL,
    "stock_initial" INTEGER NOT NULL,
    "seuil_alerte" INTEGER NOT NULL DEFAULT 0,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "date_derniere_maintenance" TIMESTAMP(3),
    "date_prochaine_maintenance" TIMESTAMP(3),

    CONSTRAINT "equipement_stockage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_maintenance" (
    "id" SERIAL NOT NULL,
    "equipement_id" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "intervenant" TEXT,
    "cout" DECIMAL(10,2),

    CONSTRAINT "journal_maintenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utilisateur" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT NOT NULL,
    "profil" "ProfilUtilisateur" NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "utilisateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_systeme" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'warning',
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "equipement_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_systeme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programme_vol" (
    "id" SERIAL NOT NULL,
    "numero_vol" TEXT NOT NULL,
    "compagnie_id" INTEGER NOT NULL,
    "immatriculation" TEXT NOT NULL,
    "type_avion_id" INTEGER NOT NULL,
    "aeroport_arrivee_id" INTEGER NOT NULL,
    "aeroport_depart_id" INTEGER NOT NULL,
    "date_programmee" DATE NOT NULL,
    "heure_arrivee_prevue" TIMESTAMP(3) NOT NULL,
    "heure_depart_prevue" TIMESTAMP(3) NOT NULL,
    "statut" "VolStatut" NOT NULL DEFAULT 'PREVU',
    "quantite_prevue" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "programme_vol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reception_carburant" (
    "id" SERIAL NOT NULL,
    "fournisseur" TEXT NOT NULL,
    "depot_chargement" TEXT,
    "reference_bon_livraison" TEXT NOT NULL,
    "quantite_recue" INTEGER NOT NULL,
    "densite" DECIMAL(65,30) NOT NULL,
    "temperature" DECIMAL(65,30) NOT NULL,
    "equipement_destination_id" INTEGER NOT NULL,
    "date_reception" TIMESTAMP(3) NOT NULL,
    "document_justificatif" TEXT,

    CONSTRAINT "reception_carburant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transfert_carburant" (
    "id" SERIAL NOT NULL,
    "equipement_source_id" INTEGER NOT NULL,
    "equipement_destination_id" INTEGER NOT NULL,
    "quantite_transferee" INTEGER NOT NULL,
    "reference_transfert" TEXT NOT NULL,
    "operateur_id" INTEGER,
    "date_transfert" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transfert_carburant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avitaillement" (
    "id" SERIAL NOT NULL,
    "programme_vol_id" INTEGER NOT NULL,
    "camion_id" INTEGER NOT NULL,
    "quantite_livree" INTEGER NOT NULL,
    "compteur_avant" BIGINT NOT NULL,
    "compteur_apres" BIGINT NOT NULL,
    "numero_bon_livraison" TEXT NOT NULL,
    "operateur_id" INTEGER,
    "date_operation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "immatriculation" TEXT,
    "type_avion_id" INTEGER,
    "route_from" TEXT,
    "route_to" TEXT,
    "supplied_to" TEXT,

    CONSTRAINT "avitaillement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mouvement_stock" (
    "id" SERIAL NOT NULL,
    "equipement_id" INTEGER NOT NULL,
    "type_mouvement" "MouvementType" NOT NULL,
    "quantite" INTEGER NOT NULL,
    "reference_type" "ReferenceType" NOT NULL,
    "reference_id" INTEGER NOT NULL,
    "date_mouvement" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mouvement_stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jaugeage" (
    "id" SERIAL NOT NULL,
    "equipement_id" INTEGER NOT NULL,
    "date_jaugeage" DATE NOT NULL,
    "valeur_dip_mm" DECIMAL(65,30) NOT NULL,
    "temperature" DECIMAL(65,30) NOT NULL,
    "volume_mesure" INTEGER NOT NULL,
    "stock_theorique" INTEGER NOT NULL,
    "ecart" INTEGER NOT NULL,
    "controleur_id" INTEGER,

    CONSTRAINT "jaugeage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rapport_stock_journalier" (
    "id" SERIAL NOT NULL,
    "date_rapport" DATE NOT NULL,
    "equipement_id" INTEGER NOT NULL,
    "stock_ouverture" INTEGER NOT NULL,
    "stock_entree" INTEGER NOT NULL,
    "stock_sortie" INTEGER NOT NULL,
    "stock_theorique" INTEGER NOT NULL,
    "volume_mesure" INTEGER NOT NULL,
    "ecart" INTEGER NOT NULL,

    CONSTRAINT "rapport_stock_journalier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prog_carburant_journalier" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "stock_total_ouverture" INTEGER NOT NULL,
    "stock_securite" INTEGER NOT NULL,
    "stock_disponible" INTEGER NOT NULL,

    CONSTRAINT "prog_carburant_journalier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prevision_vol" (
    "id" SERIAL NOT NULL,
    "programme_journalier_id" INTEGER NOT NULL,
    "programme_vol_id" INTEGER NOT NULL,
    "quantite_prevue" INTEGER NOT NULL,

    CONSTRAINT "prevision_vol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_journaliere" (
    "id" SERIAL NOT NULL,
    "programme_vol_id" INTEGER NOT NULL,
    "quantite_prevue" INTEGER NOT NULL,
    "quantite_reelle" INTEGER NOT NULL,
    "ecart" INTEGER NOT NULL,
    "pourcentage_ecart" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "performance_journaliere_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commentaire_comparaison" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "compagnie_id" INTEGER NOT NULL,
    "commentaire" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commentaire_comparaison_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parametre_systeme" (
    "id" SERIAL NOT NULL,
    "cle" TEXT NOT NULL,
    "valeur" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parametre_systeme_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "compagnie_aerienne_code_iata_key" ON "compagnie_aerienne"("code_iata");

-- CreateIndex
CREATE UNIQUE INDEX "aeroport_code_iata_key" ON "aeroport"("code_iata");

-- CreateIndex
CREATE UNIQUE INDEX "utilisateur_email_key" ON "utilisateur"("email");

-- CreateIndex
CREATE UNIQUE INDEX "reception_carburant_reference_bon_livraison_key" ON "reception_carburant"("reference_bon_livraison");

-- CreateIndex
CREATE UNIQUE INDEX "avitaillement_numero_bon_livraison_key" ON "avitaillement"("numero_bon_livraison");

-- CreateIndex
CREATE UNIQUE INDEX "performance_journaliere_programme_vol_id_key" ON "performance_journaliere"("programme_vol_id");

-- CreateIndex
CREATE UNIQUE INDEX "commentaire_comparaison_date_compagnie_id_key" ON "commentaire_comparaison"("date", "compagnie_id");

-- CreateIndex
CREATE UNIQUE INDEX "parametre_systeme_cle_key" ON "parametre_systeme"("cle");

-- AddForeignKey
ALTER TABLE "journal_maintenance" ADD CONSTRAINT "journal_maintenance_equipement_id_fkey" FOREIGN KEY ("equipement_id") REFERENCES "equipement_stockage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_systeme" ADD CONSTRAINT "notification_systeme_equipement_id_fkey" FOREIGN KEY ("equipement_id") REFERENCES "equipement_stockage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programme_vol" ADD CONSTRAINT "programme_vol_aeroport_arrivee_id_fkey" FOREIGN KEY ("aeroport_arrivee_id") REFERENCES "aeroport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programme_vol" ADD CONSTRAINT "programme_vol_aeroport_depart_id_fkey" FOREIGN KEY ("aeroport_depart_id") REFERENCES "aeroport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programme_vol" ADD CONSTRAINT "programme_vol_type_avion_id_fkey" FOREIGN KEY ("type_avion_id") REFERENCES "type_avion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programme_vol" ADD CONSTRAINT "programme_vol_compagnie_id_fkey" FOREIGN KEY ("compagnie_id") REFERENCES "compagnie_aerienne"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reception_carburant" ADD CONSTRAINT "reception_carburant_equipement_destination_id_fkey" FOREIGN KEY ("equipement_destination_id") REFERENCES "equipement_stockage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfert_carburant" ADD CONSTRAINT "transfert_carburant_equipement_destination_id_fkey" FOREIGN KEY ("equipement_destination_id") REFERENCES "equipement_stockage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfert_carburant" ADD CONSTRAINT "transfert_carburant_equipement_source_id_fkey" FOREIGN KEY ("equipement_source_id") REFERENCES "equipement_stockage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfert_carburant" ADD CONSTRAINT "transfert_carburant_operateur_id_fkey" FOREIGN KEY ("operateur_id") REFERENCES "utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avitaillement" ADD CONSTRAINT "avitaillement_camion_id_fkey" FOREIGN KEY ("camion_id") REFERENCES "equipement_stockage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avitaillement" ADD CONSTRAINT "avitaillement_programme_vol_id_fkey" FOREIGN KEY ("programme_vol_id") REFERENCES "programme_vol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avitaillement" ADD CONSTRAINT "avitaillement_operateur_id_fkey" FOREIGN KEY ("operateur_id") REFERENCES "utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mouvement_stock" ADD CONSTRAINT "mouvement_stock_equipement_id_fkey" FOREIGN KEY ("equipement_id") REFERENCES "equipement_stockage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jaugeage" ADD CONSTRAINT "jaugeage_equipement_id_fkey" FOREIGN KEY ("equipement_id") REFERENCES "equipement_stockage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jaugeage" ADD CONSTRAINT "jaugeage_controleur_id_fkey" FOREIGN KEY ("controleur_id") REFERENCES "utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rapport_stock_journalier" ADD CONSTRAINT "rapport_stock_journalier_equipement_id_fkey" FOREIGN KEY ("equipement_id") REFERENCES "equipement_stockage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prevision_vol" ADD CONSTRAINT "prevision_vol_programme_journalier_id_fkey" FOREIGN KEY ("programme_journalier_id") REFERENCES "prog_carburant_journalier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prevision_vol" ADD CONSTRAINT "prevision_vol_programme_vol_id_fkey" FOREIGN KEY ("programme_vol_id") REFERENCES "programme_vol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_journaliere" ADD CONSTRAINT "performance_journaliere_programme_vol_id_fkey" FOREIGN KEY ("programme_vol_id") REFERENCES "programme_vol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commentaire_comparaison" ADD CONSTRAINT "commentaire_comparaison_compagnie_id_fkey" FOREIGN KEY ("compagnie_id") REFERENCES "compagnie_aerienne"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

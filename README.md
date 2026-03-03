# SIGA — Système Intégré de Gestion d’Avitaillement

Bienvenue dans l'application SIGA. Pour garantir l'intégrité des calculs de stocks et la cohérence des rapports, il est crucial de suivre un ordre précis pour le premier paramétrage et l'utilisation quotidienne.

## 🚀 Ordre de Saisie des Données (Workflow)

Pour qu'un rapport de vente soit complet, les données doivent être renseignées dans l'ordre suivant :

### 1. Le Référentiel (Configuration Initiale)
Avant toute opération, configurez les bases de données "maîtres" sous le menu **Référentiel** :
1.  **Aéroports** : Enregistrez les codes IATA/ICAO des destinations.
2.  **Compagnies** : Ajoutez les compagnies aériennes clientes.
3.  **Types d'Avions** : Définissez les constructeurs, modèles et capacités de réservoirs.
4.  **Avions** : Enregistrez les immatriculations en les liant à une compagnie et un type d'avion.
5.  **Équipements** : Enregistrez vos **Cuves** et vos **Camions**. 
    > [!IMPORTANT]  
    > Renseignez bien le **Stock Initial** pour chaque équipement lors de la création. C'est ce chiffre qui servira de base pour le premier compteur.

### 2. Logistique (Gestion des Stocks)
Une fois le référentiel prêt :
1.  **Réceptions** : Enregistrez les livraisons de carburant reçues des fournisseurs (remplit vos cuves).
2.  **Transferts** : Enregistrez les transferts de carburant des **Cuves** vers les **Camions**. 
    *   Cela met à jour la quantité disponible dans le camion pour les futures ventes.

### 3. Exploitation (Opérations de Piste)
C'est le cœur de l'activité quotidienne :
1.  **Programme de Vol** : Saisissez les vols prévus pour la journée.
    *   **Prévision (Nouveau)** : Renseignez le volume de carburant estimé nécessaire. Cette donnée alimente vos graphiques de performance.
2.  **Avitaillement (Vente)** : Enregistrez l'opération réelle.
    *   Sélectionnez le vol dans la liste.
    *   Le système compare automatiquement la saisie réelle à votre prévision.

### 4. Rapports & Analytics
*   **Rapport de Vente** : Consultez la vue consolidée et exportez en Excel pour la facturation.
*   **Analyse & Performance** : Suivez les KPIs et l'évolution des stocks graphiquement.

---

## 🛠️ Règles de Gestion à retenir
*   **Compteurs** : Le compteur "Avant" d'une vente est TOUJOURS égal au compteur "Après" de la vente précédente du même camion. Aucun saut n'est autorisé.
*   **Stocks** : Un avitaillement ne peut pas être validé si le camion n'a pas assez de carburant (vérifiez vos transferts).
*   **Exports** : Tous les tableaux sont exportables en Excel via le bouton **Exporter**.

---

## 💻 Installation Technique (Développeurs)
1. `npm install`
2. Configurez le `DATABASE_URL` dans le fichier `.env`.
3. `npx prisma db push`
4. `npm run dev`

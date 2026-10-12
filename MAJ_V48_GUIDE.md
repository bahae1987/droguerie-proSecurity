# DrogueriePro — MAJ V48

Mise à jour de la V47 : tous les modules existants sont conservés.

## Nouveautés

### Sécurité et fiabilité
- **Mots de passe chiffrés (bcrypt).** Ils ne sont plus lisibles dans la table `users`.
- **Sessions serveur de 7 jours.** La déconnexion ferme la session côté base.
- **Bouton « Mon mot de passe »** pour que chaque utilisateur change le sien.
- **Base protégée (RLS).** Sans connexion, la clé publique ne donne accès à rien. Chaque utilisateur ne voit que sa droguerie (l'administrateur voit tout), et chaque écriture vérifie les droits du profil.
- **Stock et numérotation atomiques.** Deux ventes simultanées ne peuvent pas vendre le même dernier article, et deux factures ne peuvent pas recevoir le même numéro.

### Ventes
- **Caisse rapide** (menu « Caisse rapide ») :
  - recherche, ou scan par douchette USB ou caméra du téléphone ;
  - panier avec remises par ligne ou remise globale ;
  - modes de paiement : espèces (avec monnaie à rendre), carte, chèque, virement, crédit ;
  - ticket 80 mm et réimpression du dernier ticket ;
  - raccourcis clavier : F2 recherche, F9 valider.
- **Avoirs clients et retours fournisseurs** depuis une facture :
  - retour en stock en option ;
  - montant imputé automatiquement sur la facture ;
  - suppression de l'avoir = tout est remis en état.
- **Remise % par ligne** sur tous les documents.
- **Prix gros / détail** : un client « gros » reçoit automatiquement le prix gros.
- **Plafond de crédit par client.** Une facture qui le dépasse est bloquée. Un gérant ou l'administrateur peut forcer.
- **Partage des documents** depuis l'aperçu :
  - PDF ;
  - WhatsApp (au numéro du client) ;
  - e-mail ;
  - sur téléphone, partage natif avec le PDF joint.

### Stock
- **Code-barres** sur la fiche produit, et recherche par code-barres.
- **Inventaire physique** (Produits → Inventaire) :
  - comptage manuel ou par scan, conservé sur l'appareil jusqu'à la validation ;
  - écarts valorisés au PMP ;
  - validation = mouvements de stock tracés « Inventaire » ;
  - historique imprimable.
- **Réapprovisionner** (Produits → Réapprovisionner) :
  - propose les produits sous le stock minimum, en tenant compte des commandes clients en cours et des commandes fournisseurs déjà passées ;
  - crée une commande fournisseur par fournisseur ;
  - nouveau champ « Fournisseur principal » sur la fiche produit.
- **Import Excel** (.xlsx ou .csv) des produits, clients et fournisseurs :
  - modèle téléchargeable ;
  - aperçu avec les erreurs avant tout enregistrement ;
  - mise à jour des produits existants (même référence) ;
  - stock initial au coût indiqué pour les nouveaux produits.

### Caisse
- **Clôture de caisse journalière** (Paiements → Clôture de caisse) :
  - totaux du jour par mode de paiement ;
  - fond de caisse ;
  - espèces attendues comparées aux espèces comptées (comptage par billets et pièces possible) ;
  - écart ;
  - ticket Z imprimé ;
  - une seule clôture par jour et par droguerie, que seul un gérant ou l'administrateur peut corriger.

## Déploiement (dans cet ordre)

1. **GitHub.** Remplacez ces fichiers puis poussez. Vercel redéploie tout seul.
   - `frontend/src/main.jsx`
   - `frontend/package.json` et `frontend/package-lock.json` (nouvelles librairies : exceljs, jspdf, html2canvas)

   Cette version fonctionne aussi avec l'ancienne base : rien ne casse entre l'étape 1 et l'étape 2.
2. **Supabase → SQL Editor.** Exécutez `MAJ_V48_SUPABASE.sql`, une seule fois.
   - Le script est relançable sans risque.
   - Il ne supprime aucune donnée.
   - Les mots de passe actuels sont conservés (chiffrés).
3. **Tous les utilisateurs se reconnectent.** Les anciennes sessions ne sont plus acceptées.
4. **Application mobile.** `mobile/App.js` est mis à jour. Il faut regénérer l'APK (Expo), car l'ancienne application mobile ne pourra plus lire la base protégée.

Nouvelle installation : `SETUP_COMPLET_SUPABASE.sql` contient désormais la V47 et la V48 (partie F).

### En cas de blocage
`ROLLBACK_SECURITE_V48.sql` désactive immédiatement la protection RLS. La connexion sécurisée et les mots de passe chiffrés restent en place. Pour réactiver la protection, relancez `MAJ_V48_SUPABASE.sql`.

### À savoir
- **Fichiers joints (Storage).** Le bucket `attachments` garde sa règle actuelle. La protection RLS V48 couvre les tables, pas les fichiers.
- **Caméra de la caisse.** Elle fonctionne sur Chrome Android. Sur ordinateur, utilisez une douchette USB : elle agit comme un clavier.
- **WhatsApp sur ordinateur.** Le PDF est téléchargé et WhatsApp s'ouvre avec le message prêt : il reste à glisser le PDF dans la conversation. Sur téléphone, le PDF est joint directement.

## Tests réalisés
Les tests ont tourné sur une copie locale identique à Supabase (PostgreSQL 16, PostgREST, supabase-js), avec la base démo.

| Domaine testé | Résultat |
|---|---|
| Sécurité : accès anonyme, cloisonnement, droits, concurrence (10 ventes simultanées sur 5 en stock), numérotation | 35/35 |
| Moteur documentaire : PMP, réservations, facturation partielle, suppression, transferts | 17/17 |
| Fonctions V48 : remises, plafond, avoirs, retours, inventaire, import, clôture, réappro, partage | 30/30 |
| Profil vendeur | 4/4 |
| Ancienne base, avant le script V48 | 15/15 |
| Interface dans un vrai navigateur (FR et AR) : caisse, inventaire, import, réappro, clôture, PDF | 13/13 |

Le build de production Vite est OK. Les librairies lourdes (Excel, PDF) ne sont chargées qu'au moment où on les utilise.

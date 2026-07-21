// ============================================================
//  Configuration Firebase (synchronisation temps réel)
// ============================================================
//
//  Tant que ce fichier est vide, l'app utilise la synchro simple
//  par lien (sans compte). Pour activer la vraie synchro temps réel :
//
//  1. Va sur https://console.firebase.google.com → "Ajouter un projet"
//     (nom au choix, ex. "semaine"). Tu peux désactiver Google Analytics.
//  2. Dans le projet : menu de gauche → "Firestore Database" →
//     "Créer une base de données" → mode "production" → région "europe-west".
//  3. Onglet "Règles" de Firestore, remplace tout par :
//
//        rules_version = '2';
//        service cloud.firestore {
//          match /databases/{database}/documents {
//            match /spaces/{spaceId} {
//              allow read, write: if true;
//            }
//          }
//        }
//
//     puis "Publier".
//  4. Roue crantée (Paramètres du projet) → onglet "Général" →
//     section "Vos applications" → icône Web "</>" → donne un surnom →
//     "Enregistrer l'application". Firebase affiche un objet
//     "const firebaseConfig = { ... }".
//  5. Recopie les valeurs de cet objet ci-dessous, puis enregistre.
//
//  (Le spaceId fait office de clé privée entre vous deux : ne partagez
//   le lien d'invitation qu'entre vos deux téléphones.)
// ============================================================

window.FIREBASE_CONFIG = {
  // apiKey: "...",
  // authDomain: "...",
  // projectId: "...",
  // storageBucket: "...",
  // messagingSenderId: "...",
  // appId: "...",
};

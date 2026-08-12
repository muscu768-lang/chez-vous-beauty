# Edito Beauty Connect

Voici le prompt révisé que vous pouvez copier-coller. Il est conçu pour être l'instruction initiale complète pour votre agent IA :

Contexte du Projet : Nous construisons « Edito », une application mobile native (style Uber pour Esthéticiennes/Manucures/Épilation), de A à Z.Stack Technique Obligatoire : Backend (Express/Node.js, PostgreSQL), Frontend (Expo/React Native), Real-time (Socket.io).Ressources Visuelles de Référence : Utilisez les images image_0.png, image_1.png, image_2.png, et image_3.png comme spécifications de design finales et de parcours utilisateur à recréer, pas comme des états actuels à corriger.

Priorités de Développement :

📋 PHASE 1 : SPÉCIFICATIONS ET CONCEPTION (Jour 1)

Tâche 1.1 : Document de Référence (PRD.md). Générer un Product Requirements Document complet. Inclure tous les parcours utilisateurs (recherche, réservation, paiement, chat, profil, historique, gestion des esthéticiennes).

Tâche 1.2 : Schéma de Base de Données (PostgreSQL). Concevoir et implémenter le schéma complet (tables : Users, Estheticians, Bookings, Services, Portfolios, Reviews, Chats, Payments). Référence : le schéma d'exemple en bas de l'image.

Tâche 1.3 : Wireframes et UI/UX. Documenter l'intégralité du design pour qu'il corresponde parfaitement à l'esthétique éditoriale minimale (polices, couleurs, espacement) des images de référence.

🔧 PHASE 2 : DÉVELOPPEMENT BACKEND (Jours 2-4)

Tâche 2.1 : Serveur et API. Configurer le serveur Express. Implémenter l'authentification sécurisée (JWT).

Tâche 2.2 : Points de Terminaison (Endpoints). Créer tous les endpoints API (C.R.U.D.) : Profils clients et esthéticiennes, Recherche avancée avec filtres (type de service, lieu), Gestion complexe des réservations (confirmation, annulation), Historique des paiements (intégration Stripe), Système d'avis et de portfolio.

Tâche 2.3 : Messagerie (Socket.io). Intégrer la logique de messagerie en temps réel pour le chat client/esthéticienne.

🎨 PHASE 3 : DÉVELOPPEMENT FRONTEND (Jours 4-7)

Tâche 3.1 : Écrans Centraux. Recréer exactement les interfaces suivantes :

Découverte (image_0) : Recherche avec filtres et cartes esthéticiennes fonctionnelles.

Gestion des Réservations (image_1) : Affichage interactif des statuts (Confirmée, Annulée, Payée).

Profil Utilisateur (image_2) : Formulaires complets pour les infos, les paiements, les adresses.

Portfolio Esthéticienne (image_3) : Vue complète avec bio, portfolio, liste de services interactifs, et bouton de réservation direct.

Tâche 3.2 : Logique Métier. Implémenter le flux de réservation complet (sélection, paiement, confirmation) en reliant le frontend aux API backend. Rendre le chat fonctionnel.

🧪 PHASE 4 : TESTS ET DÉPLOIEMENT (Jours 7-8)

Tâche 4.1 : Tests Automatisés. Générer et exécuter des tests unitaires et de bout en bout (E2E) pour valider tous les parcours clés.

Tâche 4.2 : Validation de Bout en Bout. Faire examiner tous les parcours par un "Testing Agent" pour corriger les bugs finaux d'intégration.

Tâche 4.3 : Préparation du Déploiement. Documenter le processus de déploiement sur les App Stores.

Directives Globales :

Focus absolu sur la qualité, la performance et le respect strict du design minimaliste. Assurer une expérience fluide de A à Z. C'est un MVP de production, pas un prototype.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://chez-vous-beauty.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/dc484aaf-18f9-4812-ac27-079e2919b7ae).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

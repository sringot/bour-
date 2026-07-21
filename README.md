# Semaine

Petit planning hebdomadaire, minimaliste et sans compte. Une page web statique pensée pour iPhone : on ajoute des créneaux dans la semaine, c'est tout.

## Fonctionnalités

- Vue semaine (lundi → dimanche), swipe entre les semaines, vue "À venir" groupée par jour
- Ajout / édition / suppression de créneaux (titre, heures, note, couleur) avec mini-avatar du créateur
- Liste d'envies sans date, transformables en plan daté
- Onboarding : prénom + créateur d'avatar personnalisable (SVG)
- Synchronisation automatique entre deux téléphones via un lien d'invitation
- Notifications quand l'autre ajoute quelque chose
- Design type iOS : mode clair/sombre automatique, barres en verre dépoli, animations spring
- Données stockées en local (localStorage), synchro via un espace JSON partagé
- PWA : installable sur l'écran d'accueil, fonctionne hors-ligne

## Mise en ligne (GitHub Pages)

1. Sur GitHub : **Settings → Pages → Source : Deploy from a branch**, choisir la branche `main` (une fois cette branche fusionnée) et le dossier `/ (root)`.
2. L'app sera disponible sur `https://<utilisateur>.github.io/<repo>/`.

## Installation sur iPhone

1. Ouvrir l'URL dans Safari.
2. Bouton **Partager** → **Sur l'écran d'accueil**.
3. L'app s'ouvre ensuite en plein écran, comme une app native.

> Les données sont stockées localement sur chaque téléphone : chaque personne a son propre planning sur son appareil.

## Développement

Aucune dépendance, aucun build :

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

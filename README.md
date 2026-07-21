# Semaine

Petit planning hebdomadaire, minimaliste et sans compte. Une page web statique pensée pour iPhone : on ajoute des créneaux dans la semaine, c'est tout.

## Fonctionnalités

- Vue semaine (lundi → dimanche), navigation entre les semaines
- Ajout / édition / suppression de créneaux (titre, heures, note, couleur)
- Points sous les jours qui contiennent quelque chose
- Données stockées en local sur le téléphone (localStorage), aucun serveur
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

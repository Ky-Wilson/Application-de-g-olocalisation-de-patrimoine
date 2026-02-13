# Application-de-g-olocalisation-de-patrimoine
plateforme permettant de recenser et visualiser les éléments du patrimoine (monuments, bâtiments historiques, sites culturels, etc.) sur une carte

# GeoPatrimoine

Application web de géolocalisation des éléments du patrimoine (monuments, musées, sites naturels, bâtiments historiques, etc.) avec visualisation cartographique et recherche par proximité.

## Description

GeoPatrimoine permet :

* L’enregistrement de sites patrimoniaux avec coordonnées GPS
* L’affichage des sites sur une carte interactive
* La recherche de sites par ville ou par type
* La recherche de sites à proximité d’une position donnée (rayon en kilomètres)

---

# Stack Technique

## Backend

* Laravel 12
* API REST
* Eloquent ORM

## Frontend

* React (via Inertia.js)
* React-Leaflet
* OpenStreetMap

## Base de données

* MySQL (version finale)
* PostgreSQL envisagé initialement


# Choix techniques

## 🗺 Pourquoi Leaflet + OpenStreetMap ?

* Open source
* Pas besoin de clé API
* Léger et performant
* Intégration simple avec React

---

## 🗄 Pourquoi PostgreSQL au départ ?

La première version du projet a été conçue avec PostgreSQL dans l’optique d’utiliser PostGIS.

### Pourquoi ce choix était pertinent :

* Support natif des types géospatiaux (`geometry`, `geography`)
* Fonctions avancées : `ST_DWithin`, `ST_Distance`
* Index spatiaux performants (GiST)
* Optimisé pour les calculs géographiques sur gros volumes de données
* Standard dans les applications SIG professionnelles

Dans un contexte réel (collectivité avec plusieurs milliers de sites), PostGIS aurait permis :

* Des recherches de proximité ultra rapides
* Une meilleure scalabilité
* Des requêtes géographiques optimisées en base

---

## Pourquoi passage à MySQL ?

Finalement, le projet a été migré vers MySQL pour deux raisons :

1. Le volume de données est faible (moins de 100 enregistrements)
2. L’hébergeur de test ne supportait que MySQL

Dans ce contexte :

* La formule de Haversine est suffisante
* Les performances restent très bonnes
* L’architecture reste évolutive (migration vers PostgreSQL possible ultérieurement)

---

## Recherche par proximité

La recherche par proximité est basée sur la formule de Haversine :


#  Installation

##  Cloner le projet

```bash
git clone git@github.com:Ky-Wilson/Application-de-g-olocalisation-de-patrimoine.git
cd Application-de-g-olocalisation-de-patrimoine
```

---

## Installer les dépendances

Backend :

```bash
composer install
```

Frontend :

```bash
npm install
```

---

## Configuration environnement

Copier le fichier `.env` :

```bash
cp .env.example .env
```

Configurer la base de données :

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=geopatrimoine
DB_USERNAME=root
DB_PASSWORD=
```

---

## 4️⃣ Générer la clé d’application

```bash
php artisan key:generate
```

---

##  Migration de la base

```bash
php artisan migrate
```

---

##  (Optionnel) Seeder

```bash
php artisan db:seed
```

---

#  Lancement du projet

## Backend

```bash
php artisan serve
```

Accessible sur :

```
http://127.0.0.1:8000
```

---

## Frontend (Vite)

```bash
npm run dev
```

---

#  Endpoints API

| Méthode | Endpoint             | Description             |
| ------- | -------------------- | ----------------------- |
| GET     | /api/v1/sites        | Liste des sites         |
| POST    | /api/v1/sites        | Ajouter un site         |
| GET     | /api/v1/sites/{id}   | Détail d’un site        |
| PUT     | /api/v1/sites/{id}   | Modifier                |
| DELETE  | /api/v1/sites/{id}   | Supprimer               |
| GET     | /api/v1/sites/nearby | Recherche par proximité |

Exemple :

```
GET /api/v1/sites/nearby?lat=5.35&lng=-4.01&radius=10
```

---

# 🏗 Architecture

* MVC (Laravel)
* API REST versionnée (`/api/v1`)
* Validation côté backend
* Interface SPA via Inertia
* Séparation logique backend/frontend

---

# Améliorations possibles

* Passage à PostgreSQL + PostGIS en production
* Ajout d’authentification
* Upload d’images (au lieu d’URL)
* Pagination API
* Indexation géospatiale
* Cache des requêtes

---

# Conclusion

GeoPatrimoine propose une architecture moderne, évolutive et adaptée au contexte.

Le choix initial de PostgreSQL/PostGIS démontre une anticipation des problématiques de scalabilité géographique, tandis que la migration vers MySQL répond aux contraintes réelles d’hébergement et au volume de données actuel.

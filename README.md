# GeoPatrimoine CI - Application de Géolocalisation du Patrimoine

Application web permettant de recenser, visualiser et rechercher les sites patrimoniaux de Côte d'Ivoire sur une carte interactive avec recherche par proximité GPS.

##  Informations du Projet

 Repository Git : [https://github.com/Ky-Wilson/Application-de-geolocalisation-de-patrimoine](https://github.com/Ky-Wilson/Application-de-geolocalisation-de-patrimoine)

 Temps de développement : ~4 heures

 Résumé de l'approche technique :

J'ai opté pour une stack moderne Laravel 11 + React + Inertia.js pour créer une SPA fluide sans complexité d'API séparée. Le choix initial de PostgreSQL/PostGIS visait à anticiper la scalabilité géographique (index spatiaux, fonctions ST_Distance natives),
 mais j'ai migré vers MySQL pour des raisons pragmatiques (hébergement test, volume de données <100 sites). 
 La formule de Haversine côté application reste performante à cette échelle. 
 L'interface utilise React-Leaflet avec OpenStreetMap (gratuit, sans clé API) et intègre une géolocalisation automatique via l'API Nominatim. 
 Le design aux couleurs du drapeau ivoirien (orange/blanc/vert). 
 L'architecture MVC propre permet une migration future vers PostGIS si le volume dépasse 5000 sites.

---

##  Aperçu

Application permettant :
-  Enregistrement de sites patrimoniaux avec coordonnées GPS
-  Visualisation sur carte interactive (Leaflet + OpenStreetMap)
-  Recherche par ville, type ou texte libre
-  Recherche par proximité GPS (rayon configurable)
-  Sélection visuelle des coordonnées sur la carte
-  Détection automatique de la ville via géocodage inverse
-  Design responsive aux couleurs du drapeau ivoirien
-  Pagination (20 sites/page)



## 🛠 Stack Technique

### Backend
- Laravel 11 - Framework PHP moderne
- API REST versionnée (`/api/v1`)
- Eloquent ORM - Gestion élégante des données
- MySQL - Base de données relationnelle

### Frontend
- React 18 - Bibliothèque UI moderne
- Inertia.js - Bridge Laravel ↔ React (SPA sans API séparée)
- TypeScript - Typage fort
- Tailwind CSS - Styling utility-first
- React-Leaflet - Cartes interactives
- OpenStreetMap - Tuiles cartographiques gratuites
- Font Awesome - Icônes

### Cartographie
- Leaflet - Bibliothèque JS open-source
- Nominatim API - Géocodage inverse (coordonnées → ville)
- Formule de Haversine - Calcul de distance GPS

---

## Choix Techniques Détaillés

### 🗄 PostgreSQL → MySQL : Pourquoi ?

#### Choix initial : PostgreSQL + PostGIS

Le projet a été initialement conçu avec PostgreSQL et l'extension PostGIS pour :

Avantages de PostGIS :
- Extension géospatiale native (`geography`, `geometry`)
- Fonctions optimisées : `ST_Distance`, `ST_DWithin`, `ST_Buffer`
- Index spatiaux (GiST) ultra-performants
- Standards OGC (Open Geospatial Consortium)
- Requêtes géographiques complexes (polygones, intersections)

Cas d'usage idéal :
- Gros volumes (>5000 sites)
- Requêtes géospatiales complexes
- Calculs géométriques avancés
- Applications SIG professionnelles

#### Migration vers MySQL

Raisons pragmatiques :
1. Hébergement test : Support MySQL uniquement
2. Volume de données : <100 sites (formule Haversine suffisante)
3. Simplicité : Un seul besoin géospatial (recherche par proximité)

Performances comparées :
- <1000 sites : Différence négligeable
- 1000-5000 sites : MySQL ralentit légèrement
- >5000 sites : PostGIS nettement supérieur

Architecture évolutive :
La migration future vers PostGIS reste possible si nécessaire (logique métier isolée).

---

### 🗺 Formule de Haversine

Calcul de distance entre deux points GPS :

```javascript
distance = 6371 * acos(
    cos(radians(lat1)) * cos(radians(lat2)) * 
    cos(radians(lng2) - radians(lng1)) + 
    sin(radians(lat1)) * sin(radians(lat2))
)
```

- 6371 km : Rayon moyen de la Terre
- Précision : ±0.5% (suffisant pour l'échelle nationale)
- Performance : Rapide sur volumes modérés

---

## Installation

### Prérequis

- PHP >= 8.2
- Composer
- Node.js >= 18.x
- MySQL >= 8.0

### 1. Cloner le projet

```bash
git clone https://github.com/Ky-Wilson/Application-de-geolocalisation-de-patrimoine.git
cd Application-de-geolocalisation-de-patrimoine
```

### 2. Installer les dépendances

```bash
# Backend
composer install

# Frontend
npm install
```

### 3. Configuration

```bash
# Copier .env
cp .env.example .env

# Générer la clé
php artisan key:generate
```

Configurer `.env` :

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=patrimoine
DB_USERNAME=root
DB_PASSWORD=
```

### 4. Base de données

```bash
# Créer la base
mysql -u root -p
CREATE DATABASE patrimoine CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# Migrations
php artisan migrate

# Données de test (10 sites)
php artisan db:seed --class=SiteSeeder
```

### 5. Lancement

```bash
# Terminal 1 : Backend
php artisan serve

# Terminal 2 : Frontend
npm run dev
```

→ Accès : http://localhost:8000

---

## 🌐 API REST

### Endpoints

| Méthode | Endpoint                  | Description             |
| ------- | ------------------------- | ----------------------- |
| GET     | `/api/v1/sites`           | Liste tous les sites    |
| GET     | `/api/v1/sites?ville=X`   | Filtrer par ville       |
| GET     | `/api/v1/sites?type=X`    | Filtrer par type        |
| POST    | `/api/v1/sites`           | Créer un site           |
| GET     | `/api/v1/sites/{id}`      | Afficher un site        |
| PUT     | `/api/v1/sites/{id}`      | Modifier un site        |
| DELETE  | `/api/v1/sites/{id}`      | Supprimer un site       |
| GET     | `/api/v1/sites/nearby`    | Recherche par proximité |

### Exemples

```bash
# Liste tous les sites
curl http://localhost:8000/api/v1/sites

# Recherche par proximité (rayon 10km autour d'Abidjan)
curl "http://localhost:8000/api/v1/sites/nearby?lat=5.32&lng=-4.01&radius=10"
```

## Données de Test

Le seeder inclut 10 sites ivoiriens :
- Basilique Notre-Dame de la Paix (Yamoussoukro)
- Cathédrale Saint-Paul (Abidjan)
- Parc National de Taï
- Grand-Bassam (UNESCO)
- Et 6 autres sites répartis géographiquement
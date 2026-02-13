<?php

namespace Database\Seeders;

use App\Models\Site;
use Illuminate\Database\Seeder;

class SiteSeeder extends Seeder
{
    public function run(): void
    {
        $sites = [
            [
                'nom' => 'Basilique Notre-Dame de la Paix',
                'description' => 'Plus grande basilique au monde',
                'type' => 'eglise',
                'latitude' => 6.8103,
                'longitude' => -5.2893,
                'ville' => 'Yamoussoukro',
                'date_creation' => 1990,
                'photo_url' => null,
            ],
            [
                'nom' => 'Cathédrale Saint-Paul',
                'description' => 'Cathédrale moderne d\'Abidjan',
                'type' => 'cathedrale',
                'latitude' => 5.3200,
                'longitude' => -4.0082,
                'ville' => 'Abidjan',
                'date_creation' => 1985,
                'photo_url' => null,
            ],
            [
                'nom' => 'Parc National de Taï',
                'description' => 'Forêt tropicale classée UNESCO',
                'type' => 'site_naturel',
                'latitude' => 5.8500,
                'longitude' => -7.3500,
                'ville' => 'Taï',
                'date_creation' => 1926,
                'photo_url' => null,
            ],
            [
                'nom' => 'Mosquée de Korhogo',
                'description' => 'Mosquée historique du Nord',
                'type' => 'mosquee',
                'latitude' => 9.4580,
                'longitude' => -5.6297,
                'ville' => 'Korhogo',
                'date_creation' => 1935,
                'photo_url' => null,
            ],
            [
                'nom' => 'Pont Houphouët-Boigny',
                'description' => 'Pont emblématique d\'Abidjan',
                'type' => 'pont',
                'latitude' => 5.3364,
                'longitude' => -4.0267,
                'ville' => 'Abidjan',
                'date_creation' => 1958,
                'photo_url' => null,
            ],
            [
                'nom' => 'Musée des Civilisations',
                'description' => 'Musée national de Côte d\'Ivoire',
                'type' => 'musee',
                'latitude' => 5.3478,
                'longitude' => -4.0305,
                'ville' => 'Abidjan',
                'date_creation' => 1942,
                'photo_url' => null,
            ],
            [
                'nom' => 'Palais Présidentiel',
                'description' => 'Résidence présidentielle',
                'type' => 'palais',
                'latitude' => 5.3250,
                'longitude' => -4.0150,
                'ville' => 'Abidjan',
                'date_creation' => 1960,
                'photo_url' => null,
            ],
            [
                'nom' => 'Grand-Bassam',
                'description' => 'Ville coloniale classée UNESCO',
                'type' => 'batiment_historique',
                'latitude' => 5.1956,
                'longitude' => -3.7380,
                'ville' => 'Grand-Bassam',
                'date_creation' => 1893,
                'photo_url' => null,
            ],
            [
                'nom' => 'Cascade de Man',
                'description' => 'Cascade naturelle spectaculaire',
                'type' => 'cascade',
                'latitude' => 7.4125,
                'longitude' => -7.5533,
                'ville' => 'Man',
                'date_creation' => 1900,
                'photo_url' => null,
            ],
            [
                'nom' => 'Jardin Botanique de Bingerville',
                'description' => 'Jardin botanique historique',
                'type' => 'jardin',
                'latitude' => 5.3550,
                'longitude' => -3.8950,
                'ville' => 'Bingerville',
                'date_creation' => 1904,
                'photo_url' => null,
            ],
        ];

        foreach ($sites as $site) {
            Site::create($site);
        }
    }
}

<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Site;
use Illuminate\Http\Request;

class SiteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    // GET /sites
    public function index(Request $request)
    {
        $query = Site::query();

        // Filtre par ville
        if ($request->has('ville')) {
            $query->where('ville', $request->ville);
        }

        // Filtre par type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $sites = $query->get();

        return response()->json([
            'success' => true,
            'message' => 'Sites récupérés avec succès',
            'data' => $sites,
            'count' => $sites->count()
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    // POST /sites
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'description' => 'required|string',
            'type' => 'required|string',
            'type_autre' => 'nullable|string|max:255',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'ville' => 'required|string|max:255',
            'date_creation' => 'required|integer|min:1000|max:' . date('Y'),
            'photo_url' => 'nullable|url',
        ]);

        $site = Site::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Site créé avec succès',
            'data' => $site
        ], 201);
    }

    // GET /sites/nearby?lat=5.35&lng=-4.01&radius=5
    /* public function nearby(Request $request)
    {
        $request->validate([
            'lat' => 'required|numeric|between:-90,90',
            'lng' => 'required|numeric|between:-180,180',
            'radius' => 'nullable|numeric|min:1',
        ]);

        $lat = $request->lat;
        $lng = $request->lng;
        $radius = $request->radius ?? 5;

        $sites = Site::all()->map(function ($site) use ($lat, $lng) {
            $distance = 6371 * acos(
                cos(deg2rad($lat)) * cos(deg2rad($site->latitude)) *
                cos(deg2rad($site->longitude) - deg2rad($lng)) +
                sin(deg2rad($lat)) * sin(deg2rad($site->latitude))
            );
            $site->distance = round($distance, 2);
            return $site;
        })
        ->filter(fn($site) => $site->distance <= $radius)
        ->sortBy('distance')
        ->values();

        return response()->json([
            'success' => true,
            'message' => 'Sites à proximité récupérés avec succès',
            'data' => $sites,
            'count' => $sites->count(),
            'search_params' => [
                'latitude' => $lat,
                'longitude' => $lng,
                'radius_km' => $radius
            ]
        ]);
    } */
   public function nearby(Request $request)
{
    $request->validate([
        'lat' => 'required|numeric|between:-90,90',
        'lng' => 'required|numeric|between:-180,180',
        'radius' => 'nullable|numeric|min:1',
    ]);

    $lat = $request->lat;
    $lng = $request->lng;
    $radius = $request->radius ?? 5;

    $sites = Site::all()->map(function ($site) use ($lat, $lng) {
        $distance = 6371 * acos(
            cos(deg2rad($lat)) * cos(deg2rad($site->latitude)) *
            cos(deg2rad($site->longitude) - deg2rad($lng)) +
            sin(deg2rad($lat)) * sin(deg2rad($site->latitude))
        );
        $site->distance = round($distance, 2);
        return $site;
    })
    ->filter(fn($site) => $site->distance <= $radius)
    ->sortBy('distance')
    ->values();

    // Retourner le même format que les autres endpoints
    return response()->json([
        'success' => true,
        'message' => 'Sites à proximité récupérés avec succès',
        'data' => $sites,
        'count' => $sites->count(),
        'search_params' => [
            'latitude' => $lat,
            'longitude' => $lng,
            'radius_km' => $radius
        ]
    ]);
}

    /**
     * Display the specified resource.
     */
    public function show(Site $site)
    {
        return response()->json([
            'success' => true,
            'message' => 'Site récupéré avec succès',
            'data' => $site
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Site $site)
    {
        $validated = $request->validate([
            'nom' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'type' => 'sometimes|required|string',
            'type_autre' => 'nullable|string|max:255',
            'latitude' => 'sometimes|required|numeric|between:-90,90',
            'longitude' => 'sometimes|required|numeric|between:-180,180',
            'ville' => 'sometimes|required|string|max:255',
            'date_creation' => 'sometimes|required|integer|min:1000|max:' . date('Y'),
            'photo_url' => 'nullable|url',
        ]);

        $site->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Site mis à jour avec succès',
            'data' => $site
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Site $site)
    {
        $site->delete();

        return response()->json([
            'success' => true,
            'message' => 'Site supprimé avec succès'
        ]);
    }
}

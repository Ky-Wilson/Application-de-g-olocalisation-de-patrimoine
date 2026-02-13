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

        return inertia('Sites/Index', [
            'sites' => $sites
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

        return redirect()->route('sites.index');
    }

    // GET /sites/nearby?lat=5.35&lng=-4.01&radius=5
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

        $sites = Site::selectRaw("
            *,
            (6371 * acos(
                cos(radians(?)) * cos(radians(latitude)) *
                cos(radians(longitude) - radians(?)) +
                sin(radians(?)) * sin(radians(latitude))
            )) AS distance
        ", [$lat, $lng, $lat])
        ->having('distance', '<=', $radius)
        ->orderBy('distance')
        ->get();

        return response()->json($sites);
    }

    /**
     * Display the specified resource.
     */
    public function show(Site $site)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Site $site)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Site $site)
    {
        //
    }
}

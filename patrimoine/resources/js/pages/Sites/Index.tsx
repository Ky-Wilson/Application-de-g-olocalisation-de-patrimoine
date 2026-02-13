import { Head } from '@inertiajs/react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix pour les icônes Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface Site {
    id: number;
    nom: string;
    description: string;
    type: string;
    latitude: string;
    longitude: string;
    ville: string;
    date_creation: number;
    photo_url: string | null;
}

export default function Index() {
    const [sites, setSites] = useState<Site[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const center: [number, number] = [5.35, -4.01]; // Abidjan

    useEffect(() => {
        fetch('/api/v1/sites')
            .then(res => res.json())
            .then(data => {
                setSites(data.data);
                setLoading(false);
            })
            .catch(err => {
                setError('Erreur lors du chargement des sites');
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-xl">Chargement...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-xl text-red-600">{error}</p>
            </div>
        );
    }

    return (
        <>
            <Head title="Patrimoine - Carte" />

            <div className="min-h-screen bg-gray-100">
                <header className="bg-white shadow">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                            Carte du Patrimoine
                        </h1>
                    </div>
                </header>

                <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <div className="h-[600px] w-full rounded-lg overflow-hidden shadow-lg">
                        <MapContainer
                            center={center}
                            zoom={7}
                            style={{ height: '100%', width: '100%' }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            {sites.map((site) => (
                                <Marker
                                    key={site.id}
                                    position={[parseFloat(site.latitude), parseFloat(site.longitude)]}
                                >
                                    <Popup>
                                        <div className="p-2">
                                            <h3 className="font-bold text-lg">{site.nom}</h3>
                                            <p className="text-sm text-gray-600">{site.type}</p>
                                            <p className="text-sm mt-2">{site.description}</p>
                                            <p className="text-xs text-gray-500 mt-2">
                                                {site.ville} • {site.date_creation}
                                            </p>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>

                    <div className="mt-6 bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">Sites ({sites.length})</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {sites.map((site) => (
                                <div key={site.id} className="border rounded-lg p-4 hover:shadow-md transition">
                                    <h3 className="font-semibold">{site.nom}</h3>
                                    <p className="text-sm text-gray-600">{site.ville}</p>
                                    <p className="text-xs text-gray-500 mt-1">{site.type}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}

import { Head } from '@inertiajs/react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faMapMarkerAlt, faCalendar, faCity, faTag, faSearch, faFilter, faLocationCrosshairs, faTimes, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
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
    type_autre: string | null;
    latitude: string;
    longitude: string;
    ville: string;
    date_creation: number;
    photo_url: string | null;
    distance?: number;
}

// Composant pour capturer les clics sur la carte
function MapClickHandler({ onMapClick, isActive }: { onMapClick: (lat: number, lng: number) => void, isActive: boolean }) {
    useMapEvents({
        click: (e) => {
            if (isActive) {
                onMapClick(e.latlng.lat, e.latlng.lng);
            }
        },
    });
    return null;
}

export default function Index() {
    const [sites, setSites] = useState<Site[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingSite, setEditingSite] = useState<Site | null>(null);
    const [filterVille, setFilterVille] = useState('');
    const [filterType, setFilterType] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [showAutreField, setShowAutreField] = useState(false);
    const [isSelectingLocation, setIsSelectingLocation] = useState(false);
    const [selectedLat, setSelectedLat] = useState('');
    const [selectedLng, setSelectedLng] = useState('');
    const [selectedVille, setSelectedVille] = useState('');
    const [loadingCity, setLoadingCity] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    // Recherche par proximité
    const [showProximitySearch, setShowProximitySearch] = useState(false);
    const [proximityLat, setProximityLat] = useState('');
    const [proximityLng, setProximityLng] = useState('');
    const [proximityRadius, setProximityRadius] = useState('10');
    const [nearbySites, setNearbySites] = useState<Site[]>([]);
    const [isSearchingNearby, setIsSearchingNearby] = useState(false);

    const center: [number, number] = [5.35, -4.01];

    useEffect(() => {
        fetchSites();
    }, [filterVille, filterType]);

    useEffect(() => {
        if (editingSite) {
            setSelectedType(editingSite.type);
            setShowAutreField(editingSite.type === 'autre');
            setSelectedLat(editingSite.latitude);
            setSelectedLng(editingSite.longitude);
            setSelectedVille(editingSite.ville);
        } else {
            setSelectedType('');
            setShowAutreField(false);
            setSelectedLat('');
            setSelectedLng('');
            setSelectedVille('');
        }
    }, [editingSite]);

    const fetchSites = () => {
        let url = '/api/v1/sites?';
        const params = new URLSearchParams();

        if (filterVille) params.append('ville', filterVille);
        if (filterType) params.append('type', filterType);

        fetch(url + params.toString())
            .then(res => res.json())
            .then(data => {
                setSites(data.data || []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    const getCityFromCoordinates = async (lat: number, lng: number) => {
        setLoadingCity(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`
            );
            const data = await response.json();
            const city = data.address?.city ||
                        data.address?.town ||
                        data.address?.village ||
                        data.address?.county ||
                        data.address?.state ||
                        'Ville inconnue';
            setSelectedVille(city);
        } catch (error) {
            console.error('Erreur lors de la récupération de la ville:', error);
            setSelectedVille('');
        } finally {
            setLoadingCity(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce site ?')) return;

        try {
            const response = await fetch(`/api/v1/sites/${id}`, {
                method: 'DELETE',
            });
            const data = await response.json();
            if (data.success) {
                fetchSites();
                setNearbySites([]);
                setIsSearchingNearby(false);
            }
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    const openModal = (site?: Site) => {
        setEditingSite(site || null);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingSite(null);
        setSelectedType('');
        setShowAutreField(false);
        setIsSelectingLocation(false);
        setSelectedLat('');
        setSelectedLng('');
        setSelectedVille('');
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData);

        try {
            const url = editingSite ? `/api/v1/sites/${editingSite.id}` : '/api/v1/sites';
            const method = editingSite ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            if (result.success) {
                await fetchSites();
                closeModal();
            }
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedType(value);
        setShowAutreField(value === 'autre');
    };

    const handleMapClick = async (lat: number, lng: number) => {
        setSelectedLat(lat.toFixed(8));
        setSelectedLng(lng.toFixed(8));
        await getCityFromCoordinates(lat, lng);
    };

    const toggleLocationSelection = () => {
        setIsSelectingLocation(!isSelectingLocation);
    };

    const resetFilters = () => {
        setFilterVille('');
        setFilterType('');
        setSearchTerm('');
        setNearbySites([]);
        setIsSearchingNearby(false);
        setCurrentPage(1);
    };

    const searchNearby = async () => {
        if (!proximityLat || !proximityLng) {
            alert('Veuillez entrer une latitude et une longitude');
            return;
        }

        try {
            const response = await fetch(
                `/api/v1/sites/nearby?lat=${proximityLat}&lng=${proximityLng}&radius=${proximityRadius}`
            );
            const data = await response.json();
            setNearbySites(data.data || []);
            setIsSearchingNearby(true);
            setCurrentPage(1);
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la recherche de proximité');
            setNearbySites([]);
        }
    };

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setProximityLat(position.coords.latitude.toFixed(8));
                    setProximityLng(position.coords.longitude.toFixed(8));
                },
                (error) => {
                    alert('Impossible de récupérer votre position');
                }
            );
        } else {
            alert('La géolocalisation n\'est pas supportée par votre navigateur');
        }
    };

    // Filtrer par recherche locale
    const displayedSites = isSearchingNearby ? nearbySites : sites;
    const filteredSites = displayedSites.filter(site =>
        site.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.ville.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination
    const totalPages = Math.ceil(filteredSites.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedSites = filteredSites.slice(startIndex, endIndex);

    const goToPage = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Liste unique des villes
    const villes = [...new Set(sites.map(s => s.ville))].sort();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="relative inline-block">
                        <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-orange-500 mx-auto"></div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-orange-500 text-2xl animate-pulse" />
                        </div>
                    </div>
                    <p className="mt-6 text-xl font-semibold text-gray-700">Chargement de la carte...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Head title="Patrimoine - Carte" />

            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <header className="bg-white shadow-md border-b-4 border-orange-500 sticky top-0 z-50">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="text-center sm:text-left">
                                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                                    Patrimoine de Côte d'Ivoire
                                </h1>
                                <p className="mt-2 text-gray-600">Découvrez et explorez nos trésors culturels</p>
                            </div>
                            <button
                                onClick={() => openModal()}
                                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition flex items-center gap-2"
                            >
                                <FontAwesomeIcon icon={faPlus} />
                                <span className="hidden sm:inline">Ajouter un site</span>
                                <span className="sm:hidden">Ajouter</span>
                            </button>
                        </div>
                    </div>
                </header>

                <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    {/* Filtres */}
                    <div className="mb-6 bg-white rounded-lg shadow-lg p-4 sm:p-6 border-l-4 border-orange-500">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-orange-500 p-3 rounded-lg">
                                <FontAwesomeIcon icon={faFilter} className="text-white text-xl" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">Filtres de recherche</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    <FontAwesomeIcon icon={faSearch} className="mr-2 text-orange-500" />
                                    Recherche
                                </label>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Nom, ville..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    <FontAwesomeIcon icon={faCity} className="mr-2 text-green-600" />
                                    Ville
                                </label>
                                <select
                                    value={filterVille}
                                    onChange={(e) => setFilterVille(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 transition"
                                >
                                    <option value="">Toutes</option>
                                    {villes.map(ville => (
                                        <option key={ville} value={ville}>{ville}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    <FontAwesomeIcon icon={faTag} className="mr-2 text-orange-500" />
                                    Type
                                </label>
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                                >
                                    <option value="">Tous</option>
                                    <option value="monument">Monument</option>
                                    <option value="musee">Musée</option>
                                    <option value="site_naturel">Site naturel</option>
                                    <option value="batiment_historique">Bâtiment historique</option>
                                    <option value="eglise">Église</option>
                                    <option value="cathedrale">Cathédrale</option>
                                    <option value="mosquee">Mosquée</option>
                                    <option value="chateau">Château</option>
                                    <option value="palais">Palais</option>
                                    <option value="parc">Parc</option>
                                </select>
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={resetFilters}
                                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-3 rounded-lg font-semibold transition"
                                >
                                    Réinitialiser
                                </button>
                            </div>
                        </div>

                        {/* Recherche par proximité */}
                        <div className="border-t border-gray-200 pt-6">
                            <button
                                onClick={() => setShowProximitySearch(!showProximitySearch)}
                                className="flex items-center gap-3 text-green-600 hover:text-green-700 font-bold mb-4 transition"
                            >
                                <FontAwesomeIcon icon={faLocationCrosshairs} className="text-xl" />
                                <span>Recherche par proximité</span>
                            </button>

                            {showProximitySearch && (
                                <div className="bg-green-50 rounded-lg p-4 sm:p-6 border border-green-200">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Latitude</label>
                                            <input
                                                type="number"
                                                step="0.00000001"
                                                value={proximityLat}
                                                onChange={(e) => setProximityLat(e.target.value)}
                                                placeholder="5.35"
                                                className="w-full px-4 py-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Longitude</label>
                                            <input
                                                type="number"
                                                step="0.00000001"
                                                value={proximityLng}
                                                onChange={(e) => setProximityLng(e.target.value)}
                                                placeholder="-4.01"
                                                className="w-full px-4 py-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Rayon (km)</label>
                                            <input
                                                type="number"
                                                value={proximityRadius}
                                                onChange={(e) => setProximityRadius(e.target.value)}
                                                placeholder="10"
                                                className="w-full px-4 py-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600"
                                            />
                                        </div>
                                        <div className="flex items-end gap-2">
                                            <button
                                                onClick={getCurrentLocation}
                                                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold transition shadow-md hover:shadow-lg"
                                                title="Ma position"
                                            >
                                                <FontAwesomeIcon icon={faLocationCrosshairs} />
                                            </button>
                                            <button
                                                onClick={searchNearby}
                                                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-lg font-semibold transition shadow-md hover:shadow-lg"
                                            >
                                                Chercher
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {isSearchingNearby && (
                            <div className="mt-4 p-4 bg-green-50 border border-green-300 rounded-lg">
                                <p className="text-sm text-green-800 font-semibold flex items-center gap-2">
                                    <FontAwesomeIcon icon={faLocationCrosshairs} className="animate-pulse" />
                                    {nearbySites.length} sites trouvés dans un rayon de {proximityRadius} km
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Carte */}
                    <div className="mb-8 bg-white rounded-lg overflow-hidden shadow-lg border border-gray-200">
                        <div className="h-[500px] sm:h-[600px] lg:h-[700px]">
                            <MapContainer
                                center={center}
                                zoom={7}
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer
                                    attribution='&copy; OpenStreetMap'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <MapClickHandler onMapClick={handleMapClick} isActive={isSelectingLocation} />

                                {filteredSites.map((site) => (
                                    <Marker
                                        key={site.id}
                                        position={[parseFloat(site.latitude), parseFloat(site.longitude)]}
                                    >
                                        <Popup maxWidth={320}>
                                            <div className="p-2">
                                                {site.photo_url && (
                                                    <img
                                                        src={site.photo_url}
                                                        alt={site.nom}
                                                        className="w-full h-48 object-cover rounded-lg mb-3 shadow-md"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).style.display = 'none';
                                                        }}
                                                    />
                                                )}
                                                <h3 className="font-bold text-xl mb-3 text-gray-900">{site.nom}</h3>
                                                <div className="space-y-2 mb-4">
                                                    <p className="text-sm text-gray-700 leading-relaxed">{site.description}</p>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <FontAwesomeIcon icon={faCity} className="text-green-600" />
                                                        <span className="font-medium">{site.ville}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <FontAwesomeIcon icon={faTag} className="text-orange-500" />
                                                        <span className="font-medium">{site.type === 'autre' && site.type_autre ? site.type_autre : site.type}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <FontAwesomeIcon icon={faCalendar} className="text-orange-500" />
                                                        <span className="font-medium">{site.date_creation}</span>
                                                    </div>
                                                    {site.distance !== undefined && (
                                                        <div className="flex items-center gap-2 text-sm font-bold text-green-700 bg-green-50 px-3 py-1 rounded-lg">
                                                            <FontAwesomeIcon icon={faLocationCrosshairs} />
                                                            <span>{site.distance.toFixed(2)} km</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => openModal(site)}
                                                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition shadow-md hover:shadow-lg"
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} className="mr-2" />
                                                        Modifier
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(site.id)}
                                                        className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition shadow-md hover:shadow-lg"
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} className="mr-2" />
                                                        Supprimer
                                                    </button>
                                                </div>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}
                            </MapContainer>
                        </div>
                    </div>

                    {/* Liste des sites avec pagination */}
                    <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 border-l-4 border-green-600">
                        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Liste des sites</h2>
                            <span className="bg-orange-100 text-orange-800 px-6 py-3 rounded-lg font-bold text-lg border border-orange-300">
                                {filteredSites.length} sites
                            </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                            {paginatedSites.map((site) => (
                                <div
                                    key={site.id}
                                    className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:shadow-xl hover:border-orange-300 transition"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="font-bold text-lg text-gray-900">{site.nom}</h3>
                                        <div className="bg-orange-500 p-2 rounded-lg">
                                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-white" />
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-4 flex items-center gap-2">
                                        <FontAwesomeIcon icon={faCity} className="text-green-600" />
                                        {site.ville}
                                    </p>
                                    <div className="flex items-center gap-2 mb-6 flex-wrap">
                                        <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-lg text-xs font-bold border border-orange-300">
                                            {site.type === 'autre' && site.type_autre ? site.type_autre : site.type}
                                        </span>
                                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-xs font-semibold">
                                            {site.date_creation}
                                        </span>
                                        {site.distance !== undefined && (
                                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-lg text-xs font-bold border border-green-300 flex items-center gap-1">
                                                <FontAwesomeIcon icon={faLocationCrosshairs} />
                                                {site.distance.toFixed(2)} km
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => openModal(site)}
                                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg text-sm font-semibold transition shadow-md hover:shadow-lg"
                                        >
                                            <FontAwesomeIcon icon={faEdit} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(site.id)}
                                            className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg text-sm font-semibold transition shadow-md hover:shadow-lg"
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 pt-6">
                                <p className="text-sm text-gray-600">
                                    Affichage de {startIndex + 1} à {Math.min(endIndex, filteredSites.length)} sur {filteredSites.length} sites
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => goToPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className={`px-4 py-2 rounded-lg font-semibold transition ${
                                            currentPage === 1
                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                : 'bg-orange-500 text-white hover:bg-orange-600 shadow-md hover:shadow-lg'
                                        }`}
                                    >
                                        <FontAwesomeIcon icon={faChevronLeft} />
                                    </button>

                                    <div className="flex gap-2">
                                        {[...Array(totalPages)].map((_, index) => {
                                            const pageNum = index + 1;
                                            // Afficher les 3 premières pages, les 3 dernières, et la page courante avec ses voisines
                                            if (
                                                pageNum <= 3 ||
                                                pageNum > totalPages - 3 ||
                                                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                                            ) {
                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => goToPage(pageNum)}
                                                        className={`px-4 py-2 rounded-lg font-semibold transition ${
                                                            currentPage === pageNum
                                                                ? 'bg-orange-500 text-white shadow-lg'
                                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                        }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            } else if (
                                                pageNum === 4 && currentPage > 5 ||
                                                pageNum === totalPages - 3 && currentPage < totalPages - 4
                                            ) {
                                                return <span key={pageNum} className="px-2">...</span>;
                                            }
                                            return null;
                                        })}
                                    </div>

                                    <button
                                        onClick={() => goToPage(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className={`px-4 py-2 rounded-lg font-semibold transition ${
                                            currentPage === totalPages
                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                : 'bg-orange-500 text-white hover:bg-orange-600 shadow-md hover:shadow-lg'
                                        }`}
                                    >
                                        <FontAwesomeIcon icon={faChevronRight} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto">
                        <div className="sticky top-0 bg-orange-500 p-6 rounded-t-lg flex justify-between items-center">
                            <h2 className="text-2xl sm:text-3xl font-bold text-white">
                                {editingSite ? 'Modifier le site' : 'Ajouter un site'}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-lg transition"
                            >
                                <FontAwesomeIcon icon={faTimes} className="text-xl" />
                            </button>
                        </div>

                        <div className="p-6 sm:p-8">
                            {/* Carte dans le modal */}
                            {isSelectingLocation && (
                                <div className="mb-6 rounded-lg overflow-hidden border-4 border-green-600 shadow-lg">
                                    <div className="bg-green-600 text-white px-6 py-4 font-bold flex items-center gap-3">
                                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-2xl" />
                                        <span>Cliquez sur la carte pour sélectionner la position</span>
                                    </div>
                                    <div className="h-[400px] sm:h-[500px]">
                                        <MapContainer
                                            center={selectedLat && selectedLng ? [parseFloat(selectedLat), parseFloat(selectedLng)] : center}
                                            zoom={10}
                                            style={{ height: '100%', width: '100%' }}
                                        >
                                            <TileLayer
                                                attribution='&copy; OpenStreetMap'
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            />
                                            <MapClickHandler onMapClick={handleMapClick} isActive={true} />
                                            {selectedLat && selectedLng && (
                                                <Marker position={[parseFloat(selectedLat), parseFloat(selectedLng)]} />
                                            )}
                                        </MapContainer>
                                    </div>
                                    {loadingCity && (
                                        <div className="bg-blue-50 px-6 py-4 text-blue-800 font-semibold flex items-center gap-3">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                            Récupération de la ville...
                                        </div>
                                    )}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Nom du site</label>
                                        <input
                                            type="text"
                                            name="nom"
                                            defaultValue={editingSite?.nom}
                                            required
                                            className="w-full px-5 py-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition text-lg"
                                            placeholder="Ex: Basilique Notre-Dame"
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                                        <textarea
                                            name="description"
                                            defaultValue={editingSite?.description}
                                            required
                                            rows={4}
                                            className="w-full px-5 py-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                                            placeholder="Décrivez le site patrimonial..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Type</label>
                                        <select
                                            name="type"
                                            value={selectedType}
                                            onChange={handleTypeChange}
                                            required
                                            className="w-full px-5 py-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                                        >
                                            <option value="">Sélectionner</option>
                                            <option value="monument">Monument</option>
                                            <option value="musee">Musée</option>
                                            <option value="site_naturel">Site naturel</option>
                                            <option value="batiment_historique">Bâtiment historique</option>
                                            <option value="eglise">Église</option>
                                            <option value="cathedrale">Cathédrale</option>
                                            <option value="mosquee">Mosquée</option>
                                            <option value="temple">Temple</option>
                                            <option value="chateau">Château</option>
                                            <option value="palais">Palais</option>
                                            <option value="fort">Fort</option>
                                            <option value="statue">Statue</option>
                                            <option value="fontaine">Fontaine</option>
                                            <option value="pont">Pont</option>
                                            <option value="place">Place</option>
                                            <option value="parc">Parc</option>
                                            <option value="jardin">Jardin</option>
                                            <option value="site_archeologique">Site archéologique</option>
                                            <option value="grotte">Grotte</option>
                                            <option value="cascade">Cascade</option>
                                            <option value="plage">Plage</option>
                                            <option value="theatre">Théâtre</option>
                                            <option value="opera">Opéra</option>
                                            <option value="bibliotheque">Bibliothèque</option>
                                            <option value="marche">Marché</option>
                                            <option value="commemoratif">Commémoratif</option>
                                            <option value="autre">Autre</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Ville</label>
                                        <input
                                            type="text"
                                            name="ville"
                                            value={selectedVille}
                                            onChange={(e) => setSelectedVille(e.target.value)}
                                            required
                                            className="w-full px-5 py-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 transition"
                                            placeholder="Ex: Abidjan"
                                        />
                                    </div>
                                </div>

                                {showAutreField && (
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Préciser le type
                                        </label>
                                        <input
                                            type="text"
                                            name="type_autre"
                                            defaultValue={editingSite?.type_autre || ''}
                                            required={showAutreField}
                                            placeholder="Ex: Mausolée, Arcade..."
                                            className="w-full px-5 py-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                                        />
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Latitude</label>
                                        <input
                                            type="number"
                                            step="0.00000001"
                                            name="latitude"
                                            value={selectedLat}
                                            onChange={(e) => setSelectedLat(e.target.value)}
                                            required
                                            className="w-full px-5 py-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                                            placeholder="5.35"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Longitude</label>
                                        <input
                                            type="number"
                                            step="0.00000001"
                                            name="longitude"
                                            value={selectedLng}
                                            onChange={(e) => setSelectedLng(e.target.value)}
                                            required
                                            className="w-full px-5 py-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                                            placeholder="-4.01"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={toggleLocationSelection}
                                    className={`w-full px-6 py-4 rounded-lg font-bold transition shadow-lg hover:shadow-xl ${
                                        isSelectingLocation
                                            ? 'bg-green-600 text-white hover:bg-green-700'
                                            : 'bg-orange-100 text-orange-800 hover:bg-orange-200 border-2 border-orange-300'
                                    }`}
                                >
                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-3 text-xl" />
                                    {isSelectingLocation ? 'Masquer la carte' : 'Sélectionner sur la carte'}
                                </button>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Année de création</label>
                                        <input
                                            type="number"
                                            name="date_creation"
                                            defaultValue={editingSite?.date_creation}
                                            required
                                            className="w-full px-5 py-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                                            placeholder="2020"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Photo URL (optionnel)</label>
                                        <input
                                            type="url"
                                            name="photo_url"
                                            defaultValue={editingSite?.photo_url || ''}
                                            className="w-full px-5 py-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg font-bold transition shadow-lg hover:shadow-xl"
                                    >
                                        {editingSite ? 'Mettre à jour' : 'Créer le site'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-8 py-4 rounded-lg font-bold transition shadow-lg hover:shadow-xl"
                                    >
                                        Annuler
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

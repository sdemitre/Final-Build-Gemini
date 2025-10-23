import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

interface DiseaseOutbreak {
  id: string;
  diseaseName: string;
  region: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  outbreakStart: string;
  casesReported: number;
  deathsReported: number;
  status: 'active' | 'contained' | 'resolved';
  description: string;
  sourceUrl?: string;
}

interface MapFilters {
  diseaseType: string;
  status: string;
  timeframe: string;
  region: string;
}

const DiseaseMap: React.FC = () => {
  const [outbreaks, setOutbreaks] = useState<DiseaseOutbreak[]>([]);
  const [filteredOutbreaks, setFilteredOutbreaks] = useState<DiseaseOutbreak[]>([]);
  const [filters, setFilters] = useState<MapFilters>({
    diseaseType: 'all',
    status: 'all',
    timeframe: 'all',
    region: 'all',
  });
  const [loading, setLoading] = useState(true);
  const [selectedOutbreak, setSelectedOutbreak] = useState<DiseaseOutbreak | null>(null);

  // Mock data - in real app, this would come from WHO API or similar
  useEffect(() => {
    const fetchOutbreakData = async () => {
      // Simulate API call
      setTimeout(() => {
        const mockOutbreaks: DiseaseOutbreak[] = [
          {
            id: '1',
            diseaseName: 'COVID-19',
            region: 'Asia',
            country: 'China',
            coordinates: { lat: 30.5928, lng: 114.3055 },
            outbreakStart: '2019-12-01',
            casesReported: 100000,
            deathsReported: 3000,
            status: 'contained',
            description: 'Initial COVID-19 outbreak in Wuhan',
            sourceUrl: 'https://who.int',
          },
          {
            id: '2',
            diseaseName: 'Ebola',
            region: 'Africa',
            country: 'Democratic Republic of Congo',
            coordinates: { lat: -4.0383, lng: 21.7587 },
            outbreakStart: '2020-06-01',
            casesReported: 5000,
            deathsReported: 500,
            status: 'contained',
            description: 'Ebola outbreak in eastern DRC',
            sourceUrl: 'https://who.int',
          },
          {
            id: '3',
            diseaseName: 'Dengue Fever',
            region: 'South America',
            country: 'Brazil',
            coordinates: { lat: -14.2350, lng: -51.9253 },
            outbreakStart: '2024-01-15',
            casesReported: 25000,
            deathsReported: 150,
            status: 'active',
            description: 'Dengue outbreak during rainy season',
            sourceUrl: 'https://paho.org',
          },
          {
            id: '4',
            diseaseName: 'Mpox',
            region: 'Africa',
            country: 'Nigeria',
            coordinates: { lat: 9.0820, lng: 8.6753 },
            outbreakStart: '2023-08-20',
            casesReported: 1200,
            deathsReported: 45,
            status: 'active',
            description: 'Ongoing mpox cases in multiple states',
            sourceUrl: 'https://who.int',
          },
          {
            id: '5',
            diseaseName: 'Cholera',
            region: 'Asia',
            country: 'Bangladesh',
            coordinates: { lat: 23.6850, lng: 90.3563 },
            outbreakStart: '2024-03-10',
            casesReported: 3500,
            deathsReported: 89,
            status: 'active',
            description: 'Cholera outbreak in refugee camps',
            sourceUrl: 'https://who.int',
          },
        ];

        setOutbreaks(mockOutbreaks);
        setFilteredOutbreaks(mockOutbreaks);
        setLoading(false);
      }, 1000);
    };

    fetchOutbreakData();
  }, []);

  // Filter outbreaks based on selected filters
  useEffect(() => {
    let filtered = outbreaks;

    if (filters.diseaseType !== 'all') {
      filtered = filtered.filter(outbreak => 
        outbreak.diseaseName.toLowerCase().includes(filters.diseaseType.toLowerCase())
      );
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(outbreak => outbreak.status === filters.status);
    }

    if (filters.region !== 'all') {
      filtered = filtered.filter(outbreak => outbreak.region === filters.region);
    }

    if (filters.timeframe !== 'all') {
      const now = new Date();
      const timeframeDays = {
        '30': 30,
        '90': 90,
        '365': 365,
      }[filters.timeframe] || 0;

      if (timeframeDays > 0) {
        const cutoffDate = new Date(now.getTime() - timeframeDays * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(outbreak => 
          new Date(outbreak.outbreakStart) >= cutoffDate
        );
      }
    }

    setFilteredOutbreaks(filtered);
  }, [filters, outbreaks]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#dc2626'; // red
      case 'contained': return '#f59e0b'; // yellow
      case 'resolved': return '#16a34a'; // green
      default: return '#6b7280'; // gray
    }
  };

  const getMarkerSize = (casesReported: number) => {
    if (casesReported < 1000) return 10;
    if (casesReported < 10000) return 15;
    if (casesReported < 50000) return 20;
    return 25;
  };

  const handleFilterChange = (filterType: keyof MapFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const uniqueDiseases = [...new Set(outbreaks.map(o => o.diseaseName))];
  const uniqueRegions = [...new Set(outbreaks.map(o => o.region))];

  if (loading) {
    return (
      <div className="container">
        <div className="flex justify-center items-center" style={{ minHeight: '400px' }}>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="disease-map-page">
        {/* Header */}
        <div className="map-header mb-4">
          <h1>Global Disease Outbreak Map</h1>
          <p className="text-lg text-gray-600">
            Real-time visualization of infectious disease outbreaks worldwide
          </p>
        </div>

        {/* Filters */}
        <div className="map-filters card mb-4">
          <div className="card-body">
            <div className="grid grid-4 gap-4">
              <div className="form-group">
                <label className="form-label">Disease Type</label>
                <select 
                  className="form-control"
                  value={filters.diseaseType}
                  onChange={(e) => handleFilterChange('diseaseType', e.target.value)}
                >
                  <option value="all">All Diseases</option>
                  {uniqueDiseases.map(disease => (
                    <option key={disease} value={disease}>{disease}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select 
                  className="form-control"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="contained">Contained</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Region</label>
                <select 
                  className="form-control"
                  value={filters.region}
                  onChange={(e) => handleFilterChange('region', e.target.value)}
                >
                  <option value="all">All Regions</option>
                  {uniqueRegions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Timeframe</label>
                <select 
                  className="form-control"
                  value={filters.timeframe}
                  onChange={(e) => handleFilterChange('timeframe', e.target.value)}
                >
                  <option value="all">All Time</option>
                  <option value="30">Last 30 Days</option>
                  <option value="90">Last 90 Days</option>
                  <option value="365">Last Year</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Map and Details */}
        <div className="grid grid-2 gap-4">
          {/* Map Container */}
          <div className="map-container">
            <div className="card">
              <div className="card-body p-0">
                <div style={{ height: '600px', width: '100%' }}>
                  <MapContainer
                    center={[20, 0]}
                    zoom={2}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {filteredOutbreaks.map(outbreak => (
                      <CircleMarker
                        key={outbreak.id}
                        center={[outbreak.coordinates.lat, outbreak.coordinates.lng]}
                        radius={getMarkerSize(outbreak.casesReported)}
                        fillColor={getStatusColor(outbreak.status)}
                        color={getStatusColor(outbreak.status)}
                        weight={2}
                        opacity={0.8}
                        fillOpacity={0.6}
                        eventHandlers={{
                          click: () => setSelectedOutbreak(outbreak),
                        }}
                      >
                        <Popup>
                          <div className="outbreak-popup">
                            <h4>{outbreak.diseaseName}</h4>
                            <p><strong>Location:</strong> {outbreak.country}, {outbreak.region}</p>
                            <p><strong>Cases:</strong> {outbreak.casesReported.toLocaleString()}</p>
                            <p><strong>Deaths:</strong> {outbreak.deathsReported.toLocaleString()}</p>
                            <p><strong>Status:</strong> {outbreak.status}</p>
                            <button 
                              className="btn btn-sm btn-primary"
                              onClick={() => setSelectedOutbreak(outbreak)}
                            >
                              View Details
                            </button>
                          </div>
                        </Popup>
                      </CircleMarker>
                    ))}
                  </MapContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Outbreak Details Panel */}
          <div className="outbreak-details">
            <div className="card">
              <div className="card-header">
                <h3>{selectedOutbreak ? 'Outbreak Details' : 'Select an Outbreak'}</h3>
              </div>
              <div className="card-body">
                {selectedOutbreak ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-semibold">{selectedOutbreak.diseaseName}</h4>
                      <p className="text-gray-600">{selectedOutbreak.country}, {selectedOutbreak.region}</p>
                    </div>

                    <div className="grid grid-2 gap-4">
                      <div className="stat-card">
                        <div className="stat-number text-error">{selectedOutbreak.casesReported.toLocaleString()}</div>
                        <div className="stat-label">Total Cases</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-number text-gray-700">{selectedOutbreak.deathsReported.toLocaleString()}</div>
                        <div className="stat-label">Deaths</div>
                      </div>
                    </div>

                    <div>
                      <p><strong>Status:</strong> 
                        <span className={`badge ml-2 ${
                          selectedOutbreak.status === 'active' ? 'badge-error' :
                          selectedOutbreak.status === 'contained' ? 'badge-warning' :
                          'badge-success'
                        }`}>
                          {selectedOutbreak.status}
                        </span>
                      </p>
                      <p><strong>Outbreak Start:</strong> {new Date(selectedOutbreak.outbreakStart).toLocaleDateString()}</p>
                    </div>

                    <div>
                      <h5>Description</h5>
                      <p className="text-gray-600">{selectedOutbreak.description}</p>
                    </div>

                    {selectedOutbreak.sourceUrl && (
                      <div>
                        <a 
                          href={selectedOutbreak.sourceUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-primary"
                        >
                          View Official Report
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">🗺️</div>
                    <p className="text-gray-500">
                      Click on any outbreak marker on the map to view detailed information.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Legend */}
            <div className="card mt-4">
              <div className="card-header">
                <h4>Legend</h4>
              </div>
              <div className="card-body">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: '#dc2626' }}
                    ></div>
                    <span>Active Outbreak</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: '#f59e0b' }}
                    ></div>
                    <span>Contained</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: '#16a34a' }}
                    ></div>
                    <span>Resolved</span>
                  </div>
                  <hr className="my-2" />
                  <p className="text-sm text-gray-600">
                    Marker size indicates number of cases reported.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="map-summary mt-6">
          <div className="grid grid-4">
            <div className="card">
              <div className="card-body text-center">
                <div className="stat-number text-error">{filteredOutbreaks.length}</div>
                <div className="stat-label">Active Outbreaks</div>
              </div>
            </div>
            <div className="card">
              <div className="card-body text-center">
                <div className="stat-number text-warning">
                  {filteredOutbreaks.reduce((sum, o) => sum + o.casesReported, 0).toLocaleString()}
                </div>
                <div className="stat-label">Total Cases</div>
              </div>
            </div>
            <div className="card">
              <div className="card-body text-center">
                <div className="stat-number text-gray-700">
                  {filteredOutbreaks.reduce((sum, o) => sum + o.deathsReported, 0).toLocaleString()}
                </div>
                <div className="stat-label">Total Deaths</div>
              </div>
            </div>
            <div className="card">
              <div className="card-body text-center">
                <div className="stat-number text-info">{uniqueRegions.length}</div>
                <div className="stat-label">Affected Regions</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiseaseMap;
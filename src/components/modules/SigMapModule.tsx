import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Filter,
  Layers,
  Building2,
  Navigation,
  Eye,
  Coins,
  AlertTriangle,
  Compass,
  Maximize2
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { useSession } from '../../context/SessionContext';
import { Establishment, ArrondissementCode, EstablishmentStatus } from '../../types';
import { TERRITORIAL_REFERENTIAL } from '../../constants/referential';

export const SigMapModule: React.FC = () => {
  const { setActiveModule, triggerNotification } = useSession();
  const [establishments, setEstablishments] = useState<Establishment[]>(() => storageService.getEstablishments());
  const [selectedArrondissement, setSelectedArrondissement] = useState<string>('ALL');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'EN_REGLE' | 'ACOMPTE' | 'SANCTION'>('ALL');
  const [selectedEst, setSelectedEst] = useState<Establishment | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Filter establishments
  const filteredEsts = establishments.filter(e => {
    const matchArr = selectedArrondissement === 'ALL' || e.arrondissement === selectedArrondissement;
    let matchStatus = true;
    if (selectedFilter === 'EN_REGLE') {
      matchStatus = e.status === 'autorise_dgl' || e.balance_due === 0;
    } else if (selectedFilter === 'ACOMPTE') {
      matchStatus = e.amount_paid > 0 && e.balance_due > 0;
    } else if (selectedFilter === 'SANCTION') {
      matchStatus = e.status === 'mise_en_demeure' || e.status === 'fermeture_administrative';
    }
    return matchArr && matchStatus;
  });

  // Initialize Leaflet Map
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current) return;

      try {
        const L = await import('leaflet');

        if (!isMounted) return;

        if (leafletMapRef.current) {
          leafletMapRef.current.remove();
        }

        // Center on Pointe-Noire
        const map = L.map(mapContainerRef.current).setView([-4.785, 11.875], 13);
        leafletMapRef.current = map;

        // OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; République du Congo - MCAPNIT - DDL-PN SIG',
          maxZoom: 18
        }).addTo(map);

        // Add Arrondissements Centers with circular bounds
        TERRITORIAL_REFERENTIAL.forEach(arr => {
          L.circle(arr.sig_coordinates, {
            color: '#006d2f',
            fillColor: '#006d2f',
            fillOpacity: 0.08,
            radius: 1400
          }).addTo(map);

          // Arrondissement label marker
          const customLabelIcon = L.divIcon({
            className: 'custom-arr-label',
            html: `<div style="background:#022448;color:white;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:bold;white-space:nowrap;box-shadow:0 2px 4px rgba(0,0,0,0.3);border:1px solid #ffd700;">${arr.name}</div>`,
            iconSize: [100, 20],
            iconAnchor: [50, 10]
          });

          L.marker(arr.sig_coordinates, { icon: customLabelIcon }).addTo(map);
        });

        renderMarkers(L, map, filteredEsts);
      } catch (err) {
        console.error('Failed to initialize Leaflet Map:', err);
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Update markers when filteredEsts change
  useEffect(() => {
    if (!leafletMapRef.current) return;
    import('leaflet').then(L => {
      renderMarkers(L, leafletMapRef.current, filteredEsts);
    });
  }, [filteredEsts]);

  const renderMarkers = (L: any, map: any, items: Establishment[]) => {
    // Clear old markers
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    items.forEach(est => {
      const isSanction = est.status === 'mise_en_demeure' || est.status === 'fermeture_administrative';
      const isEnRegle = est.status === 'autorise_dgl' || est.balance_due === 0;
      const markerColor = isSanction ? '#dc2626' : isEnRegle ? '#006d2f' : '#f59e0b';

      const customIcon = L.divIcon({
        className: 'custom-est-pin',
        html: `<div style="background:${markerColor};width:16px;height:16px;border-radius:50%;border:2px solid white;box-shadow:0 0 6px rgba(0,0,0,0.5);cursor:pointer;"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      const marker = L.marker(est.coordinates, { icon: customIcon }).addTo(map);

      marker.bindPopup(`
        <div style="font-family:sans-serif;padding:4px;min-width:180px;">
          <strong style="color:#022448;font-size:12px;display:block;">${est.name}</strong>
          <span style="font-size:10px;color:#555;">${est.quartier} (${est.arrondissement})</span>
          <div style="margin:4px 0;font-size:10px;">
            <strong>Promoteur :</strong> ${est.promoter_name}<br/>
            <strong>Tél :</strong> ${est.phone}<br/>
            <strong>Activité :</strong> ${est.activity_type} (${est.surface_m2}m²)<br/>
            <strong>Statut :</strong> <span style="font-weight:bold;color:${markerColor};">${est.status}</span>
          </div>
          <div style="font-size:10px;font-family:monospace;font-weight:bold;margin-top:4px;">
            Payé : ${est.amount_paid.toLocaleString('fr-FR')} FCFA / ${est.total_due.toLocaleString('fr-FR')} FCFA
          </div>
        </div>
      `);

      marker.on('click', () => {
        setSelectedEst(est);
      });

      markersRef.current.push(marker);
    });
  };

  const handleZoomToArrondissement = (code: string) => {
    setSelectedArrondissement(code);
    const arr = TERRITORIAL_REFERENTIAL.find(a => a.code === code);
    if (arr && leafletMapRef.current) {
      leafletMapRef.current.setView(arr.sig_coordinates, 14);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-emerald-100 text-[#006d2f] font-bold px-2 py-0.5 rounded font-mono-ref">
              SIG TERRITORIAL • POINTE-NOIRE
            </span>
            <span className="text-xs text-slate-500">Géoréférencement officiel SAA</span>
          </div>
          <h2 className="text-base sm:text-lg font-black text-[#022448] tracking-tight mt-1 flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#006d2f]" />
            <span>Système d'Information Géographique des Établissements de Loisirs</span>
          </h2>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs bg-slate-50 p-2 rounded-lg border border-slate-200">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#006d2f]" />
            <span className="font-semibold text-slate-700">En Règle / Soldé</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
            <span className="font-semibold text-slate-700">Acompte / Instruction</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#dc2626]" />
            <span className="font-semibold text-slate-700">Sanction / Fermeture</span>
          </div>
        </div>
      </div>

      {/* Filter and Arrondissements Quick Selector */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => handleZoomToArrondissement('ALL')}
            className={`px-2.5 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
              selectedArrondissement === 'ALL'
                ? 'bg-[#022448] text-white shadow'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Tous les 6 Arrondissements
          </button>

          {TERRITORIAL_REFERENTIAL.map(arr => (
            <button
              key={arr.code}
              onClick={() => handleZoomToArrondissement(arr.code)}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
                selectedArrondissement === arr.code
                  ? 'bg-[#006d2f] text-white font-bold shadow'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {arr.name.replace('Arrondissement ', 'Arr. ')}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1">
          {(['ALL', 'EN_REGLE', 'ACOMPTE', 'SANCTION'] as const).map(flt => (
            <button
              key={flt}
              onClick={() => setSelectedFilter(flt)}
              className={`px-2 py-1 rounded text-[11px] font-bold ${
                selectedFilter === flt ? 'bg-amber-400 text-slate-950' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {flt === 'ALL' ? 'Tous' : flt === 'EN_REGLE' ? 'Conformes' : flt === 'ACOMPTE' ? 'Acomptes' : 'Sanctions'}
            </button>
          ))}
        </div>
      </div>

      {/* Map + Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Leaflet Map Box */}
        <div className="lg:col-span-8 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden shadow-sm h-[520px] relative">
          <div ref={mapContainerRef} className="w-full h-full z-0" />
        </div>

        {/* Selected Establishment Card or Summary */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between h-[520px] overflow-y-auto">
          {selectedEst ? (
            <div className="space-y-3">
              <div className="border-b pb-2">
                <span className="text-[10px] font-mono-ref bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">
                  {selectedEst.id}
                </span>
                <h3 className="text-base font-black text-[#022448] mt-1 uppercase">
                  {selectedEst.name}
                </h3>
                <p className="text-xs text-slate-500">{selectedEst.arrondissement} • {selectedEst.quartier}</p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="bg-slate-50 p-2.5 rounded">
                  <span className="text-slate-400 uppercase font-bold text-[10px]">Promoteur</span>
                  <p className="font-bold text-slate-800">{selectedEst.promoter_name}</p>
                  <p className="font-mono-ref text-slate-600">{selectedEst.phone}</p>
                </div>

                <div className="bg-slate-50 p-2.5 rounded">
                  <span className="text-slate-400 uppercase font-bold text-[10px]">Activité & Superficie</span>
                  <p className="font-bold text-slate-800">{selectedEst.activity_type}</p>
                  <p className="text-slate-600">{selectedEst.surface_m2} m² • {selectedEst.regime_type}</p>
                </div>

                <div className="bg-slate-50 p-2.5 rounded">
                  <span className="text-slate-400 uppercase font-bold text-[10px]">Situation Financière</span>
                  <p className="font-mono-ref font-bold text-slate-800">
                    Total : {selectedEst.total_due.toLocaleString('fr-FR')} FCFA
                  </p>
                  <p className="font-mono-ref font-bold text-emerald-700">
                    Payé : {selectedEst.amount_paid.toLocaleString('fr-FR')} FCFA
                  </p>
                  <p className="font-mono-ref text-amber-800">
                    Solde : {selectedEst.balance_due.toLocaleString('fr-FR')} FCFA
                  </p>
                </div>

                {selectedEst.decibel_level && (
                  <div className="bg-slate-50 p-2.5 rounded flex justify-between items-center">
                    <span className="font-semibold text-slate-700">Niveau Sonore :</span>
                    <span className="font-mono-ref font-bold">{selectedEst.decibel_level} dB</span>
                  </div>
                )}
              </div>

              <div className="pt-2 space-y-2">
                <button
                  onClick={() => {
                    setActiveModule('MOD-02');
                    triggerNotification(`Établissement ${selectedEst.name} ouvert dans la fiche contradictoire SAA.`, 'info');
                  }}
                  className="w-full bg-[#006d2f] hover:bg-[#005a26] text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ouvrir Fiche Contradictoire SAA</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <MapPin className="w-12 h-12 text-slate-300 mb-2" />
              <h4 className="font-bold text-slate-800 text-sm">Sélectionnez un Établissement</h4>
              <p className="text-xs text-slate-500 mt-1">
                Cliquez sur un marqueur cartographique pour examiner la fiche contradictoire, le niveau de décibels et les coordonnées GPS.
              </p>
              <div className="mt-4 text-xs font-mono-ref text-slate-600 bg-slate-50 p-3 rounded-lg border w-full text-left">
                <p>• {filteredEsts.length} Établissements visibles</p>
                <p>• 6 Arrondissements couverts</p>
                <p>• Référentiel SIG Pointe-Noire 2026</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

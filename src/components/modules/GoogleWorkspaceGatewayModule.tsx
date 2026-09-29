import React, { useState } from 'react';
import {
  CloudDownload,
  Calendar,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Plus,
  ArrowRight,
  Shield,
  FileSpreadsheet,
  Check
} from 'lucide-react';
import { useSession } from '../../context/SessionContext';
import { storageService, calculateEstablishmentFee } from '../../services/storageService';
import { ArrondissementCode, RegimeType } from '../../types';

interface ScannedCalendarEvent {
  id: string;
  summary: string;
  description: string;
  location: string;
  start: string;
  parsedData: {
    name: string;
    promoter: string;
    phone: string;
    arrondissement: ArrondissementCode;
    quartier: string;
    activity: string;
    surface: number;
    regime: RegimeType;
  };
  selected: boolean;
  imported: boolean;
}

export const GoogleWorkspaceGatewayModule: React.FC = () => {
  const { currentUser, triggerNotification } = useSession();
  const [isConnected, setIsConnected] = useState(true);
  const [isScanning, setIsScanning] = useState(false);

  const [scannedEvents, setScannedEvents] = useState<ScannedCalendarEvent[]>([
    {
      id: 'gcal-001',
      summary: 'Inspection SAA : Le Privilège Lounge VIP (Mpita)',
      description: 'Contrôle agrément, vérification limiteur acoustique et mise en demeure paiement tranche 2. Gérant: M. Michel GOMA (+242 06 612 34 56)',
      location: 'Mpita, Arrondissement 1 Lumumba, Pointe-Noire',
      start: '2026-09-30T10:00:00',
      parsedData: {
        name: 'Le Privilège Lounge VIP',
        promoter: 'Michel GOMA',
        phone: '+242 06 612 34 56',
        arrondissement: '1_LUMUMBA',
        quartier: 'Mpita',
        activity: 'A1.2',
        surface: 140,
        regime: 'FORMEL'
      },
      selected: true,
      imported: false
    },
    {
      id: 'gcal-002',
      summary: 'Recensement In Situ : Bar Dancing Ponton La Belle (Makayabou)',
      description: 'Établissement informel signalé. Mesure de surface au sol, notification frais de dossier et délivrance convocation. Promotrice: Mme Sylvie MAVOUNGOU (+242 05 531 22 11)',
      location: 'Makayabou, Arrondissement 2 Mvou-Mvou, Pointe-Noire',
      start: '2026-09-30T14:30:00',
      parsedData: {
        name: 'Bar Dancing Ponton La Belle',
        promoter: 'Sylvie MAVOUNGOU',
        phone: '+242 05 531 22 11',
        arrondissement: '2_MVOUMVOU',
        quartier: 'Makayabou',
        activity: 'A1.3',
        surface: 95,
        regime: 'INFORMEL'
      },
      selected: true,
      imported: false
    },
    {
      id: 'gcal-003',
      summary: 'Notification Fermeture Administrative : Snack Bar Le Bambou (Fond Tié-Tié)',
      description: 'Exécution arrêté N° 044/DDL-PN/2026 suite à non-réponse mise en demeure 72h. Gérant: M. Patrick LOUVOUANDOU (+242 06 988 77 66)',
      location: 'Fond Tié-Tié, Arrondissement 3 Tié-Tié, Pointe-Noire',
      start: '2026-10-01T09:00:00',
      parsedData: {
        name: 'Snack Bar Le Bambou',
        promoter: 'Patrick LOUVOUANDOU',
        phone: '+242 06 988 77 66',
        arrondissement: '3_TIETIE',
        quartier: 'Fond Tié-Tié',
        activity: 'A2.1',
        surface: 65,
        regime: 'INFORMEL'
      },
      selected: false,
      imported: false
    },
    {
      id: 'gcal-004',
      summary: 'Enquête Nouveau Club : Les Dauphins de Siafoumou',
      description: 'Dossier préliminaire. Promoteur: Joseph BANTSIMBA (+242 06 644 11 00). Surface approx 180m2.',
      location: 'Siafoumou, Arrondissement 4 Loandjili, Pointe-Noire',
      start: '2026-10-01T15:00:00',
      parsedData: {
        name: 'Les Dauphins de Siafoumou',
        promoter: 'Joseph BANTSIMBA',
        phone: '+242 06 644 11 00',
        arrondissement: '4_LOANDJILI',
        quartier: 'Siafoumou',
        activity: 'A2.2',
        surface: 180,
        regime: 'INFORMEL'
      },
      selected: true,
      imported: false
    }
  ]);

  const handleScanAgenda = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      triggerNotification('Scan Google Agenda complété : 4 tournées de brigade identifiées et parsées.', 'success');
    }, 800);
  };

  const toggleSelect = (id: string) => {
    setScannedEvents(prev =>
      prev.map(e => (e.id === id ? { ...e, selected: !e.selected } : e))
    );
  };

  const handleImportSelected = () => {
    const toImport = scannedEvents.filter(e => e.selected && !e.imported);
    if (toImport.length === 0) {
      triggerNotification('Veuillez sélectionner au moins un événement à importer.', 'warning');
      return;
    }

    toImport.forEach(item => {
      const p = item.parsedData;
      const { filingFee, ratePerSqm, totalDue } = calculateEstablishmentFee(p.activity, p.surface, p.regime);

      storageService.addEstablishment({
        name: p.name,
        promoter_name: p.promoter,
        phone: p.phone,
        arrondissement: p.arrondissement,
        quartier: p.quartier,
        address: item.location,
        activity_type: p.activity === 'A1.2' ? 'VIP Lounge' : (p.activity === 'A1.3' ? 'Bar Dancing' : 'Snack Bar'),
        activity_code: p.activity,
        regime_type: p.regime,
        surface_m2: p.surface,
        filing_fee: filingFee,
        rate_per_sqm: ratePerSqm,
        total_due: totalDue,
        amount_paid: 0,
        balance_due: totalDue,
        status: 'identifie',
        identified_by: `${currentUser.name} (Google Workspace Sync)`,
        identified_date: new Date().toISOString().split('T')[0],
        coordinates: [-4.78, 11.87],
        installments_chosen: 2,
        notes: `Importé automatiquement via Google Agenda SAA (${item.summary})`
      });
    });

    setScannedEvents(prev =>
      prev.map(e => (e.selected ? { ...e, imported: true, selected: false } : e))
    );

    triggerNotification(`${toImport.length} nouveaux établissements importés dans la base centrale DDL-PN.`, 'success');
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded font-mono-ref">
              GOOGLE WORKSPACE • CALENDAR API
            </span>
            <span className="text-xs text-slate-500">OAuth 2.0 Read-Only</span>
          </div>
          <h2 className="text-lg font-black text-[#022448] tracking-tight mt-1 flex items-center gap-2">
            <CloudDownload className="w-5 h-5 text-blue-600" />
            <span>Passerelle d'Importation Google Agenda SAA</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Synchronisez l'agenda de tournée de l'agent enquêteur, extrayez les données des exploitants et injectez-les dans le Système Intégré DDL-PN.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleScanAgenda}
            disabled={isScanning}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scan en cours...' : 'Scanner mon Agenda'}</span>
          </button>
        </div>
      </div>

      {/* Gateway Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-[#006d2f] flex items-center justify-center font-bold">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Compte Synchronisé</p>
            <p className="font-bold text-slate-800">{currentUser.email || 'brigade.saa@ddl-pointenoire.cg'}</p>
            <p className="text-emerald-700 text-[10px] font-semibold">Connexion Active (Token certifié)</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Événements Détectés</p>
            <p className="font-bold text-slate-800">{scannedEvents.length} Tournées au planning</p>
            <p className="text-slate-500 text-[10px]">Parser automatique nom / tél / surface</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Sécurité Administrative</p>
            <p className="font-bold text-slate-800">Validation Contradictoire</p>
            <p className="text-slate-500 text-[10px]">Évite les doublons avec le RCCM</p>
          </div>
        </div>
      </div>

      {/* Parser Table of Scanned Tournees */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Tournées et Établissements Extraits de Google Calendar
            </h3>
            <p className="text-xs text-slate-500">
              Cochez les locaux à créer automatiquement dans la base de données centrale DDL-PN.
            </p>
          </div>

          <button
            onClick={handleImportSelected}
            className="bg-[#006d2f] hover:bg-[#005a26] text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow transition"
          >
            <Plus className="w-4 h-4" />
            <span>Importer les sélectionnés vers Supabase</span>
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {scannedEvents.map(event => {
            const p = event.parsedData;
            return (
              <div
                key={event.id}
                className={`p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition ${
                  event.imported ? 'bg-slate-50 opacity-60' : event.selected ? 'bg-blue-50/40' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-3 flex-1">
                  <input
                    type="checkbox"
                    disabled={event.imported}
                    checked={event.selected}
                    onChange={() => toggleSelect(event.id)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-[#006d2f] focus:ring-[#006d2f]"
                  />

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-[#022448]">{p.name}</span>
                      <span className="text-[10px] font-mono-ref bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded">
                        {p.arrondissement}
                      </span>
                      {event.imported && (
                        <span className="text-[10px] bg-emerald-100 text-[#006d2f] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>Déjà importé</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 mt-0.5">
                      Promoteur : <strong>{p.promoter}</strong> • Tél: <span className="font-mono-ref font-semibold">{p.phone}</span>
                    </p>

                    <p className="text-[11px] text-slate-500 mt-1 italic">
                      Agenda : « {event.summary} » — {event.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono-ref">
                  <div className="text-right">
                    <span className="text-slate-500 block text-[10px]">Surface & Secteur</span>
                    <span className="font-bold text-slate-800">{p.surface} m² • {p.regime}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-slate-500 block text-[10px]">Catégorie</span>
                    <span className="font-bold text-blue-700">{p.activity}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

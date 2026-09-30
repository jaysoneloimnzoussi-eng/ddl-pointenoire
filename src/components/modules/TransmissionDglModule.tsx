import React, { useState } from 'react';
import {
  Send,
  Building2,
  CheckCircle,
  FileCheck,
  Printer,
  FileText,
  Clock,
  ArrowRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { useSession } from '../../context/SessionContext';
import { Establishment } from '../../types';
import { PrintModal, PrintDocumentType } from '../print/PrintModal';

export const TransmissionDglModule: React.FC = () => {
  const { currentUser, triggerNotification } = useSession();
  const [establishments, setEstablishments] = useState<Establishment[]>(() => storageService.getEstablishments());

  // Ready for transmission (attestation_depot or soldé)
  const readyForTransmission = establishments.filter(
    e => e.status === 'attestation_depot' && e.balance_due === 0
  );

  // Already transmitted
  const transmittedBatches = [
    {
      batchNumber: 'BORD-DGL-PN-2026-03',
      date: '2026-08-20',
      count: 18,
      status: 'REÇU_A_BRAZZAVILLE',
      signataire: 'Jean Richard NTSEKE NGOUAKA',
      totalAmount: 4680000
    },
    {
      batchNumber: 'BORD-DGL-PN-2026-02',
      date: '2026-05-15',
      count: 20,
      status: 'ARRETES_SIGNES_MINISTERE',
      signataire: 'Jean Richard NTSEKE NGOUAKA',
      totalAmount: 5200000
    },
    {
      batchNumber: 'BORD-DGL-PN-2026-01',
      date: '2026-02-28',
      count: 14,
      status: 'ARRETES_SIGNES_MINISTERE',
      signataire: 'Jean Richard NTSEKE NGOUAKA',
      totalAmount: 3840000
    }
  ];

  const [selectedIds, setSelectedIds] = useState<string[]>(readyForTransmission.map(e => e.id));

  // Print modal
  const [printDoc, setPrintDoc] = useState<{
    isOpen: boolean;
    type: PrintDocumentType;
    title: string;
    data: any;
  }>({
    isOpen: false,
    type: 'SOIT_TRANSMIS_A4',
    title: '',
    data: null
  });

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const handleCreateBatch = (format: 'SOIT_TRANSMIS' | 'BORDEREAU') => {
    if (selectedIds.length === 0) {
      triggerNotification('Veuillez sélectionner au moins un dossier soldé à transmettre.', 'warning');
      return;
    }

    const batchRef = `BORD-DGL-PN-2026-${String(transmittedBatches.length + 1).padStart(2, '0')}`;
    selectedIds.forEach(id => {
      storageService.updateEstablishment(id, {
        status: 'transmis_brazzaville',
        dgl_transmission_batch: batchRef,
        dgl_transmission_date: new Date().toISOString().split('T')[0]
      });
    });

    setEstablishments(storageService.getEstablishments());
    triggerNotification(`Transmission ${batchRef} générée pour ${selectedIds.length} dossiers !`, 'success');

    const transmittedItems = establishments.filter(e => selectedIds.includes(e.id));

    setPrintDoc({
      isOpen: true,
      type: format === 'SOIT_TRANSMIS' ? 'SOIT_TRANSMIS_A4' : 'BORDEREAU_DGL_A4',
      title: format === 'SOIT_TRANSMIS' ? `Lettre Soit Transmis - ${batchRef}` : `Bordereau Récapitulatif - ${batchRef}`,
      data: {
        reference_number: batchRef,
        count: selectedIds.length,
        items: transmittedItems,
        transmission_message: `J’ai l’honneur de vous faire parvenir, pour toutes fins utiles et signature ministérielle, le bordereau récapitulatif ainsi que les ${selectedIds.length} dossiers d'agrément instruits et régularisés au titre de l'exercice 2026.`,
        signataire: currentUser.role === 'DIRECTEUR' ? currentUser.name : 'Jean Richard NTSEKE NGOUAKA',
        date_emission: new Date().toISOString().split('T')[0]
      }
    });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-indigo-100 text-indigo-900 font-bold px-2 py-0.5 rounded font-mono-ref">
              CIRCUIT HIÉRARCHIQUE CENTRAL
            </span>
            <span className="text-xs text-slate-500">Direction Générale des Loisirs (Brazzaville)</span>
          </div>
          <h2 className="text-base sm:text-lg font-black text-[#022448] tracking-tight mt-1 flex items-center gap-2">
            <Send className="w-5 h-5 text-indigo-700" />
            <span>Circuit de Transmission Centrale & Bordereaux d'Envoi DGL</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Validation hiérarchique par le Directeur Départemental et transmission officielle des dossiers soldés pour arrêté ministériel définitif.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleCreateBatch('SOIT_TRANSMIS')}
            disabled={selectedIds.length === 0}
            className="bg-[#022448] hover:bg-[#033468] disabled:opacity-50 text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow transition"
          >
            <Printer className="w-3.5 h-3.5 text-amber-300" />
            <span>Lettre Soit Transmis ({selectedIds.length})</span>
          </button>
          <button
            onClick={() => handleCreateBatch('BORDEREAU')}
            disabled={selectedIds.length === 0}
            className="bg-[#006d2f] hover:bg-[#005a26] disabled:opacity-50 text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow transition"
          >
            <Printer className="w-3.5 h-3.5 text-white" />
            <span>Bordereau Récapitulatif</span>
          </button>
        </div>
      </div>

      {/* Grid: Ready Dossiers vs Historic Batches */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Ready Dossiers to Transmit */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-bold text-sm text-[#022448]">
                Dossiers Réceptionnés, Inspectés et Soldés à 100%
              </h3>
              <p className="text-xs text-slate-500">
                Prêts pour soumission sous pli ministériel scellé.
              </p>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded font-mono-ref">
              {readyForTransmission.length} Éligibles
            </span>
          </div>

          {readyForTransmission.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              Tous les dossiers complets actuels ont déjà été transmis à la DGL Brazzaville.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {readyForTransmission.map(est => (
                <div key={est.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(est.id)}
                      onChange={() => toggleSelect(est.id)}
                      className="rounded border-slate-300 text-[#006d2f] focus:ring-[#006d2f]"
                    />
                    <div>
                      <p className="font-extrabold text-[#022448]">{est.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {est.promoter_name} • {est.arrondissement} ({est.surface_m2} m²)
                      </p>
                    </div>
                  </div>
                  <div className="text-right font-mono-ref">
                    <span className="font-bold text-emerald-800 block">{est.amount_paid.toLocaleString('fr-FR')} FCFA</span>
                    <span className="text-[10px] text-slate-400">Soldé Intégral</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Transmitted Batches History */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="border-b pb-3">
            <h3 className="font-bold text-sm text-[#022448]">Historique des Bordereaux Envoyés</h3>
            <p className="text-xs text-slate-500">Suivi des lots transmis au siège central DGL</p>
          </div>

          <div className="space-y-3">
            {transmittedBatches.map(b => (
              <div key={b.batchNumber} className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono-ref font-bold text-[#022448] text-xs">
                    {b.batchNumber}
                  </span>
                  <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.5 rounded">
                    {b.status === 'ARRETES_SIGNES_MINISTERE' ? 'Arrêtés Signés' : 'En Examen DGL'}
                  </span>
                </div>

                <div className="mt-2 text-slate-600 flex justify-between">
                  <span>Volume : <strong>{b.count} dossiers</strong></span>
                  <span className="font-mono-ref font-bold">{b.totalAmount.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">Signataire : {b.signataire}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setPrintDoc({
                          isOpen: true,
                          type: 'SOIT_TRANSMIS_A4',
                          title: `Lettre Soit Transmis - ${b.batchNumber}`,
                          data: {
                            reference_number: b.batchNumber,
                            count: b.count,
                            transmission_message: `J’ai l’honneur de vous faire parvenir, pour toutes fins utiles et signature ministérielle, le bordereau récapitulatif ainsi que les ${b.count} dossiers d'agrément instruits et régularisés au titre de l'exercice 2026.`,
                            signataire: b.signataire,
                            date_emission: b.date
                          }
                        });
                      }}
                      className="text-[#022448] hover:underline font-bold text-[11px] flex items-center gap-0.5"
                    >
                      <Printer className="w-3 h-3" />
                      <span>Soit Transmis</span>
                    </button>
                    <button
                      onClick={() => {
                        const batchEsts = establishments.filter(e => e.dgl_transmission_batch === b.batchNumber || e.status === 'transmis_brazzaville' || e.status === 'autorise_dgl').slice(0, b.count);
                        setPrintDoc({
                          isOpen: true,
                          type: 'BORDEREAU_DGL_A4',
                          title: `Bordereau Récapitulatif - ${b.batchNumber}`,
                          data: {
                            reference_number: b.batchNumber,
                            count: b.count,
                            items: batchEsts,
                            signataire: b.signataire,
                            date_emission: b.date
                          }
                        });
                      }}
                      className="text-[#006d2f] hover:underline font-bold text-[11px] flex items-center gap-0.5"
                    >
                      <Printer className="w-3 h-3" />
                      <span>Bordereau</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Print Modal */}
      <PrintModal
        isOpen={printDoc.isOpen}
        onClose={() => setPrintDoc(prev => ({ ...prev, isOpen: false }))}
        documentType={printDoc.type}
        title={printDoc.title}
        data={printDoc.data}
      />
    </div>
  );
};

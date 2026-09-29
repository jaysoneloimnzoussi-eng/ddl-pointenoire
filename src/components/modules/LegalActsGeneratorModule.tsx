import React, { useState } from 'react';
import {
  FileCheck2,
  AlertTriangle,
  ShieldAlert,
  Printer,
  Plus,
  Building2,
  Calendar,
  UserCheck,
  Scale,
  CheckCircle2
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { useSession } from '../../context/SessionContext';
import { OfficialLegalAct, Establishment } from '../../types';
import { PrintModal } from '../print/PrintModal';

export const LegalActsGeneratorModule: React.FC = () => {
  const { currentUser, triggerNotification } = useSession();
  const [acts, setActs] = useState<OfficialLegalAct[]>(() => storageService.getActs());
  const establishments = storageService.getEstablishments();

  // Generator form modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [targetEstId, setTargetEstId] = useState<string>(establishments[0]?.id || '');
  const [actType, setActType] = useState<OfficialLegalAct['type']>('MISE_EN_DEMEURE');
  const [delai, setDelai] = useState<string>('72 heures ouvrées (sous huitaine)');
  const [motif, setMotif] = useState<string>(
    'Exploitation illicite sans agrément préalable d’ouverture, non-paiement des redevances et tapage nocturne avéré.'
  );

  // Print modal
  const [printDoc, setPrintDoc] = useState<{
    isOpen: boolean;
    type: 'ACTE_JURIDIQUE_A4';
    title: string;
    data: any;
  }>({
    isOpen: false,
    type: 'ACTE_JURIDIQUE_A4',
    title: '',
    data: null
  });

  const handleCreateAct = (e: React.FormEvent) => {
    e.preventDefault();
    const est = establishments.find(e => e.id === targetEstId);
    if (!est) return;

    const refNumber =
      actType === 'MISE_EN_DEMEURE'
        ? `MD-${String(acts.length + 90).padStart(3, '0')}/MCAPNIT/DGL/DDL-PN-2026`
        : actType === 'CONVOCATION'
        ? `CONV-${String(acts.length + 150).padStart(3, '0')}/DDL-PN/SAA-2026`
        : actType === 'ARRETE_FERMETURE'
        ? `ARR-FERM-${String(acts.length + 15).padStart(3, '0')}/DDL-PN-2026`
        : `OM-${String(acts.length + 40).padStart(3, '0')}/DDL-PN-2026`;

    const newAct = storageService.addAct({
      type: actType,
      reference_number: refNumber,
      establishment_id: est.id,
      establishment_name: est.name,
      promoter_name: est.promoter_name,
      arrondissement: est.arrondissement,
      address: est.address,
      date_emission: new Date().toISOString().split('T')[0],
      delai_huitaine_date: delai,
      motif,
      signataire_nom: currentUser.role === 'DIRECTEUR' ? currentUser.name : 'Jacques Alphonse MATOKO',
      signataire_titre: currentUser.role === 'DIRECTEUR' ? currentUser.title : 'Directeur Départemental des Loisirs de Pointe-Noire',
      agent_notificateur: `${currentUser.name} (${currentUser.badge})`,
      visa_lois: [
        'Loi N° 21-2019 du 12 juillet 2019 fixant le régime général des loisirs en République du Congo',
        'Décret N° 2021-412 du 28 octobre 2021 portant organisation de la DGL',
        'Arrêté Départemental N° 018/DDL-PN-2026 relatif aux normes acoustiques nocturnes'
      ]
    });

    setActs(storageService.getActs());
    setIsCreateModalOpen(false);
    triggerNotification(`Acte républicain émis : ${newAct.reference_number}`, 'success');

    // Propose immediate print
    setPrintDoc({
      isOpen: true,
      type: 'ACTE_JURIDIQUE_A4',
      title: `Acte Officiel - ${newAct.reference_number}`,
      data: newAct
    });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-red-100 text-red-900 font-bold px-2 py-0.5 rounded font-mono-ref">
              CONTENTIEUX & POLICE ADMINISTRATIVE
            </span>
            <span className="text-xs text-slate-500">Sous Sceau de la République</span>
          </div>
          <h2 className="text-lg font-black text-[#022448] tracking-tight mt-1 flex items-center gap-2">
            <Scale className="w-5 h-5 text-red-700" />
            <span>Atelier de Rédaction des Actes & Mesures Conservatoires</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Génération, notification et exécution des mises en demeure sous 72h, convocations contradictoires et arrêtés de fermeture administrative.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-red-700 hover:bg-red-800 text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow transition"
        >
          <Plus className="w-4 h-4" />
          <span>Rédiger un Acte Juridique</span>
        </button>
      </div>

      {/* Actes Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {acts.map(act => {
          const isFermeture = act.type === 'ARRETE_FERMETURE';
          const isMiseEnDemeure = act.type === 'MISE_EN_DEMEURE';
          return (
            <div
              key={act.id}
              className={`p-4 rounded-xl border bg-white shadow-sm flex flex-col justify-between transition hover:shadow-md ${
                isFermeture ? 'border-red-300 ring-1 ring-red-200' : isMiseEnDemeure ? 'border-amber-300' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono-ref font-bold text-slate-500">
                    {act.date_emission}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase font-mono-ref ${
                      isFermeture
                        ? 'bg-red-600 text-white'
                        : isMiseEnDemeure
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-blue-100 text-blue-900'
                    }`}
                  >
                    {act.type.replace(/_/g, ' ')}
                  </span>
                </div>

                <h3 className="font-extrabold text-base text-[#022448] mt-2">
                  {act.establishment_name}
                </h3>
                <p className="text-xs text-slate-600">
                  Gérant : <span className="font-semibold">{act.promoter_name}</span> ({act.arrondissement})
                </p>

                <p className="text-[11px] font-mono-ref text-slate-500 mt-1 font-bold">
                  {act.reference_number}
                </p>

                <div className="bg-slate-50 p-2.5 rounded border border-slate-200/80 my-3 text-xs italic text-slate-700">
                  « {act.motif} »
                </div>

                <div className="text-[11px] text-slate-500 space-y-0.5">
                  <p>Délai imparti : <strong>{act.delai_huitaine_date || '72 heures'}</strong></p>
                  <p>Signataire : <strong>{act.signataire_nom}</strong></p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">Format A4 Républicain</span>
                <button
                  onClick={() => {
                    setPrintDoc({
                      isOpen: true,
                      type: 'ACTE_JURIDIQUE_A4',
                      title: `Acte Officiel - ${act.reference_number}`,
                      data: act
                    });
                  }}
                  className="bg-[#022448] hover:bg-[#033468] text-white text-xs font-bold px-2.5 py-1.5 rounded flex items-center gap-1.5 shadow"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-300" />
                  <span>Imprimer A4</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Act Generator Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto p-6 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div>
                <h3 className="text-base font-black text-[#022448]">Rédaction d'un Acte de Police Administrative</h3>
                <p className="text-xs text-slate-500">Direction Départementale des Loisirs de Pointe-Noire</p>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-700 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAct} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nature de l'acte juridique *</label>
                <select
                  value={actType}
                  onChange={e => setActType(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded font-bold text-[#022448]"
                >
                  <option value="MISE_EN_DEMEURE">Mise en demeure sous huitaine (72 heures)</option>
                  <option value="CONVOCATION">Convocation officielle contradictoire SAA</option>
                  <option value="ARRETE_FERMETURE">Arrêté portant fermeture administrative immédiate</option>
                  <option value="ORDRE_MISSION">Ordre de mission d'inspection brigade</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Établissement ciblé *</label>
                <select
                  value={targetEstId}
                  onChange={e => setTargetEstId(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded"
                >
                  {establishments.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.name} — {e.promoter_name} ({e.arrondissement})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Délai d'exécution imparti *</label>
                <input
                  type="text"
                  required
                  value={delai}
                  onChange={e => setDelai(e.target.value)}
                  placeholder="Ex: 72 heures ouvrées"
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Motif circonstancié de l'infraction *</label>
                <textarea
                  rows={4}
                  required
                  value={motif}
                  onChange={e => setMotif(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded border text-[11px] text-slate-600 space-y-1">
                <p className="font-bold text-slate-800">Signataire de l'acte :</p>
                <p>Jacques Alphonse MATOKO (Directeur Départemental des Loisirs de Pointe-Noire)</p>
                <p className="text-slate-500">Agent notificateur : {currentUser.name} ({currentUser.badge})</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3.5 py-2 border rounded text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-bold rounded shadow transition flex items-center gap-1.5"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>Émettre et Générer l'Acte A4</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print Modal */}
      <PrintModal
        isOpen={printDoc.isOpen}
        onClose={() => setPrintDoc(prev => ({ ...prev, isOpen: false }))}
        documentType="ACTE_JURIDIQUE_A4"
        title={printDoc.title}
        data={printDoc.data}
      />
    </div>
  );
};

import React, { useState } from 'react';
import { X, Printer, ExternalLink, Download, CheckCircle2, ShieldCheck, QrCode, FileText } from 'lucide-react';
import { OfficialRepublicLogo, RepublicTricolorBar } from '../common/OfficialSeal';
import { OfficialVerifiableQrCode } from '../common/OfficialVerifiableQrCode';
import { REPUBLIQUE_CONGO } from '../../constants/referential';
import { OfficialReportDocumentView } from '../modules/OfficialReportDocumentView';
import { executeReliablePrint, openDocumentInNewTab } from '../../utils/printUtility';

export type PrintDocumentType =
  | 'ATTESTATION_A4'
  | 'SOIT_TRANSMIS_A4'
  | 'TICKET_58MM'
  | 'ACTE_JURIDIQUE_A4'
  | 'DIPLOME_HONNEUR_A4'
  | 'BORDEREAU_DGL_A4'
  | 'RAPPORT_TRIMESTRIEL_A4';

export interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: PrintDocumentType;
  title: string;
  data: any;
}

export const PrintModal: React.FC<PrintModalProps> = ({
  isOpen,
  onClose,
  documentType,
  title,
  data
}) => {
  const [isPrinting, setIsPrinting] = useState(false);

  if (!isOpen || !data) return null;

  const handlePrint = async () => {
    setIsPrinting(true);
    await executeReliablePrint('ddlpn-printable-sheet');
    setIsPrinting(false);
  };

  const handleOpenStandalone = () => {
    openDocumentInNewTab('ddlpn-printable-sheet', title);
  };

  return (
    <div className="print-modal-overlay fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="print-modal-container bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[94vh] flex flex-col overflow-hidden border border-slate-300">
        {/* Modal Controls (Hidden in print) */}
        <div className="no-print bg-[#022448] text-white px-3 sm:px-5 py-3 flex items-center justify-between border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-amber-300 shrink-0">
              <Printer className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold tracking-tight truncate max-w-[180px] sm:max-w-md">
                {title}
              </h3>
              <p className="text-[10px] text-slate-300 font-mono-ref hidden sm:block">
                {documentType === 'TICKET_58MM'
                  ? 'Format : Reçu Thermique POS 58mm'
                  : 'Format : Feuille A4 Officielle de la République du Congo'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Direct Primary Print Button */}
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="bg-[#006d2f] hover:bg-[#005a26] text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition cursor-pointer"
              title="Lancer l'impression immédiate"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isPrinting ? 'Préparation...' : 'Imprimer maintenant'}</span>
            </button>

            {/* Standalone Full-Page PDF Button */}
            <button
              onClick={handleOpenStandalone}
              className="hidden sm:flex bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold items-center gap-1.5 border border-slate-600 transition cursor-pointer"
              title="Ouvrir dans un nouvel onglet pour aperçu grand écran ou enregistrement PDF"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Pleine page / PDF</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Content Container */}
        <div className="flex-1 overflow-y-auto overflow-x-auto p-2 sm:p-6 bg-slate-100 flex justify-center">
          <div id="ddlpn-printable-sheet" className="w-full flex justify-center">
            {documentType === 'TICKET_58MM' ? (
              /* ===================================================================
                 PROTOTYPE 1: REÇU THERMIQUE DE TERRAIN (TICKET POS 58MM)
                 =================================================================== */
              <div className="print-ticket-58mm w-[58mm] bg-white p-3 font-mono-ref text-[11px] leading-tight text-black border border-dashed border-slate-300 shadow">
                <div className="text-center pb-2 border-b border-dashed border-black">
                  <OfficialRepublicLogo size="xs" className="mx-auto mb-1" />
                  <p className="font-extrabold text-[12px] uppercase">RÉPUBLIQUE DU CONGO</p>
                  <p className="text-[9px]">MINISTÈRE DE LA CULTURE ET LOISIRS</p>
                  <p className="font-bold text-[10px] mt-1">DIRECTION DÉPARTEMENTALE</p>
                  <p className="font-bold text-[10px]">DES LOISIRS DE POINTE-NOIRE</p>
                  <p className="text-[8px] italic mt-0.5">Régie des Recettes SAF • Service SAA</p>
                </div>

                <div className="my-2 text-center">
                  <span className="font-extrabold text-[11px] bg-black text-white px-1.5 py-0.5 inline-block">
                    QUITTANCE D'ENCAISSEMENT
                  </span>
                  <p className="text-[9.5px] mt-1 font-bold">RÉF : {data.receipt_reference || data.receiptReference || 'REC-DDL-PN-2026'}</p>
                  <p className="text-[8px]">
                    Date: {data.record_date || new Date().toISOString().split('T')[0]} • {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div className="text-[10px] border-t border-b border-dashed border-black py-1.5 my-1.5 space-y-1">
                  <div>
                    <span className="font-bold">Établissement:</span>
                    <p className="font-extrabold uppercase">{data.establishment_name || data.name}</p>
                  </div>
                  <div>
                    <span className="font-bold">Promoteur:</span>
                    <p>{data.promoter_name}</p>
                  </div>
                  <div>
                    <span className="font-bold">Arrondissement:</span>
                    <p>{data.arrondissement}</p>
                  </div>
                  {data.activity_type && (
                    <div>
                      <span className="font-bold">Activité:</span>
                      <p>{data.activity_type}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-1 my-2 text-[10px]">
                  <div className="flex justify-between">
                    <span>Redevance Totale :</span>
                    <span className="font-bold">{(data.total_fee || data.total_due || 0).toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div className="flex justify-between border-t border-black pt-1 font-extrabold text-[11px]">
                    <span>ACOMPTE PERÇU :</span>
                    <span>{(data.amount_paid || data.amount || 0).toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-700">
                    <span>Reste à payer :</span>
                    <span>{(data.balance_remaining ?? data.balance_due ?? 0).toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div className="flex justify-between text-[9px]">
                    <span>Mode règlement :</span>
                    <span>{data.payment_method || 'Espèces (Régie)'}</span>
                  </div>
                  {data.transaction_ref && (
                    <div className="flex justify-between text-[8px]">
                      <span>Transaction :</span>
                      <span>{data.transaction_ref}</span>
                    </div>
                  )}

                  {/* Rendez-vous convenu pour le versement du solde */}
                  {data.next_due_date && (
                    <div className="mt-2 pt-1 border-t border-dashed border-black bg-emerald-50 p-1.5 text-center rounded">
                      <span className="font-extrabold text-[8.5px] uppercase block text-emerald-950">
                        🤝 Prochain RDV Convenu (Solde)
                      </span>
                      <span className="font-mono-ref font-black text-[10px] text-black block">
                        {data.next_due_date}
                      </span>
                      {data.next_appointment_notes && (
                        <span className="text-[7.5px] text-slate-700 italic block leading-tight mt-0.5">
                          « {data.next_appointment_notes} »
                        </span>
                      )}
                    </div>
                  )}

                  {/* Renouvellement Annuel N+1 */}
                  {(data.annual_renewal_scheduled_date || data.annual_renewal_date) && (
                    <div className="mt-1.5 pt-1 border-t border-dashed border-black bg-amber-50 p-1 text-center">
                      <span className="font-extrabold text-[8.5px] uppercase block text-amber-950">
                        📅 Renouvellement Annuel N+1
                      </span>
                      <span className="font-mono-ref font-black text-[10px] text-black block">
                        {data.annual_renewal_scheduled_date || data.annual_renewal_date}
                      </span>
                      <span className="text-[7px] text-slate-700 italic block leading-tight">
                        (Échéance fixée au jour du 1er acompte de l'année suivante)
                      </span>
                    </div>
                  )}
                </div>

                {/* Verifiable QR Code */}
                <div className="text-center pt-2 border-t border-dashed border-black my-2">
                  <OfficialVerifiableQrCode
                    data={{
                      ref: data.receipt_reference || data.receiptReference || 'REC-DDL-PN-2026',
                      type: 'QUITTANCE_POS_58MM',
                      establishment_name: data.establishment_name || data.name,
                      promoter_name: data.promoter_name,
                      date: data.record_date,
                      amount: data.amount_paid || data.amount,
                      arrondissement: data.arrondissement
                    }}
                    size={62}
                    showDetails={false}
                    className="mx-auto"
                  />
                  <p className="text-[7.5px] mt-1 font-semibold uppercase">Scanner pour contrôle authenticité</p>
                  <p className="text-[7px] text-slate-600">Agent SAA : {data.collected_by || 'Agent Assermenté'}</p>
                  <p className="text-[6.5px] mt-0.5 italic">Conserver ce ticket pour toute vérification contradictoire.</p>
                </div>
              </div>
            ) : documentType === 'DIPLOME_HONNEUR_A4' ? (
              /* ===================================================================
                 PROTOTYPE 2: DIPLÔME D'HONNEUR DES LOISIRS SAINS (A4)
                 =================================================================== */
              <div className="print-page-a4 w-[210mm] min-h-[297mm] bg-amber-50/40 p-10 sm:p-12 text-slate-800 relative border-8 border-double border-amber-600/60 shadow-lg">
                <div className="absolute inset-4 border border-amber-600/30 pointer-events-none" />

                <div className="text-center relative z-10">
                  <OfficialRepublicLogo size="lg" showMotto={true} className="mx-auto" />
                  <div className="mt-2 text-xs font-bold uppercase tracking-widest text-[#006d2f] font-republic">
                    {REPUBLIQUE_CONGO.ministere}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-600">
                    DIRECTION GÉNÉRALE DES LOISIRS • DIRECTION DÉPARTEMENTALE DE POINTE-NOIRE
                  </div>

                  <div className="mt-8 mb-4">
                    <span className="text-xs uppercase tracking-widest font-bold px-4 py-1 bg-amber-200/60 text-amber-900 border border-amber-400 rounded-full font-serif">
                      DISTINCTION OFFICIELLE 2026
                    </span>
                    <h1 className="text-3xl font-extrabold text-[#022448] font-republic mt-4 tracking-wide uppercase">
                      DIPLÔME D’HONNEUR
                    </h1>
                    <h2 className="text-lg font-bold text-[#006d2f] font-serif italic mt-1">
                      Label Départemental des Loisirs Sains & d'Excellence Acoustique
                    </h2>
                  </div>

                  <p className="text-sm font-serif italic text-slate-700 max-w-lg mx-auto">
                    Le Directeur Départemental des Loisirs de Pointe-Noire, vu la Loi N° 21-2019, décerne le présent titre d'honneur à :
                  </p>

                  <div className="my-6 py-4 border-t-2 border-b-2 border-amber-500/40 max-w-xl mx-auto bg-white/70 shadow-inner">
                    <p className="text-2xl font-black text-[#022448] uppercase tracking-wider font-republic">
                      {data.establishment_name || data.name}
                    </p>
                    <p className="text-sm font-bold text-slate-700 mt-1">
                      Promoteur : <span className="text-[#006d2f] font-extrabold">{data.promoter_name}</span>
                    </p>
                    <p className="text-xs text-slate-500 font-medium">
                      Localisation : {data.arrondissement}
                    </p>
                  </div>

                  <div className="max-w-xl mx-auto text-left text-xs space-y-2 bg-white/60 p-4 rounded border border-amber-300">
                    <p className="font-bold text-[#022448] uppercase">Motifs d'attribution :</p>
                    <ul className="list-disc list-inside space-y-1 text-slate-700 font-serif">
                      {(data.reasons || [
                        'Conformité administrative et respect des normes certifiés par le Service SAA',
                        'Cadre d’accueil régulier et respect des règles d\'exploitation',
                        'Régularité des versements vis-à-vis des redevances d’État'
                      ]).map((r: string, idx: number) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-12 flex items-end justify-between max-w-xl mx-auto pt-6 border-t border-amber-400 text-xs">
                    <div className="text-left font-serif">
                      <p className="font-bold text-slate-800 text-xs uppercase">Enregistrement Officiel :</p>
                      <p className="text-amber-900 font-mono-ref font-bold text-sm">{data.reference_number || 'DIP-HONNEUR-DDLPN-2026'}</p>
                      <p className="text-[11px] text-slate-600 mt-1 italic">Fait à Pointe-Noire, le {data.award_date || new Date().toISOString().split('T')[0]}</p>
                    </div>

                    <div className="text-center font-serif">
                      <p className="text-xs font-bold text-slate-800 uppercase">Le Directeur Départemental des Loisirs,</p>
                      <div className="h-16 flex items-center justify-center italic text-slate-400 font-serif text-sm">
                        [Signature officielle et Sceau]
                      </div>
                      <p className="font-black text-[#022448] text-sm uppercase tracking-wide">Jean Richard NTSEKE NGOUAKA</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : documentType === 'RAPPORT_TRIMESTRIEL_A4' ? (
              /* ===================================================================
                 PROTOTYPE 3: RAPPORT TRIMESTRIEL OFFICIEL DDL-PN
                 =================================================================== */
              <div className="w-full">
                <OfficialReportDocumentView report={data} readOnly={true} />
              </div>
            ) : (
              /* ===================================================================
                 PROTOTYPES MAJEURS A4 RÉPUBLICAINS (ACTES JURIDIQUES & ATTESTATIONS)
                 =================================================================== */
              <div className="print-page-a4 w-[210mm] max-w-full bg-white p-8 sm:p-10 text-slate-900 relative border border-slate-300 shadow-xl leading-relaxed">
                {/* 1. OFFICIAL CONGO ADMINISTRATIVE HEADER */}
                <div className="flex items-start justify-between pb-4 border-b-2 border-[#022448]">
                  {/* Left: Hierarchical Authority Stack */}
                  <div className="text-center w-64 text-xs font-serif leading-tight">
                    <p className="font-extrabold text-sm uppercase text-[#006d2f] font-republic tracking-wide">
                      RÉPUBLIQUE DU CONGO
                    </p>
                    <p className="text-[10px] italic font-semibold text-slate-600">
                      Unité • Travail • Progrès
                    </p>
                    <div className="w-16 h-0.5 bg-amber-500 mx-auto my-1.5" />
                    <p className="font-bold text-[9.5px] uppercase text-[#022448]">
                      MINISTÈRE DE LA CULTURE, DES ARTS, DU PATRIMOINE NATIONAL ET DE L’INDUSTRIE TOURISTIQUE
                    </p>
                    <div className="w-10 h-0.5 bg-slate-300 mx-auto my-1" />
                    <p className="font-semibold text-[9px] uppercase">DIRECTION GÉNÉRALE DES LOISIRS</p>
                    <p className="font-bold text-[9.5px] text-[#006d2f] uppercase mt-1">
                      DIRECTION DÉPARTEMENTALE DES LOISIRS DE POINTE-NOIRE
                    </p>
                    <p className="text-[8.5px] font-mono-ref text-slate-500 mt-0.5">
                      SERVICE AGRÉMENT ET ASSAINISSEMENT (SAA)
                    </p>
                  </div>

                  {/* Center: Coat of Arms / Republic Seal */}
                  <div className="flex flex-col items-center pt-1">
                    <OfficialRepublicLogo size="md" showMotto={false} />
                    <RepublicTricolorBar className="w-24 mt-2 h-1" />
                  </div>

                  {/* Right: Date, Reference & Real Verifiable QR Code */}
                  <div className="text-right w-64 font-serif text-xs flex flex-col items-end">
                    <p className="italic text-slate-700">
                      Pointe-Noire, le {data.date_emission || data.record_date || new Date().toISOString().split('T')[0]}
                    </p>
                    <p className="font-mono-ref font-bold text-slate-900 mt-1 text-[11px]">
                      N° {data.reference_number || data.receipt_reference || 'REF-DDL-PN-2026/01'}
                    </p>
                    {data.type && (
                      <span className="inline-block my-1 px-2 py-0.5 bg-red-100 text-red-900 text-[9.5px] font-bold rounded border border-red-300 uppercase">
                        {data.type.replace(/_/g, ' ')}
                      </span>
                    )}
                    <div className="mt-1">
                      <OfficialVerifiableQrCode
                        data={{
                          ref: data.reference_number || data.receipt_reference || 'REF-DDL-PN-2026',
                          type: documentType,
                          establishment_name: data.establishment_name || data.name,
                          promoter_name: data.promoter_name,
                          date: data.date_emission || data.record_date,
                          arrondissement: data.arrondissement
                        }}
                        size={64}
                        showDetails={false}
                      />
                    </div>
                  </div>
                </div>

                {/* 2. BODY OF DOCUMENT BY INDIVIDUAL PROTOTYPE */}
                <div className="mt-6 font-serif">
                  {/* ==============================================================
                      ACTE JURIDIQUE: MISE EN DEMEURE SOUS HUITAINE (72H)
                     ============================================================== */}
                  {documentType === 'ACTE_JURIDIQUE_A4' && data.type === 'MISE_EN_DEMEURE' ? (
                    <div className="space-y-4">
                      <div className="text-center my-4">
                        <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-red-800 font-republic underline decoration-red-600 underline-offset-8">
                          MISE EN DEMEURE FORMELLE SOUS HUITAINE (72 HEURES)
                        </h2>
                        <p className="text-xs uppercase font-bold text-slate-600 mt-2 tracking-wider">
                          Sous peine de fermeture administrative immédiate avec apposition des scellés
                        </p>
                      </div>

                      {/* Destinataire Notification Box */}
                      <div className="bg-slate-50 border border-slate-300 p-3 rounded-lg text-xs leading-relaxed space-y-1">
                        <div className="flex justify-between">
                          <span><strong>Destinataire :</strong> {data.promoter_name} (Promoteur / Exploitant)</span>
                          <span className="font-mono-ref font-bold text-slate-600">Réf : {data.reference_number}</span>
                        </div>
                        <p><strong>Établissement :</strong> <span className="font-extrabold uppercase text-[#022448]">« {data.establishment_name} »</span></p>
                        <p><strong>Arrondissement :</strong> {data.arrondissement} • <strong>Adresse :</strong> {data.address || 'Quartier d\'implantation'}</p>
                        {data.agent_notificateur && (
                          <p className="text-[11px] text-slate-500 pt-0.5 border-t border-slate-200">
                            Agent notificateur assermenté : <strong>{data.agent_notificateur}</strong>
                          </p>
                        )}
                      </div>

                      {/* Visas Légaux Solennels */}
                      <div className="text-[11px] space-y-1 text-slate-600 border-l-2 border-red-700 pl-3 italic">
                        <p className="font-bold text-slate-800 not-italic uppercase text-[10px]">Visas légaux :</p>
                        <p>Vu la Constitution de la République du Congo ;</p>
                        <p>Vu la Loi N° 21-2019 du 12 juillet 2019 fixant le régime général des loisirs en République du Congo ;</p>
                        <p>Vu les textes réglementaires régissant l'ouverture et l'exploitation des établissements de loisirs ;</p>
                        <p>Vu les rapports de constatation dressés par les agents du Service Agrément et Assainissement (SAA).</p>
                      </div>

                      {/* Constatations & Motif */}
                      <div className="text-xs text-justify leading-relaxed space-y-3">
                        <p>
                          Il a été formellement constaté par les agents assermentés du Service Agrément et Assainissement (SAA) que l'établissement susvisé se trouve en situation d'irrégularité administrative :
                        </p>
                        <div className="bg-red-50 border-l-4 border-red-600 p-3 font-semibold text-red-950 text-xs leading-relaxed">
                          « {data.motif} »
                        </div>
                        <p>
                          En conséquence de quoi, <strong>IL VOUS EST IMPARTI UN DÉLAI IMPÉRATIF DE {data.delai_huitaine_date || '72 HEURES OUVRÉES'}</strong>, à compter de la notification du présent acte, pour vous présenter aux bureaux de la Direction Départementale des Loisirs munis des pièces justificatives et procéder à la régularisation fiscale et administrative intégrale de votre exploitation.
                        </p>
                        <p className="font-bold text-slate-900">
                          PASSÉ CE DÉLAI DE RIGUEUR, il sera immédiatement procédé, sans autre préavis ni sommation, à la FERMETURE ADMINISTRATIVE de votre établissement avec apposition des scellés de la République par le Service Agrément et Assainissement (SAA) assisté de la Force Publique, sans préjudice des poursuites judiciaires devant Monsieur le Procureur de la République.
                        </p>
                      </div>
                    </div>
                  ) : documentType === 'ACTE_JURIDIQUE_A4' && data.type === 'CONVOCATION' ? (
                    /* ==============================================================
                        ACTE JURIDIQUE: CONVOCATION OFFICIELLE CONTRADICTOIRE
                       ============================================================== */
                    <div className="space-y-4">
                      <div className="text-center my-4">
                        <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-purple-900 font-republic underline decoration-purple-600 underline-offset-8">
                          CONVOCATION ADMINISTRATIVE OFFICIELLE
                        </h2>
                        <p className="text-xs uppercase font-bold text-slate-600 mt-2 tracking-wider">
                          À comparution obligatoire sous visa de la Loi N° 21-2019
                        </p>
                      </div>

                      {/* Destinataire */}
                      <div className="bg-slate-50 border border-slate-300 p-3 rounded-lg text-xs leading-relaxed space-y-1">
                        <p><strong>Destinataire :</strong> Madame / Monsieur {data.promoter_name} (Promoteur / Exploitant)</p>
                        <p><strong>Établissement :</strong> <span className="font-extrabold uppercase text-[#022448]">« {data.establishment_name} »</span></p>
                        <p><strong>Arrondissement :</strong> {data.arrondissement} • <strong>Adresse :</strong> {data.address || 'Pointe-Noire'}</p>
                      </div>

                      <div className="text-xs text-justify leading-relaxed space-y-3">
                        <p>
                          Madame, Monsieur,
                        </p>
                        <p>
                          Dans le cadre de l’instruction de votre dossier d’exploitation et de l'assainissement réglementaire des structures de loisirs de la ville de Pointe-Noire, <strong>vous êtes formellement convoqué(e) à vous présenter en personne</strong> :
                        </p>

                        {/* Rendez-vous Card */}
                        <div className="bg-purple-50 border-2 border-purple-300 p-3.5 rounded-xl text-center space-y-1.5">
                          <p className="text-xs font-bold text-purple-950 uppercase">Date & Heure de Comparution Obligatoire :</p>
                          <p className="text-sm font-extrabold font-mono-ref text-purple-900">
                            📅 {data.delai_huitaine_date || 'Le jour ouvrable convenu'} à 10 Heures Précises
                          </p>
                          <p className="text-[11px] text-purple-950">
                            <strong>Lieu :</strong> Direction Départementale des Loisirs de Pointe-Noire — <strong>Bureau N° 3 (Service Agrément et Assainissement)</strong>, Centre-Ville, face Port Autonome.
                          </p>
                        </div>

                        {/* Mandatory Documents Checklist */}
                        <div>
                          <p className="font-bold text-slate-800 text-xs mb-1.5">
                            Vous voudrez bien vous munir obligatoirement des pièces suivantes :
                          </p>
                          <ol className="list-decimal list-inside space-y-1 text-xs text-slate-700 bg-white p-3 rounded border border-slate-200">
                            <li>Original et copie de votre Pièce d’Identité (CNI ou Passeport en cours de validité) ;</li>
                            <li>Extrait du Registre du Commerce et du Crédit Mobilier (RCCM) ou déclaration d'activité ;</li>
                            <li>Bail commercial ou titre d'occupation du local d'exploitation ;</li>
                            <li>Quittance ou reçu du dernier versement d’acompte délivré par la Régie des Recettes SAA ;</li>
                            <li>Fiche technique des installations acoustiques / conformité limiteur sonore.</li>
                          </ol>
                        </div>

                        <p className="text-[11px] italic text-slate-600">
                          Avertissement : En cas d’empêchement majeur, vous êtes tenu(e) de vous faire représenter par un mandataire dûment muni d’une procuration écrite. Tout défaut de comparution entraînera l’application des mesures conservatoires prévues par la réglementation.
                        </p>
                      </div>
                    </div>
                  ) : documentType === 'ACTE_JURIDIQUE_A4' && data.type === 'ARRETE_FERMETURE' ? (
                    /* ==============================================================
                        ACTE JURIDIQUE: ARRÊTÉ DE FERMETURE ADMINISTRATIVE
                       ============================================================== */
                    <div className="space-y-3">
                      <div className="text-center my-3">
                        <span className="text-[11px] font-mono-ref font-bold text-red-700 uppercase tracking-widest block">
                          DÉCISION EXÉCUTOIRE IMMÉDIATE
                        </span>
                        <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-red-900 font-republic mt-1">
                          ARRÊTÉ PORTANT FERMETURE ADMINISTRATIVE IMMÉDIATE
                        </h2>
                        <p className="text-xs uppercase font-bold text-slate-700 mt-1">
                          Et Apposition des Scellés de la République
                        </p>
                      </div>

                      {/* Visas & Considérants */}
                      <div className="text-[10.5px] leading-relaxed space-y-1 text-slate-700 italic border-l-2 border-red-700 pl-3">
                        <p>Vu la Loi N° 21-2019 du 12 juillet 2019 fixant le régime général des loisirs ;</p>
                        <p>Vu le Décret N° 2021-412 du 28 octobre 2021 organisant les services de la DGL ;</p>
                        <p>Considérant la mise en demeure formelle restée sans suite dans le délai légal imparti ;</p>
                        <p>Considérant les nuisances répétées, l'exercice sans titre officiel et le trouble avéré à l'ordre public départemental ;</p>
                      </div>

                      {/* Articles */}
                      <div className="text-xs space-y-2 text-justify leading-relaxed">
                        <p className="font-extrabold uppercase text-[#022448] text-center text-sm py-1 border-t border-b border-slate-300">
                          LE DIRECTEUR DÉPARTEMENTAL DES LOISIRS ARRÊTE :
                        </p>

                        <p>
                          <strong>ARTICLE 1er :</strong> Est ordonnée la fermeture administrative immédiate et totale de l’établissement de loisirs dénommé <strong className="text-red-900 uppercase">« {data.establishment_name} »</strong>, exploité par {data.promoter_name}, sis à {data.arrondissement} ({data.address || 'Pointe-Noire'}).
                        </p>

                        <p>
                          <strong>ARTICLE 2 :</strong> Il est fait interdiction absolue à quiconque d'exploiter lesdits locaux ou de recevoir du public. Les agents assermentés du Service Agrément et Assainissement (SAA) sont mandatés pour procéder à l’apposition des scellés officiels de la République sur les accès de l'établissement.
                        </p>

                        <p>
                          <strong>ARTICLE 3 :</strong> Tout bris, détérioration ou violation des scellés apposés expose les contrevenants aux sanctions pénales en vigueur relatives à la violation de scellés publics.
                        </p>

                        <p>
                          <strong>ARTICLE 4 :</strong> Les forces de police et de sécurité publique sont requises pour prêter main-forte à l'exécution sans délai du présent arrêté.
                        </p>
                      </div>
                    </div>
                  ) : documentType === 'ACTE_JURIDIQUE_A4' ? (
                    /* ==============================================================
                        ACTE JURIDIQUE: ORDRE DE MISSION SAA / CONTRÔLE
                       ============================================================== */
                    <div className="space-y-4">
                      <div className="text-center my-4">
                        <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-[#022448] font-republic underline decoration-blue-600 underline-offset-8">
                          ORDRE DE MISSION DE CONTRÔLE RÉPUBLICAIN IN SITU
                        </h2>
                        <p className="text-xs uppercase font-bold text-slate-600 mt-2 tracking-wider">
                          Service Agrément et Assainissement (SAA)
                        </p>
                      </div>

                      <div className="bg-slate-50 border border-slate-300 p-4 rounded-lg text-xs leading-relaxed space-y-2">
                        <p><strong>Agents Mandatés :</strong> <span className="font-bold text-[#006d2f]">{data.agent_notificateur || 'Agents Assermentés du Service SAA'}</span></p>
                        <p><strong>Objet de la Mission :</strong> Contrôle contradictoire de régularité d'exploitation, vérification des quittances et conformité des installations de loisirs.</p>
                        <p><strong>Établissement Visé :</strong> <span className="font-bold uppercase text-[#022448]">« {data.establishment_name} »</span> ({data.promoter_name})</p>
                        <p><strong>Secteur d'Intervention :</strong> {data.arrondissement} • {data.address || 'Pointe-Noire'}</p>
                      </div>

                      <div className="text-xs leading-relaxed text-justify space-y-3">
                        <p>
                          Le Directeur Départemental des Loisirs de Pointe-Noire ordonne aux agents assermentés ci-dessus désignés de se transporter au sein de l'établissement concerné afin de procéder aux opérations légales d'inspection, d'évaluation sonométrique et de vérification des quittances d'encaissement.
                        </p>
                        <p>
                          Les autorités administratives, civiles et militaires sont priées de faciliter l'accomplissement de la présente mission républicaine et de prêter main-forte en cas de réquisition expresse.
                        </p>
                      </div>
                    </div>
                  ) : documentType === 'SOIT_TRANSMIS_A4' || documentType === 'BORDEREAU_DGL_A4' ? (
                    /* ==============================================================
                        PROTOTYPE 4: SOIT TRANSMIS & BORDEREAU DGL BRAZZAVILLE
                       ============================================================== */
                    <div className="space-y-5 text-sm font-serif">
                      <div className="flex justify-end">
                        <div className="w-80 text-right">
                          <p className="font-bold text-slate-800 text-xs uppercase">
                            Le Directeur Départemental des Loisirs de Pointe-Noire
                          </p>
                          <div className="my-3 text-right">
                            <p className="text-xs italic text-slate-600">A</p>
                            <p className="italic text-base font-extrabold text-[#022448] tracking-wide">
                              Madame La Directrice Générale Des Loisirs.
                            </p>
                            <p className="text-xs font-bold text-slate-700">- Brazzaville -</p>
                          </div>
                        </div>
                      </div>

                      <div className="border-b-2 border-slate-300 pb-2">
                        <p className="text-sm">
                          <span className="font-extrabold text-[#022448] uppercase underline underline-offset-4">Objet :</span>{' '}
                          <span className="font-bold text-slate-900">Soit transmis pour décision & agrément.</span>
                        </p>
                      </div>

                      <div className="text-sm leading-relaxed space-y-4 text-slate-800 my-6">
                        <p className="font-bold">Madame la Directrice Générale,</p>
                        <p className="text-justify indent-8 leading-loose">
                          {data.transmission_message ||
                            data.motif ||
                            `J’ai l’honneur de vous faire parvenir, pour toutes fins utiles et signature ministérielle, le bordereau récapitulatif ainsi que les dossiers d'agrément instruits et régularisés au titre du Plan de Travail Annuel (PTA 2026).`}
                        </p>
                        <p className="text-justify indent-8 pt-2">
                          Je vous prie de recevoir, Madame la Directrice Générale, l’expression de mon plus grand respect/-
                        </p>
                      </div>

                      {/* Items Table */}
                      {data.items && data.items.length > 0 && (
                        <div className="my-4 pt-2">
                          <p className="text-xs font-bold uppercase text-[#022448] mb-2 font-mono-ref">
                            Bordereau Récapitulatif des Dossiers Transmis :
                          </p>
                          <table className="w-full text-xs border border-slate-300 text-left">
                            <thead className="bg-[#022448] text-white text-[11px]">
                              <tr>
                                <th className="p-2 border border-slate-400">N°</th>
                                <th className="p-2 border border-slate-400">Établissement</th>
                                <th className="p-2 border border-slate-400">Promoteur</th>
                                <th className="p-2 border border-slate-400">Arrondissement</th>
                                <th className="p-2 border border-slate-400 text-right">Montant Perçu</th>
                              </tr>
                            </thead>
                            <tbody>
                              {data.items.slice(0, 8).map((it: any, i: number) => (
                                <tr key={i} className="border-b border-slate-200">
                                  <td className="p-2 border border-slate-300 font-bold">{i + 1}</td>
                                  <td className="p-2 border border-slate-300 font-semibold">{it.name || it.establishment_name}</td>
                                  <td className="p-2 border border-slate-300">{it.promoter_name}</td>
                                  <td className="p-2 border border-slate-300">{it.arrondissement}</td>
                                  <td className="p-2 border border-slate-300 font-mono-ref font-bold text-right text-emerald-800">
                                    {(it.amount_paid || it.total_fee || 0).toLocaleString('fr-FR')} FCFA
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* ==============================================================
                        PROTOTYPE 5: ATTESTATION DE DÉPÔT ET TITRE PROVISOIRE A4
                       ============================================================== */
                    <div className="space-y-6 my-4">
                      <div className="text-center my-4">
                        <span className="text-[10px] font-mono-ref font-bold text-[#006d2f] uppercase tracking-widest block">
                          TITRE TRANSITOIRE D'EXPLOITATION
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-widest text-[#022448] font-republic underline decoration-[#006d2f] underline-offset-8 mt-1">
                          ATTESTATION DE DÉPÔT
                        </h1>
                        <p className="text-xs text-slate-500 italic mt-2">
                          Délivrée en application de la Loi N° 21-2019 du 12 juillet 2019
                        </p>
                      </div>

                      <div className="text-sm sm:text-base text-justify leading-loose space-y-4 font-serif text-slate-900 px-2 sm:px-4">
                        <p className="indent-8 leading-relaxed">
                          Par la présente, je soussigné, Directeur Départemental des Loisirs de Pointe-Noire, atteste que{' '}
                          <strong className="font-bold text-[#022448]">
                            {data.promoter_title || 'Monsieur/Madame'} {data.promoter_name || 'l’Exploitant'}
                          </strong>,{' '}
                          a déposé un dossier d'instruction en vue de solliciter l'agrément officiel d'exploitation d'un{' '}
                          <strong className="font-bold">
                            {data.activity_type || data.activity_code || 'établissement de loisirs et divertissements'}
                          </strong>,{' '}
                          dénommé{' '}
                          <strong className="font-extrabold uppercase text-[#022448] tracking-wide">
                            « {data.establishment_name || data.name} »
                          </strong>, sis à{' '}
                          <span className="italic font-medium">
                            {data.address || data.quartier || 'Pointe-Noire'}
                          </span>,{' '}
                          <span className="font-semibold">{data.arrondissement}</span>.
                        </p>

                        <p className="indent-8 leading-relaxed">
                          La présente attestation est délivrée à titre précaire et conservatoire pour permettre la continuité des activités professionnelles durant la phase d'instruction technique et d'assainissement acoustique, dans l'attente de la délivrance du titre d'agrément définitif par la Direction Générale des Loisirs à Brazzaville.
                        </p>

                        <p className="indent-8 font-semibold text-slate-800 pt-2">
                          En foi de quoi, la présente attestation lui est établie pour servir et valoir ce que de droit. /-
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 3. SOLEMN OFFICIAL SIGNATURE BLOCK */}
                  <div className="mt-8 pt-4 border-t border-slate-300 flex items-start justify-between text-xs">
                    {/* Left: Ampliations */}
                    <div className="text-left text-[9.5px] text-slate-600 font-serif space-y-0.5 max-w-[220px]">
                      <p className="font-bold text-slate-800 uppercase">Ampliations :</p>
                      <p>• Préfecture du Département de Pointe-Noire</p>
                      <p>• Mairie de Pointe-Noire</p>
                      <p>• Service Agrément et Assainissement (SAA)</p>
                      <p>• Archives DDL-PN / Chrono</p>
                      <p>• Intéressé(e)</p>
                    </div>

                    {/* Right: Signature du Directeur Départemental */}
                    <div className="text-center font-serif w-80">
                      <p className="text-[11px] text-slate-700 mb-0.5 font-semibold">
                        Fait à Pointe-Noire, le {data.record_date || data.date_emission || new Date().toLocaleDateString('fr-FR')}
                      </p>
                      <p className="font-extrabold text-slate-900 text-[11px] uppercase">
                        Le Directeur Départemental des Loisirs de Pointe-Noire,
                      </p>
                      <div className="h-14 flex items-center justify-center text-slate-400 text-xs italic font-serif my-1">
                        [Signature officielle et Grand Sceau de la République]
                      </div>
                      <p className="font-black text-[#022448] text-xs tracking-wide uppercase font-republic">
                        Jean Richard NTSEKE NGOUAKA
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer info (no-print) */}
        <div className="no-print p-2.5 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500 shrink-0">
          Astuce : Si le navigateur n'ouvre pas la boîte d'impression, cliquez sur <strong>Pleine page / PDF</strong> pour exporter ou imprimer directement via Ctrl+P.
        </div>
      </div>
    </div>
  );
};

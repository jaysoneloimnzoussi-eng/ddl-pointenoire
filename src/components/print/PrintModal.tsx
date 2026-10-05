import React, { useState } from 'react';
import { X, Printer, ExternalLink, Download, CheckCircle2, ShieldCheck, QrCode, FileText } from 'lucide-react';
import { OfficialRepublicLogo, RepublicTricolorBar, RepublicQrCode } from '../common/OfficialSeal';
import { OfficialVerifiableQrCode } from '../common/OfficialVerifiableQrCode';
import { REPUBLIQUE_CONGO } from '../../constants/referential';
import { OfficialReportDocumentView } from '../modules/OfficialReportDocumentView';
import { executeReliablePrint, openDocumentInNewTab } from '../../utils/printUtility';
import { formatDateFR, formatDateLongFR } from '../../utils/dateUtils';

export type PrintDocumentType =
  | 'ATTESTATION_A4'
  | 'SOIT_TRANSMIS_A4'
  | 'TICKET_58MM'
  | 'ACTE_JURIDIQUE_A4'
  | 'DIPLOME_HONNEUR_A4'
  | 'BORDEREAU_DGL_A4'
  | 'RAPPORT_TRIMESTRIEL_A4'
  | 'PV_COMMISSION_MIXTE_A4'
  | 'MACARON_OFFICIEL_VITRINE_A4'
  | 'RECU_TELEPAIEMENT_MOMO_A4'
  | 'BORDEREAU_RAPPROCHEMENT_A4'
  | 'PV_INFRACTION_ACOUSTIQUE_A4';

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

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="print-modal-overlay fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-2 sm:p-4 overflow-y-auto cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="print-modal-container bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[94vh] flex flex-col overflow-hidden border border-slate-300 cursor-default"
      >
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
              type="button"
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
              type="button"
              onClick={handleOpenStandalone}
              className="hidden sm:flex bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold items-center gap-1.5 border border-slate-600 transition cursor-pointer"
              title="Ouvrir dans un nouvel onglet pour aperçu grand écran ou enregistrement PDF"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Pleine page / PDF</span>
            </button>

            {/* Prominent Close Button */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition cursor-pointer hover:scale-105 active:scale-95"
              title="Fermer l'aperçu du document officiel"
            >
              <X className="w-4 h-4" />
              <span>Fermer l'aperçu</span>
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
                    Date: {formatDateFR(data.record_date || new Date())} • {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
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
                      <p className="text-[11px] text-slate-600 mt-1 italic">Fait à Pointe-Noire, le {formatDateFR(data.award_date || new Date())}</p>
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
                <OfficialReportDocumentView
                  report={data}
                  readOnly={true}
                  onClose={onClose}
                  onPrint={handlePrint}
                />
              </div>
            ) : (
              /* ===================================================================
                 PROTOTYPES MAJEURS A4 RÉPUBLICAINS (ACTES JURIDIQUES & ATTESTATIONS)
                 =================================================================== */
              <div className="print-page-a4 w-[210mm] max-w-full bg-white p-5 sm:p-6 text-slate-900 relative border border-slate-300 shadow-xl leading-tight print:p-4 print:border-none print:shadow-none print:m-0 print:max-h-[275mm] print:overflow-hidden">
                {/* 1. OFFICIAL CONGO ADMINISTRATIVE HEADER */}
                <div className="flex items-start justify-between pb-2 border-b-2 border-[#022448]">
                  {/* Left: Hierarchical Authority Stack */}
                  <div className="text-center w-56 text-xs font-serif leading-tight">
                    <p className="font-extrabold text-[11px] uppercase text-[#006d2f] font-republic tracking-wide">
                      RÉPUBLIQUE DU CONGO
                    </p>
                    <p className="text-[8.5px] italic font-semibold text-slate-600">
                      Unité • Travail • Progrès
                    </p>
                    <div className="w-10 h-0.5 bg-amber-500 mx-auto my-0.5" />
                    <p className="font-bold text-[8px] uppercase text-[#022448]">
                      MINISTÈRE DE LA CULTURE, DES ARTS ET DES LOISIRS
                    </p>
                    <div className="w-6 h-0.5 bg-slate-300 mx-auto my-0.5" />
                    <p className="font-semibold text-[7.5px] uppercase">DIRECTION GÉNÉRALE DES LOISIRS</p>
                    <p className="font-bold text-[8px] text-[#006d2f] uppercase mt-0.5">
                      DIRECTION DÉPARTEMENTALE DES LOISIRS DE POINTE-NOIRE
                    </p>
                    <p className="text-[7.5px] font-mono-ref text-slate-600 mt-0.5">
                      SERVICE ASSISTANCE ET AUTORISATION (SAA)
                    </p>
                  </div>

                  {/* Center: Coat of Arms / Republic Seal */}
                  <div className="flex flex-col items-center pt-0.5">
                    <OfficialRepublicLogo size="xs" showMotto={false} />
                    <RepublicTricolorBar className="w-16 mt-0.5 h-0.5" />
                  </div>

                  {/* Right: Date, Reference & Real Verifiable QR Code */}
                  <div className="text-right w-56 font-serif text-xs flex flex-col items-end">
                    <p className="italic text-slate-700 text-[10px]">
                      Pointe-Noire, le {formatDateFR(data.date_emission || data.record_date || new Date())}
                    </p>
                    <p className="font-mono-ref font-bold text-slate-900 mt-0.5 text-[10px]">
                      N° {data.reference_number || data.receipt_reference || 'REF-DDL-PN-2026/01'}
                    </p>
                    {data.type && (
                      <span className="inline-block my-0.5 px-2 py-0.2 bg-red-100 text-red-900 text-[8.5px] font-bold rounded border border-red-300 uppercase">
                        {data.type.replace(/_/g, ' ')}
                      </span>
                    )}
                    <div className="mt-0.5">
                      <OfficialVerifiableQrCode
                        data={{
                          ref: data.reference_number || data.receipt_reference || 'REF-DDL-PN-2026',
                          type: documentType,
                          establishment_name: data.establishment_name || data.name,
                          promoter_name: data.promoter_name,
                          date: data.date_emission || data.record_date,
                          arrondissement: data.arrondissement
                        }}
                        size={56}
                        showDetails={false}
                      />
                    </div>
                  </div>
                </div>

                {/* 2. BODY OF DOCUMENT BY INDIVIDUAL PROTOTYPE */}
                <div className="mt-2.5 font-serif">
                  {/* ==============================================================
                      ACTE JURIDIQUE: MISE EN DEMEURE SOUS HUITAINE (72H)
                     ============================================================== */}
                  {documentType === 'ACTE_JURIDIQUE_A4' && data.type === 'MISE_EN_DEMEURE' ? (
                    <div className="space-y-2">
                      <div className="text-center my-1.5">
                        <h2 className="text-base font-black uppercase tracking-wide text-red-800 font-republic underline decoration-red-600 underline-offset-4">
                          MISE EN DEMEURE FORMELLE SOUS HUITAINE (72 HEURES)
                        </h2>
                        <p className="text-[9.5px] uppercase font-bold text-slate-600 mt-0.5 tracking-wider">
                          Sous peine de fermeture administrative immédiate avec apposition des scellés
                        </p>
                      </div>

                      {/* Destinataire Notification Box */}
                      <div className="bg-slate-50 border border-slate-300 p-2 rounded-lg text-[10.5px] leading-tight space-y-0.5">
                        <div className="flex justify-between">
                          <span><strong>Destinataire :</strong> {data.promoter_name} (Promoteur / Exploitant)</span>
                          <span className="font-mono-ref font-bold text-slate-600">Réf : {data.reference_number}</span>
                        </div>
                        <p><strong>Établissement :</strong> <span className="font-extrabold uppercase text-[#022448]">« {data.establishment_name} »</span></p>
                        <p><strong>Arrondissement :</strong> {data.arrondissement} • <strong>Adresse :</strong> {data.address || 'Pointe-Noire'}</p>
                        {data.agent_notificateur && (
                          <p className="text-[9.5px] text-slate-500 pt-0.5 border-t border-slate-200">
                            Agent notificateur assermenté : <strong>{data.agent_notificateur}</strong>
                          </p>
                        )}
                      </div>

                      {/* Visas Légaux Solennels */}
                      <div className="text-[9px] space-y-0.5 text-slate-600 border-l-2 border-red-700 pl-2 italic">
                        <p className="font-bold text-slate-800 not-italic uppercase text-[8.5px]">Visas légaux :</p>
                        <p>Vu la Loi N° 21-2019 du 12 juillet 2019 fixant le régime général des loisirs en République du Congo ;</p>
                        <p>Vu le Décret N° 2021-412 du 28 octobre 2021 portant organisation de la Direction Générale des Loisirs ;</p>
                        <p>Vu les rapports de constatation dressés par les agents du Service Assistance et Autorisation (SAA).</p>
                      </div>

                      {/* Constatations & Motif */}
                      <div className="text-[10.5px] text-justify leading-snug space-y-1.5">
                        <p>
                          Il a été formellement constaté par les agents assermentés du Service Assistance et Autorisation (SAA) que l'établissement susvisé se trouve en infraction :
                        </p>
                        <div className="bg-red-50 border-l-4 border-red-600 p-2 font-semibold text-red-950 text-[10.5px] leading-snug">
                          « {data.motif} »
                        </div>
                        <p>
                          En conséquence de quoi, <strong>IL VOUS EST IMPARTI UN DÉLAI DE {data.delai_huitaine_date ? (data.delai_huitaine_date.includes('-') ? formatDateFR(data.delai_huitaine_date) : data.delai_huitaine_date) : '72 HEURES OUVRÉES'}</strong>, à compter de la présente notification, pour vous présenter à la Direction Départementale des Loisirs munis des pièces justificatives et régulariser votre situation.
                        </p>
                        <p className="font-bold text-slate-900 text-[10px]">
                          PASSÉ CE DÉLAI DE RIGUEUR, il sera procédé à la FERMETURE ADMINISTRATIVE immédiate de votre local avec apposition des scellés de la République par le Service Assistance et Autorisation (SAA) assisté de la Force Publique.
                        </p>
                      </div>
                    </div>
                  ) : documentType === 'ACTE_JURIDIQUE_A4' && data.type === 'CONVOCATION' ? (
                    /* ==============================================================
                        ACTE JURIDIQUE: CONVOCATION OFFICIELLE CONTRADICTOIRE
                       ============================================================== */
                    <div className="space-y-2">
                      <div className="text-center my-1.5">
                        <h2 className="text-base font-black uppercase tracking-wide text-purple-900 font-republic underline decoration-purple-600 underline-offset-4">
                          CONVOCATION ADMINISTRATIVE OFFICIELLE
                        </h2>
                        <p className="text-[9.5px] uppercase font-bold text-slate-600 mt-0.5 tracking-wider">
                          À comparution obligatoire sous visa de la Loi N° 21-2019
                        </p>
                      </div>

                      {/* Destinataire */}
                      <div className="bg-slate-50 border border-slate-300 p-2 rounded-lg text-[10.5px] leading-tight space-y-0.5">
                        <p><strong>Destinataire :</strong> Madame / Monsieur {data.promoter_name} (Promoteur / Exploitant)</p>
                        <p><strong>Établissement :</strong> <span className="font-extrabold uppercase text-[#022448]">« {data.establishment_name} »</span></p>
                        <p><strong>Arrondissement :</strong> {data.arrondissement} • <strong>Adresse :</strong> {data.address || 'Pointe-Noire'}</p>
                      </div>

                      <div className="text-[10.5px] text-justify leading-snug space-y-1.5">
                        <p>
                          Dans le cadre de l’instruction de votre dossier et de la régulation des loisirs à Pointe-Noire, <strong>vous êtes formellement convoqué(e) à comparution obligatoire</strong> :
                        </p>

                        {/* Rendez-vous Card */}
                        <div className="bg-purple-50 border border-purple-300 p-2 rounded-lg text-center space-y-0.5">
                          <p className="text-[9.5px] font-bold text-purple-950 uppercase">Date & Heure de Comparution :</p>
                          <p className="text-[11px] font-extrabold font-mono-ref text-purple-900">
                            📅 {data.delai_huitaine_date ? (data.delai_huitaine_date.includes('-') ? formatDateFR(data.delai_huitaine_date) : data.delai_huitaine_date) : 'Le jour ouvrable convenu'} à 10 Heures Précises
                          </p>
                          <p className="text-[10px] text-purple-950">
                            <strong>Lieu :</strong> DDL-PN — <strong>Bureau N° 3 (Service Assistance et Autorisation - SAA)</strong>, Centre-Ville, face Port Autonome.
                          </p>
                        </div>

                        {/* Mandatory Documents Checklist */}
                        <div>
                          <p className="font-bold text-slate-800 text-[10px] mb-0.5">
                            Pièces obligatoires à fournir lors de l'audition :
                          </p>
                          <ol className="list-decimal list-inside space-y-0.5 text-[9.5px] text-slate-700 bg-white p-1.5 rounded border border-slate-200">
                            <li>Pièce d’Identité (CNI ou Passeport en cours de validité) ;</li>
                            <li>Extrait RCCM ou déclaration légale d'activité ;</li>
                            <li>Bail commercial ou titre d'occupation du local ;</li>
                            <li>Dernières quittances de redevances délivrées par la Régie SAF / SAA ;</li>
                            <li>Certificat d'installation du limiteur sonore agréé (seuil maximal 85 dB).</li>
                          </ol>
                        </div>

                        <p className="text-[9.5px] italic text-slate-600">
                          En cas d’empêchement, mandatez un représentant muni d’une procuration écrite. Tout défaut entraînera l’application des mesures conservatoires prévues par la loi.
                        </p>
                      </div>
                    </div>
                  ) : documentType === 'ACTE_JURIDIQUE_A4' && data.type === 'ARRETE_FERMETURE' ? (
                    /* ==============================================================
                        ACTE JURIDIQUE: ARRÊTÉ DE FERMETURE ADMINISTRATIVE
                       ============================================================== */
                    <div className="space-y-2">
                      <div className="text-center my-1.5">
                        <span className="text-[10px] font-mono-ref font-bold text-red-700 uppercase tracking-widest block">
                          DÉCISION EXÉCUTOIRE IMMÉDIATE
                        </span>
                        <h2 className="text-base font-black uppercase tracking-wide text-red-900 font-republic mt-0.5">
                          ARRÊTÉ PORTANT FERMETURE ADMINISTRATIVE IMMÉDIATE
                        </h2>
                        <p className="text-[9.5px] uppercase font-bold text-slate-700">
                          Et Apposition des Scellés de la République
                        </p>
                      </div>

                      {/* Visas & Considérants */}
                      <div className="text-[9.5px] leading-snug space-y-0.5 text-slate-700 italic border-l-2 border-red-700 pl-2">
                        <p>Vu la Loi N° 21-2019 du 12 juillet 2019 fixant le régime général des loisirs ;</p>
                        <p>Vu le Décret N° 2021-412 du 28 octobre 2021 organisant les services de la DGL ;</p>
                        <p>Considérant la mise en demeure formelle restée sans suite dans le délai imparti ;</p>
                        <p>Considérant les nuisances répétées, l'exercice sans titre officiel et le trouble avéré à l'ordre public ;</p>
                      </div>

                      {/* Articles */}
                      <div className="text-[10px] space-y-1.5 text-justify leading-snug">
                        <p className="font-extrabold uppercase text-[#022448] text-center text-xs py-0.5 border-t border-b border-slate-300">
                          LE DIRECTEUR DÉPARTEMENTAL DES LOISIRS ARRÊTE :
                        </p>

                        <p>
                          <strong>ARTICLE 1er :</strong> Est ordonnée la fermeture administrative immédiate de l’établissement de loisirs dénommé <strong className="text-red-900 uppercase">« {data.establishment_name} »</strong>, exploité par {data.promoter_name}, sis à {data.arrondissement} ({data.address || 'Pointe-Noire'}).
                        </p>

                        <p>
                          <strong>ARTICLE 2 :</strong> Il est fait interdiction absolue d'exploiter lesdits locaux ou de recevoir du public. Les agents assermentés du Service Assistance et Autorisation (SAA) procèdent sans délai à l’apposition des scellés officiels de la République.
                        </p>

                        <p>
                          <strong>ARTICLE 3 :</strong> Tout bris ou violation des scellés apposés expose les contrevenants aux poursuites judiciaires et sanctions pénales prévues par les lois de la République.
                        </p>

                        <p>
                          <strong>ARTICLE 4 :</strong> Les forces de sécurité publique sont requises pour prêter main-forte à l'exécution du présent arrêté.
                        </p>
                      </div>
                    </div>
                  ) : documentType === 'ACTE_JURIDIQUE_A4' && data.type === 'PV_CONSTAT' ? (
                    /* ==============================================================
                        ACTE JURIDIQUE: PROCÈS-VERBAL DE CONSTAT D'INFRACTION
                       ============================================================== */
                    <div className="space-y-2">
                      <div className="text-center my-1.5">
                        <span className="text-[10px] font-mono-ref font-bold text-amber-700 uppercase tracking-widest block">
                          POLICE ADMINISTRATIVE DES LOISIRS
                        </span>
                        <h2 className="text-base font-black uppercase tracking-wide text-amber-900 font-republic mt-0.5 underline decoration-amber-600 underline-offset-4">
                          PROCÈS-VERBAL DE CONSTATATION D'INFRACTION & NON-CONFORMITÉ
                        </h2>
                        <p className="text-[9.5px] uppercase font-bold text-slate-700">
                          Relevé contradictoire d'infraction aux normes républicaines
                        </p>
                      </div>

                      {/* Box Identification */}
                      <div className="bg-slate-50 border border-slate-300 p-2 rounded-lg text-[10.5px] leading-tight space-y-0.5">
                        <div className="flex justify-between">
                          <span><strong>Établissement :</strong> <span className="font-extrabold uppercase text-[#022448]">« {data.establishment_name} »</span></span>
                          <span className="font-mono-ref font-bold text-slate-600">Réf : {data.reference_number}</span>
                        </div>
                        <p><strong>Promoteur / Gérant :</strong> {data.promoter_name}</p>
                        <p><strong>Localisation :</strong> {data.arrondissement} • {data.address || 'Pointe-Noire'}</p>
                        {data.agent_notificateur && (
                          <p className="text-[9.5px] text-slate-500 pt-0.5 border-t border-slate-200">
                            Agents verbalisateurs assermentés : <strong>{data.agent_notificateur}</strong>
                          </p>
                        )}
                      </div>

                      {/* Visas */}
                      <div className="text-[9px] space-y-0.5 text-slate-600 border-l-2 border-amber-600 pl-2 italic">
                        <p>Vu la Loi N° 21-2019 du 12 juillet 2019 fixant le régime général des loisirs en République du Congo ;</p>
                        <p>Vu l'Arrêté Départemental N° 018/DDL-PN-2026 relatif aux normes acoustiques nocturnes.</p>
                      </div>

                      {/* Constatations */}
                      <div className="text-[10.5px] text-justify leading-snug space-y-1.5">
                        <p>
                          Les agents soussignés du Service Assistance et Autorisation (SAA) certifient s'être transportés sur les lieux et avoir formellement constaté les infractions suivantes :
                        </p>
                        <div className="bg-amber-50 border-l-4 border-amber-600 p-2 font-semibold text-amber-950 text-[10.5px] leading-snug">
                          « {data.motif} »
                        </div>
                        <p>
                          <strong>MESURES CONSERVATOIRES :</strong> Notification immédiate d'injonction de cessation du trouble, sommation de mise en conformité sous délai légal de {data.delai_huitaine_date || '72 heures'}, sans préjudice des poursuites administratives et judiciaires applicables.
                        </p>
                      </div>
                    </div>
                  ) : documentType === 'ACTE_JURIDIQUE_A4' ? (
                    /* ==============================================================
                        ACTE JURIDIQUE: ORDRE DE MISSION SAA / CONTRÔLE
                       ============================================================== */
                    <div className="space-y-2">
                      <div className="text-center my-1.5">
                        <h2 className="text-base font-black uppercase tracking-wide text-[#022448] font-republic underline decoration-blue-600 underline-offset-4">
                          ORDRE DE MISSION DE CONTRÔLE RÉPUBLICAIN IN SITU
                        </h2>
                        <p className="text-[9.5px] uppercase font-bold text-slate-600 mt-0.5 tracking-wider">
                          Service Assistance et Autorisation (SAA)
                        </p>
                      </div>

                      <div className="bg-slate-50 border border-slate-300 p-2 rounded-lg text-[10.5px] leading-tight space-y-1">
                        <p><strong>Agents Mandatés :</strong> <span className="font-bold text-[#006d2f]">{data.agent_notificateur || 'Agents Assermentés du Service SAA'}</span></p>
                        <p><strong>Objet de la Mission :</strong> Contrôle de conformité d'exploitation, vérification des quittances et contrôle sonométrique.</p>
                        <p><strong>Établissement Visé :</strong> <span className="font-bold uppercase text-[#022448]">« {data.establishment_name} »</span> ({data.promoter_name})</p>
                        <p><strong>Secteur d'Intervention :</strong> {data.arrondissement} • {data.address || 'Pointe-Noire'}</p>
                      </div>

                      <div className="text-[10px] leading-snug text-justify space-y-1.5">
                        <p>
                          Le Directeur Départemental des Loisirs ordonne aux agents assermentés désignés de procéder aux opérations légales d'inspection, d'évaluation sonométrique et de vérification des quittances d'encaissement.
                        </p>
                        <p>
                          Les autorités administratives, civiles et militaires sont priées de faciliter l'accomplissement de la présente mission républicaine.
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
                          La présente attestation est délivrée à titre transitoire pour permettre la continuité des activités durant la phase d'instruction technique et de mise en conformité du dossier.
                        </p>

                        <p className="indent-8 font-semibold text-slate-800 pt-2">
                          En foi de quoi, la présente attestation lui est établie pour servir et valoir ce que de droit. /-
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 3. SOLEMN OFFICIAL SIGNATURE BLOCK */}
                  <div className="mt-3.5 pt-2 border-t border-slate-300 flex items-start justify-between text-xs">
                    {/* Left: Ampliations */}
                    <div className="text-left text-[8.5px] text-slate-600 font-serif space-y-0.5 max-w-[220px]">
                      <p className="font-bold text-slate-800 uppercase">Ampliations :</p>
                      <p>• Service Administratif et Financier (SAF)</p>
                      <p>• Service Assistance et Autorisation (SAA)</p>
                      <p>• Service Promotion et Animation (SPA)</p>
                      <p>• Archives DDL-PN / Chrono</p>
                      <p>• Intéressé(e)</p>
                    </div>

                    {/* Right: Signature du Directeur Départemental */}
                    <div className="text-center font-serif w-72">
                      <p className="text-[10px] text-slate-700 mb-0.5 font-semibold">
                        Fait à Pointe-Noire, le {formatDateFR(data.record_date || data.date_emission || new Date())}
                      </p>
                      {documentType !== 'ATTESTATION_A4' && (
                        <p className="font-extrabold text-slate-900 text-[10.5px] uppercase">
                          Le Directeur Départemental des Loisirs,
                        </p>
                      )}
                      <div className="h-9 flex items-center justify-center text-slate-400 text-[10px] italic font-serif my-0.5">
                        [Signature officielle et Sceau de la République]
                      </div>
                      <p className="font-black text-[#022448] text-[11px] tracking-wide uppercase font-republic">
                        Jean Richard NTSEKE NGOUAKA
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ==============================================================
                DOCUMENT: PROCÈS-VERBAL DE CONTRÔLE CONJOINT - COMMISSION MIXTE (A4)
               ============================================================== */}
            {documentType === 'PV_COMMISSION_MIXTE_A4' && (
              <div className="print-page-a4 relative flex flex-col justify-between p-6 bg-white border border-slate-300 shadow-md min-h-[297mm]">
                {/* 1. Official Republic Header */}
                <div>
                  <div className="flex justify-between items-start border-b-2 border-[#022448] pb-3">
                    <div className="text-left font-serif text-[9px] text-slate-800 leading-tight space-y-0.5 max-w-[260px]">
                      <p className="font-extrabold uppercase text-[#022448] text-[10px]">RÉPUBLIQUE DU CONGO</p>
                      <p className="italic text-[8px] text-slate-600">Unité - Travail - Progrès</p>
                      <p className="pt-0.5 font-bold uppercase text-[8.5px]">MCAPNIT / DDL-PN</p>
                      <p className="text-[8px] font-semibold text-slate-700">COMMISSION MIXTE DE CONTRÔLE ET DE CONFORMITÉ DES ÉTABLISSEMENTS DE LOISIRS</p>
                    </div>

                    <div className="flex flex-col items-center">
                      <OfficialRepublicLogo size="md" showMotto={false} />
                      <span className="text-[8px] font-black uppercase text-[#006d2f] mt-1 font-mono-ref">COMMISSION MIXTE</span>
                    </div>

                    <div className="text-right font-mono-ref text-[9px] text-slate-700 space-y-0.5">
                      <p className="font-bold text-[#022448] text-[10px]">RÉF : {data.pv_number || 'PV-MIXTE-2026-0001'}</p>
                      <p>Date : {formatDateFR(data.inspection_date || new Date())}</p>
                      <p className="text-[8px] text-slate-500">Ville de Pointe-Noire</p>
                      <div className="mt-1 flex justify-end">
                        <RepublicQrCode
                          payload={{
                            type: 'PV_COMMISSION_MIXTE',
                            pv_number: data.pv_number,
                            establishment_name: data.establishment_name,
                            date: data.inspection_date
                          }}
                          size={46}
                          showDetails={false}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Document Title */}
                  <div className="text-center my-3">
                    <h2 className="text-base font-black uppercase tracking-wide text-[#022448] font-republic underline decoration-amber-500 underline-offset-4">
                      PROCÈS-VERBAL DE CONTRÔLE CONJOINT
                    </h2>
                    <p className="text-[9.5px] uppercase font-bold text-slate-600 mt-0.5 tracking-wider">
                      DDL-PN • POLICE NATIONALE • SÉCURITÉ CIVILE (SAPEURS-POMPIERS) • HYGIÈNE PUBLIQUE VILLE DE POINTE-NOIRE
                    </p>
                  </div>

                  {/* Identification Box */}
                  <div className="bg-slate-50 border border-slate-300 p-2.5 rounded-lg text-[10px] space-y-1 mb-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p><strong>Établissement :</strong> <span className="font-black uppercase text-[#022448]">« {data.establishment_name} »</span></p>
                        <p><strong>Promoteur / Gérant :</strong> {data.promoter_name}</p>
                      </div>
                      <div>
                        <p><strong>Arrondissement :</strong> {data.arrondissement}</p>
                        <p><strong>Quartier / Adresse :</strong> {data.quartier} • {data.address || 'Pointe-Noire'}</p>
                      </div>
                    </div>
                  </div>

                  {/* 4 Inspection Axes Grid */}
                  <div className="space-y-2 text-[9.5px]">
                    {/* Axis 1: Acoustic & Sonometer */}
                    <div className="border border-slate-300 rounded p-2 bg-white">
                      <div className="flex justify-between items-center border-b border-slate-200 pb-1 mb-1">
                        <span className="font-bold text-[#022448] uppercase">1. Contrôle Acoustique & Nuisances Sonores (DDL-PN / SAA)</span>
                        <span className={`px-2 py-0.5 rounded text-[8.5px] font-bold ${data.noise_compliant ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                          {data.noise_compliant ? 'CONFORME' : 'NON CONFORME'}
                        </span>
                      </div>
                      <p>• Niveau sonore mesuré in situ : <strong>{data.noise_level_db || 75} dB</strong> (Plafond réglementaire : 85 dB intérieur, 55 dB jour / 45 dB nuit en limite riveraine).</p>
                      <p className="italic text-slate-600">• Observation : {data.noise_notes || 'Limiteur acoustique vérifié et opérationnel.'}</p>
                    </div>

                    {/* Axis 2: Fire Safety & Evacuation */}
                    <div className="border border-slate-300 rounded p-2 bg-white">
                      <div className="flex justify-between items-center border-b border-slate-200 pb-1 mb-1">
                        <span className="font-bold text-[#022448] uppercase">2. Sécurité Incendie & Évacuation (Direction Sécurité Civile)</span>
                        <span className={`px-2 py-0.5 rounded text-[8.5px] font-bold ${data.fire_safety_compliant ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                          {data.fire_safety_compliant ? 'CONFORME' : 'RÉSERVES'}
                        </span>
                      </div>
                      <p>• Nombre d'extincteurs vérifiés : <strong>{data.extinguishers_count || 2}</strong> ({data.extinguishers_valid ? 'En cours de validité' : 'Charge expirée'}).</p>
                      <p>• Dégagement des issues de secours : <strong>{data.emergency_exits_clear ? 'Dégagées et praticables' : 'Encombrées / Inaccessibles'}</strong>.</p>
                      <p>• Affichage du plan d'évacuation : <strong>{data.evacuation_plan_displayed ? 'Affiché aux normes' : 'Absent'}</strong>.</p>
                    </div>

                    {/* Axis 3: Hygiene & Public Health */}
                    <div className="border border-slate-300 rounded p-2 bg-white">
                      <div className="flex justify-between items-center border-b border-slate-200 pb-1 mb-1">
                        <span className="font-bold text-[#022448] uppercase">3. Hygiène & Salubrité Publique (Service d'Hygiène Mairie de Pointe-Noire)</span>
                        <span className={`px-2 py-0.5 rounded text-[8.5px] font-bold ${data.hygiene_compliant ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                          {data.hygiene_compliant ? 'CONFORME' : 'NON CONFORME'}
                        </span>
                      </div>
                      <p>• Commodités sanitaires & eau courante : <strong>{data.sanitary_facilities_ok ? 'Conformes et entretenues' : 'Défectueuses'}</strong>.</p>
                      <p>• Ventilation mécanique / aération naturelle : <strong>{data.ventilation_ok ? 'Adéquate' : 'Insuffisante'}</strong>.</p>
                    </div>

                    {/* Axis 4: Public Order & Regulation */}
                    <div className="border border-slate-300 rounded p-2 bg-white">
                      <div className="flex justify-between items-center border-b border-slate-200 pb-1 mb-1">
                        <span className="font-bold text-[#022448] uppercase">4. Ordre Public & Réglementation Administrative (Police / SAA)</span>
                        <span className={`px-2 py-0.5 rounded text-[8.5px] font-bold ${data.administrative_compliant ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                          {data.administrative_compliant ? 'EN RÈGLE' : 'EN COURS'}
                        </span>
                      </div>
                      <p>• Régularisation de la redevance d'ouverture DDL-PN : <strong>{data.administrative_compliant ? 'Quittance Trésor acquittée' : 'Solde restant dû'}</strong>.</p>
                      <p>• Respect des horaires de fermeture et filtrage des mineurs : <strong>{data.police_order_compliant ? 'Respecté' : 'Infractions signalées'}</strong>.</p>
                    </div>
                  </div>

                  {/* Commission Verdict */}
                  <div className="mt-3 p-2.5 rounded-lg border-2 border-[#022448] bg-slate-50 text-[10px]">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-[#022448] uppercase text-xs">VERDICT GLOBAL DE LA COMMISSION MIXTE :</span>
                      <span className={`px-3 py-1 rounded font-black text-xs ${
                        data.global_verdict === 'FAVORABLE' ? 'bg-emerald-600 text-white' : (data.global_verdict === 'FAVORABLE_AVEC_RESERVES' ? 'bg-amber-500 text-slate-950' : 'bg-red-600 text-white')
                      }`}>
                        AVIS {data.global_verdict?.replace(/_/g, ' ') || 'FAVORABLE'}
                      </span>
                    </div>
                    {data.prescriptions && data.prescriptions.length > 0 && (
                      <div className="mt-1.5 pt-1.5 border-t border-slate-200">
                        <p className="font-bold text-slate-800">Prescriptions et délais de mise en conformité :</p>
                        <ul className="list-disc pl-4 space-y-0.5 mt-0.5 text-slate-700 italic text-[9px]">
                          {data.prescriptions.map((p: string, idx: number) => (
                            <li key={idx}>{p}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Signatures of the 4 Inspectors + Promoter */}
                <div className="border-t-2 border-[#022448] pt-2 mt-3">
                  <p className="text-[9px] text-center font-bold uppercase text-slate-600 mb-2">
                    Émargements contradictoires des membres de la Commission Mixte
                  </p>
                  <div className="grid grid-cols-4 gap-2 text-[8px] text-center font-serif">
                    <div className="border border-slate-200 p-1.5 rounded">
                      <p className="font-bold text-[#022448]">Pour la DDL-PN</p>
                      <p className="text-slate-500">{data.inspectors?.ddl_officer || 'Jacques MATOKO'}</p>
                      <div className="h-8 flex items-center justify-center text-[7px] text-slate-400 italic">[Signature]</div>
                    </div>
                    <div className="border border-slate-200 p-1.5 rounded">
                      <p className="font-bold text-[#022448]">Sécurité Civile</p>
                      <p className="text-slate-500">{data.inspectors?.fire_safety_officer || 'Capitaine BOUANGA'}</p>
                      <div className="h-8 flex items-center justify-center text-[7px] text-slate-400 italic">[Signature]</div>
                    </div>
                    <div className="border border-slate-200 p-1.5 rounded">
                      <p className="font-bold text-[#022448]">Hygiène Mairie</p>
                      <p className="text-slate-500">{data.inspectors?.hygiene_officer || 'Inspecteur MOUNTOU'}</p>
                      <div className="h-8 flex items-center justify-center text-[7px] text-slate-400 italic">[Signature]</div>
                    </div>
                    <div className="border border-slate-200 p-1.5 rounded">
                      <p className="font-bold text-[#022448]">Police Nationale</p>
                      <p className="text-slate-500">{data.inspectors?.police_officer || 'Officier NGOMA'}</p>
                      <div className="h-8 flex items-center justify-center text-[7px] text-slate-400 italic">[Signature]</div>
                    </div>
                  </div>
                  <div className="mt-2 text-right text-[8.5px] text-slate-600 font-mono-ref">
                    Fait à Pointe-Noire, en cinq (5) exemplaires originaux, le {formatDateFR(data.inspection_date || new Date())}
                  </div>
                </div>
              </div>
            )}

            {/* ==============================================================
                DOCUMENT: MACARON OFFICIEL DE CONFORMITÉ & HOMOLOGATION (VITRINE A4)
               ============================================================== */}
            {documentType === 'MACARON_OFFICIEL_VITRINE_A4' && (
              <div className="print-page-a4 relative flex flex-col justify-between p-6 bg-white border-8 border-double border-[#006d2f] shadow-2xl min-h-[297mm] text-center">
                {/* Top Tricolor Republic Bar */}
                <RepublicTricolorBar className="h-3 rounded-full mb-3" />

                <div>
                  {/* Official State Seal Header */}
                  <div className="flex flex-col items-center space-y-1">
                    <OfficialRepublicLogo size="lg" showMotto={true} />
                    <p className="font-bold text-xs uppercase tracking-widest text-[#006d2f] font-republic mt-1">
                      {REPUBLIQUE_CONGO.ministere}
                    </p>
                    <h3 className="font-black text-sm uppercase text-[#022448] font-republic tracking-tight">
                      DIRECTION DÉPARTEMENTALE DES LOISIRS DE POINTE-NOIRE
                    </h3>
                    <div className="inline-block bg-amber-400 text-slate-950 font-black px-4 py-1 rounded-full text-xs font-mono-ref tracking-widest shadow-xs">
                      EXERCICE BUDGÉTAIRE {REPUBLIQUE_CONGO.annee_pta}
                    </div>
                  </div>

                  {/* Main Homologation Certificate Banner */}
                  <div className="my-5 py-3 px-4 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 border-y-2 border-[#006d2f]">
                    <h1 className="text-2xl font-black text-[#006d2f] uppercase tracking-wide font-republic">
                      MACARON OFFICIEL DE CONFORMITÉ
                    </h1>
                    <p className="text-xs uppercase font-extrabold text-slate-700 tracking-wider mt-1">
                      Établissement Récréatif & de Loisirs Homologué par l'État
                    </p>
                  </div>

                  {/* Establishment Big Highlight Box */}
                  <div className="my-4 p-5 bg-slate-50 border-2 border-slate-300 rounded-2xl max-w-xl mx-auto space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block font-mono-ref">
                      Dénomination Commerciale Homologuée
                    </span>
                    <h2 className="text-2xl font-black text-[#022448] uppercase tracking-tight font-republic">
                      « {data.name || data.establishment_name} »
                    </h2>
                    <p className="text-sm font-semibold text-slate-700">
                      Exploitant : <strong className="text-slate-900">{data.promoter_name}</strong>
                    </p>
                    <div className="flex justify-center gap-3 text-xs text-slate-600 font-medium pt-2 border-t border-slate-200">
                      <span>Activité : <strong>{data.activity_type || 'Complexe Récréatif'}</strong></span>
                      <span>•</span>
                      <span>Arrondissement : <strong>{data.arrondissement}</strong> ({data.quartier})</span>
                    </div>
                  </div>

                  {/* Centered Big Verification QR Code */}
                  <div className="my-4 flex flex-col items-center">
                    <div className="p-3 bg-white border-2 border-[#006d2f] rounded-2xl shadow-lg inline-block">
                      <RepublicQrCode
                        payload={{
                          type: 'MACARON_OFFICIEL',
                          id: data.id,
                          name: data.name || data.establishment_name,
                          promoter: data.promoter_name,
                          arrondissement: data.arrondissement,
                          annee: '2026',
                          validity: 'VALIDE'
                        }}
                        size={110}
                        showDetails={false}
                      />
                    </div>
                    <span className="text-[10px] font-mono-ref font-bold text-[#006d2f] mt-1.5 block">
                      SCANNER POUR VÉRIFIER L'AUTHENTICITÉ SUR LE REGISTRE DDL-PN
                    </span>
                  </div>

                  {/* Official Homologation Number */}
                  <div className="font-mono-ref text-xs text-slate-700 space-y-1">
                    <p>N° d'Homologation Réglementaire : <strong className="text-[#022448] text-sm">MACARON-DDL-PN-2026-{(data.id || '2026').slice(-6).toUpperCase()}</strong></p>
                    <p className="text-[10.5px] text-slate-500">Quittance d'ouverture acquittée au Trésor Public • Dossier technique conforme SAA</p>
                  </div>
                </div>

                {/* Director Signature & Legal Mention */}
                <div className="mt-4 pt-3 border-t-2 border-slate-300">
                  <div className="flex justify-between items-end px-6">
                    <div className="text-left text-[9px] text-slate-500 max-w-[260px] italic">
                      <p className="font-bold not-italic text-slate-800 uppercase">Obligation Légale d'Affichage :</p>
                      <p>Le présent macaron officiel doit être impérativement apposé de manière visible à l'entrée principale de l'établissement sous peine des sanctions prévues par la Loi.</p>
                    </div>

                    <div className="text-center font-serif w-64">
                      <p className="text-[10px] text-slate-700 mb-0.5">
                        Fait à Pointe-Noire, le {formatDateFR(new Date())}
                      </p>
                      <p className="font-extrabold text-slate-900 text-[10px] uppercase">
                        Le Directeur Départemental des Loisirs,
                      </p>
                      <div className="h-9 flex items-center justify-center text-slate-400 text-[9px] italic font-serif my-0.5">
                        [Cachet Officiel & Signature Certifiée]
                      </div>
                      <p className="font-black text-[#022448] text-[11px] tracking-wide uppercase font-republic">
                        Jean Richard NTSEKE NGOUAKA
                      </p>
                    </div>
                  </div>

                  <RepublicTricolorBar className="h-2 rounded-full mt-3" />
                </div>
              </div>
            )}

            {/* ==============================================================
                DOCUMENT: REÇU DE TÉLÉPAIEMENT MOBILE MONEY D'ÉTAT (A4)
               ============================================================== */}
            {documentType === 'RECU_TELEPAIEMENT_MOMO_A4' && (
              <div className="print-page-a4 relative flex flex-col justify-between p-6 bg-white border border-slate-300 shadow-md min-h-[297mm]">
                <div>
                  {/* Header */}
                  <div className="flex justify-between items-start border-b-2 border-[#022448] pb-3">
                    <div className="text-left font-serif text-[9.5px] text-slate-800 leading-tight space-y-0.5 max-w-[280px]">
                      <p className="font-extrabold uppercase text-[#022448] text-[10.5px]">RÉPUBLIQUE DU CONGO</p>
                      <p className="italic text-[8px] text-slate-600">Unité - Travail - Progrès</p>
                      <p className="pt-0.5 font-bold uppercase text-[9px]">MINISTÈRE DES FINANCES / TRÉSOR PUBLIC</p>
                      <p className="font-semibold text-slate-700 text-[8.5px]">DIRECTION DÉPARTEMENTALE DES LOISIRS DE POINTE-NOIRE (SAF / RÉGIE)</p>
                      <p className="text-[8px] text-[#006d2f] font-bold">PASSERELLE DE TÉLÉCOLLECTE MOBILE MONEY SÉCURISÉE</p>
                    </div>

                    <div className="flex flex-col items-center">
                      <OfficialRepublicLogo size="md" showMotto={false} />
                    </div>

                    <div className="text-right font-mono-ref text-[9.5px] text-slate-700 space-y-0.5">
                      <p className="font-bold text-[#022448] text-xs">{data.receipt_number || 'QUI-MOMO-2026-0001'}</p>
                      <p>Date : {formatDateFR(data.created_at || new Date())}</p>
                      <p className="text-[8.5px] text-slate-500">Heure : {new Date(data.created_at || Date.now()).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                      <div className="mt-1 flex justify-end">
                        <RepublicQrCode
                          payload={{
                            type: 'RECU_MOMO',
                            receipt: data.receipt_number,
                            amount: data.amount_fcfa,
                            operator: data.operator,
                            etab: data.establishment_name
                          }}
                          size={46}
                          showDetails={false}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="text-center my-4">
                    <h2 className="text-base font-black uppercase tracking-wide text-[#006d2f] font-republic underline decoration-[#022448] underline-offset-4">
                      ATTESTATION OFFICIELLE DE TÉLÉPAIEMENT MOBILE MONEY
                    </h2>
                    <p className="text-[9.5px] uppercase font-bold text-slate-600 mt-0.5 tracking-wider font-mono-ref">
                      TRANSACTION VALIDÉE VIA {data.operator?.toUpperCase() || 'MOBILE MONEY'}
                    </p>
                  </div>

                  {/* Transaction Details Box */}
                  <div className="bg-slate-50 border border-slate-300 rounded-xl p-4 text-xs space-y-2 mb-4 font-mono-ref">
                    <div className="flex justify-between border-b border-slate-200 pb-1.5">
                      <span className="text-slate-600">RÉFÉRENCE TRANSACTION TÉLÉCOM :</span>
                      <strong className="text-[#022448] text-sm">{data.transaction_ref || 'TXN-MOMO-CG-2026-0001'}</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1.5">
                      <span className="text-slate-600">OPÉRATEUR MOBILE MONEY :</span>
                      <strong className="text-slate-900">{data.operator}</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1.5">
                      <span className="text-slate-600">NUMÉRO TÉLÉPHONE DÉBITÉ :</span>
                      <strong className="text-slate-900">{data.phone_number}</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1.5">
                      <span className="text-slate-600">ÉTABLISSEMENT BÉNÉFICIAIRE :</span>
                      <strong className="text-[#022448] uppercase">{data.establishment_name}</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1.5">
                      <span className="text-slate-600">PROMOTEUR / EXPLOITANT :</span>
                      <strong className="text-slate-900">{data.promoter_name}</strong>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="font-bold text-slate-800 text-sm">MONTANT TOTAL PAYÉ :</span>
                      <span className="text-lg font-black text-[#006d2f] bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                        {Number(data.amount_fcfa || 0).toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                  </div>

                  {/* 70/30 Legal Breakdown */}
                  <div className="border border-slate-300 rounded-xl p-3 bg-white text-xs mb-4">
                    <p className="font-bold text-[#022448] uppercase text-[10.5px] border-b border-slate-200 pb-1 mb-2 font-mono-ref">
                      Ventilation Budgétaire Légale des Droits Perçus
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-center font-mono-ref">
                      <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
                        <span className="text-[10px] text-blue-900 font-bold block uppercase">Part Trésor Public (70%)</span>
                        <span className="text-base font-black text-[#022448]">
                          {Number(data.treasury_share_70 || Math.round(Number(data.amount_fcfa || 0) * 0.7)).toLocaleString('fr-FR')} FCFA
                        </span>
                        <span className="text-[9px] text-slate-500 block mt-0.5">Compte Général Trésor</span>
                      </div>
                      <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <span className="text-[10px] text-emerald-900 font-bold block uppercase">Part Régie DDL-PN (30%)</span>
                        <span className="text-base font-black text-[#006d2f]">
                          {Number(data.regie_share_30 || Math.round(Number(data.amount_fcfa || 0) * 0.3)).toLocaleString('fr-FR')} FCFA
                        </span>
                        <span className="text-[9px] text-slate-500 block mt-0.5">Frais d'instruction & terrain</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-500 italic text-center">
                    Cette attestation électronique fait foi de paiement libératoire officiel des droits d'agrément conformément aux textes de la République du Congo.
                  </p>
                </div>

                {/* Signatures */}
                <div className="border-t-2 border-slate-300 pt-3">
                  <div className="flex justify-between items-end px-6 font-serif">
                    <div className="text-center w-56">
                      <p className="text-[10px] text-slate-700 font-bold uppercase">Le Régisseur des Recettes SAF</p>
                      <div className="h-10 flex items-center justify-center text-[9px] text-slate-400 italic">[Visa & Émargement]</div>
                      <p className="font-bold text-xs text-[#022448]">Régie DDL-PN</p>
                    </div>

                    <div className="text-center w-56">
                      <p className="text-[10px] text-slate-700 font-semibold">Fait à Pointe-Noire, le {formatDateFR(new Date())}</p>
                      <p className="text-[10px] font-bold text-slate-900 uppercase">Le Directeur Départemental,</p>
                      <div className="h-10 flex items-center justify-center text-[9px] text-slate-400 italic">[Sceau Officiel de l'État]</div>
                      <p className="font-bold text-xs text-[#022448]">Jean Richard NTSEKE NGOUAKA</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===================================================================
               PROTOTYPE 11: BORDEREAU QUOTIDIEN DE RAPPROCHEMENT BANCAIRE (A4)
               =================================================================== */}
            {documentType === 'BORDEREAU_RAPPROCHEMENT_A4' && (
              <div className="print-page-a4 w-full max-w-[210mm] bg-white p-8 text-black border border-slate-300 shadow-md font-sans text-xs flex flex-col justify-between">
                <div>
                  {/* Header Republic */}
                  <div className="flex justify-between items-start border-b-2 border-[#006d2f] pb-4 mb-4">
                    <div className="text-left font-serif text-[10px] leading-tight space-y-0.5">
                      <p className="font-bold uppercase tracking-wider text-[#022448]">RÉPUBLIQUE DU CONGO</p>
                      <p className="text-[8.5px] italic text-[#006d2f] font-semibold">Unité • Travail • Progrès</p>
                      <p className="font-semibold text-slate-700 mt-1">MINISTÈRE DE L'INDUSTRIE CULTURELLE, TOURISTIQUE,</p>
                      <p className="font-semibold text-slate-700">ARTISTIQUE ET DES LOISIRS</p>
                      <p className="font-extrabold text-[9.5px] text-[#022448] mt-1">DIRECTION GÉNÉRALE DES LOISIRS</p>
                      <p className="font-bold text-[9px] text-[#006d2f]">DIRECTION DÉPARTEMENTALE DE POINTE-NOIRE</p>
                      <p className="text-[8.5px] font-bold text-slate-600">SERVICE ADMINISTRATIF ET FINANCIER (SAF)</p>
                    </div>

                    <div className="flex flex-col items-center">
                      <OfficialRepublicLogo size="md" showMotto={false} />
                      <span className="text-[8.5px] font-black uppercase text-[#006d2f] mt-1 font-mono-ref">FINTECH D'ÉTAT</span>
                    </div>

                    <div className="text-right font-mono-ref text-[9.5px] text-slate-700 space-y-0.5">
                      <p className="font-bold text-[#022448] text-[11px]">RÉF : {data.reference_bordereau || 'BORD-TR-2026-0928'}</p>
                      <p>Date : {formatDateFR(data.date_reconciliation || new Date())}</p>
                      <p className="text-[8.5px] text-slate-500">Ville de Pointe-Noire</p>
                      <div className="mt-1 flex justify-end">
                        <RepublicQrCode
                          payload={{
                            type: 'RAPPROCHEMENT_BANCAIRE',
                            ref: data.reference_bordereau,
                            banque: data.bank_name,
                            total: data.total_reconciled_fcfa,
                            statut: data.reconciliation_status
                          }}
                          size={48}
                          showDetails={false}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="text-center my-4">
                    <h3 className="text-base font-black uppercase text-[#022448] tracking-wide font-republic">
                      BORDEREAU QUOTIDIEN DE RAPPROCHEMENT BANCAIRE & FISCAL
                    </h3>
                    <p className="text-[10px] text-slate-600 font-mono-ref mt-0.5">
                      Compte Trésor Public (70%) & Régie des Recettes DDL-PN (30%)
                    </p>
                  </div>

                  {/* Bank & Account Info */}
                  <div className="bg-slate-50 border border-slate-300 rounded-lg p-3 my-4 space-y-1.5 font-mono-ref text-[11px]">
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-600">Établissement Bancaire Partenaire :</span>
                      <strong className="text-[#022448]">{data.bank_name || 'Banque des États de l’Afrique Centrale (BEAC)'}</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-600">N° de Compte Trésor / Régie :</span>
                      <strong>{data.bank_account_number || 'CG02-BEAC-10001-094821'}</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-600">Nombre de Quittances Pointées :</span>
                      <strong className="text-emerald-700">{data.matching_receipts_count || 48} quittances contradictoires</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Statut du Rapprochement Journalier :</span>
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                        ✓ RAPPROCHÉ SANS AUCUN ÉCART (100% CONFORME)
                      </span>
                    </div>
                  </div>

                  {/* Financial Breakdown Table */}
                  <table className="w-full text-left border-collapse border border-slate-300 my-4 text-[11px]">
                    <thead>
                      <tr className="bg-[#022448] text-white">
                        <th className="p-2 border border-slate-400">Poste Comptable & Répartition Légale</th>
                        <th className="p-2 border border-slate-400 text-center">Clé de Répartition</th>
                        <th className="p-2 border border-slate-400 text-right">Montant Justifié (FCFA)</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono-ref">
                      <tr className="border-b border-slate-300">
                        <td className="p-2.5 font-bold text-slate-800">Compte Central du Trésor Public (Brazzaville)</td>
                        <td className="p-2.5 text-center font-bold text-blue-700">70 %</td>
                        <td className="p-2.5 text-right font-black text-slate-900">
                          {Number(data.treasury_deposit_amount_fcfa || 0).toLocaleString('fr-FR')} FCFA
                        </td>
                      </tr>
                      <tr className="border-b border-slate-300 bg-slate-50">
                        <td className="p-2.5 font-bold text-slate-800">Compte Régie des Recettes DDL-PN (Pointe-Noire)</td>
                        <td className="p-2.5 text-center font-bold text-emerald-700">30 %</td>
                        <td className="p-2.5 text-right font-black text-slate-900">
                          {Number(data.regie_deposit_amount_fcfa || 0).toLocaleString('fr-FR')} FCFA
                        </td>
                      </tr>
                      <tr className="bg-emerald-50 border-t-2 border-[#006d2f] text-emerald-950 font-bold">
                        <td className="p-2.5 uppercase font-republic">Total Général Rapproché Quotidien</td>
                        <td className="p-2.5 text-center">100 %</td>
                        <td className="p-2.5 text-right font-black text-sm text-[#006d2f]">
                          {Number(data.total_reconciled_fcfa || 0).toLocaleString('fr-FR')} FCFA
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="bg-amber-50/70 border border-amber-300 p-2.5 rounded text-[10.5px] space-y-1 text-amber-950 my-3">
                    <p className="font-bold">Attestation de Clôture Comptable :</p>
                    <p>
                      Le Régisseur des Recettes atteste que l'ensemble des encaissements dématérialisés (MoMo, Airtel Money, virements) et versements bancaires effectués à cette date correspondent rigoureusement aux écritures enregistrées dans le grand livre du Système Intégré DDL-PN. Écart d'inventaire : <strong>{data.variance_fcfa || 0} FCFA</strong>.
                    </p>
                  </div>
                </div>

                {/* Signatures */}
                <div className="border-t-2 border-slate-300 pt-4 mt-6">
                  <div className="flex justify-between items-end px-6 font-serif text-[10px]">
                    <div className="text-center w-52">
                      <p className="font-bold text-slate-800 uppercase">Le Régisseur des Recettes SAF</p>
                      <div className="h-12 flex items-center justify-center text-[9px] text-slate-400 italic">[Signature & Cachet Nominatif]</div>
                      <p className="font-bold text-xs text-[#022448]">{data.agent_approbateur || 'Patrick MBOUSSI'}</p>
                    </div>

                    <div className="text-center w-52">
                      <p className="font-bold text-slate-800 uppercase">L'Agent Comptable du Trésor</p>
                      <div className="h-12 flex items-center justify-center text-[9px] text-slate-400 italic">[Visa Trésor Public]</div>
                      <p className="font-bold text-xs text-slate-700">Inspection du Trésor</p>
                    </div>

                    <div className="text-center w-52">
                      <p className="text-slate-600 font-semibold">Pointe-Noire, le {formatDateFR(new Date())}</p>
                      <p className="font-bold text-slate-900 uppercase">Le Directeur Départemental</p>
                      <div className="h-12 flex items-center justify-center text-[9px] text-slate-400 italic">[Sceau Officiel de l'État]</div>
                      <p className="font-bold text-xs text-[#022448]">Jean Richard NTSEKE NGOUAKA</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===================================================================
               PROTOTYPE 12: PROCÈS-VERBAL D'INFRACTION ACOUSTIQUE (A4)
               =================================================================== */}
            {documentType === 'PV_INFRACTION_ACOUSTIQUE_A4' && (
              <div className="print-page-a4 w-full max-w-[210mm] bg-white p-8 text-black border border-slate-300 shadow-md font-sans text-xs flex flex-col justify-between">
                <div>
                  {/* Header Republic */}
                  <div className="flex justify-between items-start border-b-2 border-red-600 pb-4 mb-4">
                    <div className="text-left font-serif text-[10px] leading-tight space-y-0.5">
                      <p className="font-bold uppercase tracking-wider text-[#022448]">RÉPUBLIQUE DU CONGO</p>
                      <p className="text-[8.5px] italic text-[#006d2f] font-semibold">Unité • Travail • Progrès</p>
                      <p className="font-semibold text-slate-700 mt-1">MINISTÈRE DE LA CULTURE ET DES LOISIRS</p>
                      <p className="font-extrabold text-[9.5px] text-[#022448] mt-1">DIRECTION DÉPARTEMENTALE DES LOISIRS DE POINTE-NOIRE</p>
                      <p className="font-bold text-[9px] text-red-700">BRIGADE MIXTE DE CONTRÔLE ACOUSTIQUE & D'ORDRE PUBLIC</p>
                    </div>

                    <div className="flex flex-col items-center">
                      <OfficialRepublicLogo size="md" showMotto={false} />
                      <span className="text-[8px] font-black uppercase text-red-700 mt-1 font-mono-ref">RÉGULATION SONORE</span>
                    </div>

                    <div className="text-right font-mono-ref text-[9.5px] text-slate-700 space-y-0.5">
                      <p className="font-bold text-red-700 text-xs">PV N° : {data.pv_number || 'PV-SONO-2026-0012'}</p>
                      <p>Date : {formatDateFR(data.inspection_datetime || new Date())}</p>
                      <p>Heure du relevé : {new Date(data.inspection_datetime || Date.now()).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                      <div className="mt-1 flex justify-end">
                        <RepublicQrCode
                          payload={{
                            type: 'PV_INFRACTION_ACOUSTIQUE',
                            pv: data.pv_number,
                            etab: data.establishment_name,
                            db: data.measured_db,
                            sanction: data.sanction_immediate
                          }}
                          size={48}
                          showDetails={false}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="text-center my-3 bg-red-50 border border-red-300 py-2 rounded-lg">
                    <h3 className="text-sm font-black uppercase text-red-900 tracking-wide font-republic">
                      PROCÈS-VERBAL CONTRADICTOIRE D'INFRACTION ACOUSTIQUE & DE NUISANCE SONORE
                    </h3>
                    <p className="text-[9.5px] text-red-700 font-mono-ref mt-0.5">
                      En application de la Loi N° 21-2019 du 12 juillet 2019 et de la réglementation communale de Pointe-Noire
                    </p>
                  </div>

                  {/* Establishment Info */}
                  <div className="grid grid-cols-2 gap-3 my-3 bg-slate-50 border border-slate-300 rounded-lg p-3 font-mono-ref text-[10.5px]">
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase">Établissement Mis en Cause</span>
                      <strong className="text-slate-900 font-sans text-xs uppercase">{data.establishment_name}</strong>
                      <p className="text-slate-600 mt-1">Promoteur : <strong>{data.promoter_name}</strong></p>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase">Arrondissement & Localisation</span>
                      <strong className="text-slate-800">{data.arrondissement}</strong>
                      <p className="text-slate-600 mt-1">{data.address || 'Pointe-Noire'}</p>
                    </div>
                  </div>

                  {/* Sonometer Measurement Box */}
                  <div className="border-2 border-red-500 bg-red-50/40 rounded-xl p-3 my-3 space-y-2">
                    <div className="flex justify-between items-center border-b border-red-200 pb-2">
                      <span className="font-extrabold uppercase text-xs text-red-950 font-republic">
                        Relevé Sonométrique In Situ par Équipage Mixte
                      </span>
                      <span className="bg-red-600 text-white font-black px-2 py-0.5 rounded text-[10px] font-mono-ref">
                        INFRACTION GRAVE CONSTATÉE
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center py-2">
                      <div className="bg-white border border-red-300 rounded-lg p-2">
                        <span className="text-[9px] text-slate-500 uppercase block">Niveau Mesuré</span>
                        <strong className="text-xl font-black text-red-600 font-mono-ref">{data.measured_db || 91} dB(A)</strong>
                      </div>
                      <div className="bg-white border border-slate-300 rounded-lg p-2">
                        <span className="text-[9px] text-slate-500 uppercase block">Seuil Légal Autorisé</span>
                        <strong className="text-xl font-black text-slate-800 font-mono-ref">{data.threshold_legal_db || 45} dB(A)</strong>
                      </div>
                      <div className="bg-white border border-red-400 bg-red-100/50 rounded-lg p-2">
                        <span className="text-[9px] text-red-800 uppercase block">Dépassement Illégal</span>
                        <strong className="text-xl font-black text-red-800 font-mono-ref">+{data.excess_db || 46} dB</strong>
                      </div>
                    </div>

                    <div className="text-[10px] space-y-0.5 font-mono-ref text-slate-700">
                      <p>• Point de prélèvement : <strong>{data.measurement_location || 'VOIE_PUBLIQUE_RIVERAINS'}</strong></p>
                      <p>• Période horaire : <strong>{data.time_period === 'NOCTURNE_22H_06H' ? 'Période Nocturne (22h00 - 06h00)' : 'Période Diurne (06h00 - 22h00)'}</strong></p>
                      <p>• Observations : {data.notes}</p>
                    </div>
                  </div>

                  {/* Sanction Imposed */}
                  <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 my-3 text-[10.5px] space-y-1">
                    <p className="font-bold uppercase text-amber-950">Mesure Réglementaire Immédiate Notifiée :</p>
                    <p className="font-mono-ref font-bold text-red-700 text-xs">
                      {data.sanction_immediate === 'SAISIE_AMPLIFICATEURS'
                        ? '🚨 SAISIE IMMÉDIATE DU MATÉRIEL D\'AMPLIFICATION & MISE SOUS SCELLÉS'
                        : data.sanction_immediate === 'FERMETURE_ADMINISTRATIVE_IMMEDIATE'
                        ? '⛔ FERMETURE ADMINISTRATIVE IMMÉDIATE DE L\'ÉTABLISSEMENT'
                        : '⚠️ MISE EN DEMEURE FORMELLE SOUS 48 HEURES OUVRÉES (Calibrage & Limiteur Scellé Obligatoire)'}
                    </p>
                    <p className="text-slate-600 text-[9.5px]">
                      Le contrevenant dispose d'un délai strict pour déférer à la présente sommation. À défaut, la fermeture temporaire de l'établissement sera ordonnée sans autre avis.
                    </p>
                  </div>
                </div>

                {/* Signatures */}
                <div className="border-t-2 border-slate-300 pt-3 mt-4">
                  <div className="flex justify-between items-end px-4 font-serif text-[9.5px]">
                    <div className="text-center w-48">
                      <p className="font-bold text-slate-800 uppercase">L'Inspecteur Sonométrie DDL-PN</p>
                      <div className="h-10 flex items-center justify-center text-[8.5px] text-slate-400 italic">[Signature Officier SAA]</div>
                      <p className="font-bold text-xs text-[#022448]">{data.officers?.ddl_officer || 'Bienvenu LOUBAKI'}</p>
                    </div>

                    <div className="text-center w-48">
                      <p className="font-bold text-slate-800 uppercase">La Force Publique (Police / Gendarmerie)</p>
                      <div className="h-10 flex items-center justify-center text-[8.5px] text-slate-400 italic">[Visa & Émargement]</div>
                      <p className="font-bold text-xs text-slate-700">{data.officers?.police_officer || 'Police Nationale'}</p>
                    </div>

                    <div className="text-center w-48">
                      <p className="font-bold text-slate-800 uppercase">Le Promoteur Contrevenant</p>
                      <div className="h-10 flex items-center justify-center text-[8.5px] text-slate-400 italic">[Pour Notification Prise en Charge]</div>
                      <p className="font-bold text-xs text-slate-800">{data.promoter_name || 'Exploitant'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer info (no-print) */}
        <div className="no-print p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
          <span className="text-[11px]">
            Astuce : Si le navigateur n'ouvre pas la boîte d'impression, cliquez sur <strong>Pleine page / PDF</strong> pour exporter ou imprimer directement via Ctrl+P.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              disabled={isPrinting}
              className="bg-[#006d2f] hover:bg-[#005a26] text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className="px-4 py-1.5 bg-slate-800 hover:bg-red-700 text-white font-bold rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              title="Fermer l'aperçu du document officiel"
            >
              <X className="w-3.5 h-3.5" />
              <span>Fermer l'aperçu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { X, Printer, Download, CheckCircle2, ShieldCheck, QrCode } from 'lucide-react';
import { OfficialRepublicLogo, RepublicTricolorBar } from '../common/OfficialSeal';
import { OfficialVerifiableQrCode } from '../common/OfficialVerifiableQrCode';
import { REPUBLIQUE_CONGO } from '../../constants/referential';

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
  if (!isOpen || !data) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-300 print:border-none print:shadow-none print:max-w-none print:max-h-none print:w-full">
        {/* Modal Controls (Hidden in print) */}
        <div className="no-print bg-slate-900 text-white px-5 py-3 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <Printer className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold tracking-tight">{title}</h3>
              <p className="text-[11px] text-slate-400 font-mono-ref">
                Format : {documentType === 'TICKET_58MM' ? 'Ticket Thermique POS 58mm' : 'Format Officiel A4 Républicain'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-[#006d2f] hover:bg-[#005a26] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer maintenant</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 print:bg-white print:p-0 flex justify-center">
          {documentType === 'TICKET_58MM' ? (
            /* 58mm Thermal Ticket Rendering */
            <div className="print-ticket-58mm w-[58mm] bg-white p-3 font-mono-ref text-[11px] leading-tight text-black border border-dashed border-slate-300 shadow print:shadow-none print:border-none">
              <div className="text-center pb-2 border-b border-dashed border-black">
                <OfficialRepublicLogo size="xs" className="mx-auto mb-1" />
                <p className="font-extrabold text-[12px] uppercase">RÉPUBLIQUE DU CONGO</p>
                <p className="text-[9px]">MINISTÈRE DE LA CULTURE ET LOISIRS</p>
                <p className="font-bold text-[10px] mt-1">DIRECTION DÉPARTEMENTALE</p>
                <p className="font-bold text-[10px]">DES LOISIRS DE POINTE-NOIRE</p>
                <p className="text-[8px] italic mt-0.5">Régie SAF - Brigade SAA</p>
              </div>

              <div className="my-2 text-center">
                <span className="font-extrabold text-[11px] bg-black text-white px-1.5 py-0.5 inline-block">
                  QUITTANCE D'ENCAISSEMENT
                </span>
                <p className="text-[9px] mt-1 font-bold">RÉF : {data.receipt_reference || data.receiptReference || 'REC-DDL-PN-2026'}</p>
                <p className="text-[8px]">Date: {data.record_date || new Date().toISOString().split('T')[0]} - {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
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
                  <span>{data.payment_method || 'MTN Mobile Money'}</span>
                </div>
                {data.transaction_ref && (
                  <div className="flex justify-between text-[8px]">
                    <span>Transaction :</span>
                    <span>{data.transaction_ref}</span>
                  </div>
                )}
                {/* Prochain versement convenu avec la tenancière */}
                {data.next_due_date && (
                  <div className="mt-2 pt-1 border-t border-dashed border-black bg-emerald-50 p-1.5 text-center rounded">
                    <span className="font-extrabold text-[8.5px] uppercase block text-emerald-950">
                      🤝 Prochain RDV Convenu (Solde)
                    </span>
                    <span className="font-mono-ref font-black text-[10px] text-black block">
                      {data.next_due_date}
                    </span>
                    {data.next_appointment_notes && (
                      <span className="text-[7px] text-slate-700 italic block leading-tight mt-0.5">
                        « {data.next_appointment_notes} »
                      </span>
                    )}
                  </div>
                )}

                {/* Règle de renouvellement N+1 obligatoire */}
                {(data.annual_renewal_scheduled_date || data.annual_renewal_date) && (
                  <div className="mt-2 pt-1 border-t border-dashed border-black bg-amber-50 p-1 text-center">
                    <span className="font-extrabold text-[8.5px] uppercase block text-amber-950">
                      📅 Renouvellement Annuel N+1
                    </span>
                    <span className="font-mono-ref font-black text-[10px] text-black block">
                      {data.annual_renewal_scheduled_date || data.annual_renewal_date}
                    </span>
                    <span className="text-[6.5px] text-slate-700 italic block leading-tight">
                      (Échéance fixée au jour du 1er acompte de l'année suivante)
                    </span>
                  </div>
                )}
              </div>

              {/* Verifiable QR Code on POS Ticket */}
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
            /* Diplôme d'Honneur des Loisirs Sains A4 */
            <div className="print-page-a4 w-[210mm] min-h-[297mm] bg-amber-50/40 p-12 text-slate-800 relative border-8 border-double border-amber-600/60 shadow-lg print:shadow-none print:border-8 print:border-amber-700">
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

                <div className="my-8 py-4 border-t-2 border-b-2 border-amber-500/40 max-w-xl mx-auto bg-white/70 shadow-inner">
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
                      'Conformité acoustique stricte (<80 dB) certifiée par la Brigade SAA',
                      'Cadre d’accueil familial sain et éco-responsable',
                      'Régularité fiscale et sociale vis-à-vis des redevances d’État'
                    ]).map((r: string, idx: number) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-12 flex items-end justify-between max-w-xl mx-auto pt-6 text-xs">
                  <div className="text-left font-mono-ref">
                    <OfficialVerifiableQrCode
                      data={{
                        ref: data.reference_number || 'DIP-HONNEUR-DDLPN-2026',
                        type: 'DIPLOME_HONNEUR_LOISIRS_SAINS',
                        establishment_name: data.establishment_name || data.name,
                        promoter_name: data.promoter_name,
                        date: data.award_date,
                        arrondissement: data.arrondissement
                      }}
                      size={70}
                      showDetails={false}
                      className="mb-1"
                    />
                    <p className="font-bold">N° Enregistrement :</p>
                    <p className="text-amber-800 font-bold">{data.reference_number || 'DIP-HONNEUR-DDLPN-2026'}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Fait à Pointe-Noire, le {data.award_date || new Date().toISOString().split('T')[0]}</p>
                  </div>

                  <div className="flex flex-col items-center">
                    <OfficialRepublicLogo size="md" />
                    <p className="text-[9px] uppercase font-bold text-[#022448] mt-1">Sceau de l'Administration</p>
                  </div>

                  <div className="text-center font-serif">
                    <p className="text-[11px] font-bold text-slate-800">Le Directeur Départemental,</p>
                    <div className="h-12 flex items-center justify-center italic text-slate-400 font-serif text-sm">
                      [Signature & Sceau]
                    </div>
                    <p className="font-extrabold text-[#022448] text-xs">Jean Richard NTSEKE NGOUAKA</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Official Republic A4 Acts / Attestation / Bordereau */
            <div className="print-page-a4 w-[210mm] min-h-[297mm] bg-white p-12 text-slate-900 relative border border-slate-300 shadow-xl print:shadow-none print:border-none">
              {/* Header Republic Banner */}
              <div className="flex items-start justify-between pb-6 border-b-2 border-[#022448]">
                {/* Left: Ministry Hierarchy */}
                <div className="text-center w-64 text-xs font-serif leading-tight">
                  <p className="font-extrabold text-sm uppercase text-[#006d2f] font-republic">
                    RÉPUBLIQUE DU CONGO
                  </p>
                  <p className="text-[10px] italic font-semibold text-slate-600">
                    Unité • Travail • Progrès
                  </p>
                  <div className="w-16 h-0.5 bg-amber-500 mx-auto my-1.5" />
                  <p className="font-bold text-[10px] uppercase text-[#022448]">
                    MINISTÈRE DE LA CULTURE, DES ARTS, DU PATRIMOINE NATIONAL ET DE L’INDUSTRIE TOURISTIQUE
                  </p>
                  <div className="w-10 h-0.5 bg-slate-300 mx-auto my-1" />
                  <p className="font-semibold text-[9.5px]">DIRECTION GÉNÉRALE DES LOISIRS</p>
                  <p className="font-bold text-[10px] text-[#006d2f] uppercase mt-1">
                    DIRECTION DÉPARTEMENTALE DES LOISIRS DE POINTE-NOIRE
                  </p>
                  <p className="text-[8.5px] font-mono-ref text-slate-500 mt-1">
                    SERVICE ASSISTANCE ET AUTORISATION
                  </p>
                </div>

                {/* Center: Official Coat of Arms */}
                <div className="flex flex-col items-center">
                  <OfficialRepublicLogo size="md" showMotto={false} />
                  <RepublicTricolorBar className="w-24 mt-2 h-1" />
                </div>

                {/* Right: Date, Reference & Real Verifiable QR Code Header */}
                <div className="text-right w-72 font-serif text-xs flex flex-col items-end">
                  <p className="italic text-slate-600">Pointe-Noire, le {data.date_emission || data.record_date || new Date().toISOString().split('T')[0]}</p>
                  <p className="font-mono-ref font-bold text-slate-900 mt-1 text-[11px]">
                    N° {data.reference_number || data.receipt_reference || 'REF-DDL-PN-2026/01'}
                  </p>
                  {data.type && (
                    <span className="inline-block my-1 px-2 py-0.5 bg-red-100 text-red-800 text-[10px] font-bold rounded border border-red-300 uppercase">
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
                      size={68}
                      showDetails={false}
                    />
                  </div>
                </div>
              </div>

              {/* Main Document Body */}
              <div className="mt-8 font-legal">
                {documentType === 'ACTE_JURIDIQUE_A4' ? (
                  <div>
                    <h2 className="text-center text-xl font-extrabold uppercase tracking-wide text-[#022448] font-republic mb-6 underline decoration-amber-500 underline-offset-8">
                      {data.type === 'MISE_EN_DEMEURE'
                        ? 'MISE EN DEMEURE SOUS HUTAINE (72 HEURES)'
                        : data.type === 'CONVOCATION'
                        ? 'CONVOCATION OFFICIELLE CONTRADICTOIRE'
                        : data.type === 'ARRETE_FERMETURE'
                        ? 'ARRÊTÉ PORTANT FERMETURE ADMINISTRATIVE IMMÉDIATE'
                        : 'ORDRE DE MISSION DE CONTRÔLE SAA'}
                    </h2>

                    <div className="bg-slate-50 border border-slate-300 p-4 rounded-lg my-6 text-sm">
                      <p><span className="font-bold">Destinataire :</span> {data.promoter_name} (Exploitant / Gérant)</p>
                      <p><span className="font-bold">Établissement :</span> <span className="font-bold uppercase text-[#022448]">{data.establishment_name}</span></p>
                      <p><span className="font-bold">Arrondissement :</span> {data.arrondissement}</p>
                      <p><span className="font-bold">Adresse des lieux :</span> {data.address || 'Quartier d\'implantation'}</p>
                    </div>

                    <div className="text-xs space-y-2 text-slate-600 my-4 border-l-2 border-[#006d2f] pl-3 italic">
                      <p className="font-bold text-slate-800 not-italic uppercase">Visas légaux :</p>
                      {(data.visa_lois || [
                        'Vu la Constitution de la République du Congo ;',
                        'Vu la Loi N° 21-2019 du 12 juillet 2019 fixant le régime général des loisirs ;',
                        'Vu le Décret N° 2021-412 du 28 octobre 2021 portant organisation de la DGL ;',
                        'Vu l’Arrêté Préfectoral et Départemental relatif à la lutte contre les pollutions sonores.'
                      ]).map((v: string, idx: number) => (
                        <p key={idx}>{v}</p>
                      ))}
                    </div>

                    <div className="text-sm text-justify leading-relaxed space-y-4 my-6">
                      <p>
                        Il a été dûment constaté par les agents assermentés de la Brigade du Service Agrément et Assainissement (SAA) :
                      </p>
                      <div className="bg-amber-50 border-l-4 border-amber-600 p-3 font-semibold text-slate-800">
                        {data.motif}
                      </div>

                      <p>
                        En conséquence de quoi, il vous est imparti un délai de <strong>{data.delai_huitaine_date || '72 heures'}</strong> pour vous présenter aux bureaux de la Direction Départementale des Loisirs munis des pièces justificatives et procéder à la régularisation intégrale de votre dossier.
                      </p>
                      <p>
                        Passé ce délai impératif, il sera procédé sans autre avis à la fermeture administrative des locaux avec apposition des scellés de la République et transmission du dossier au Parquet compétent.
                      </p>
                    </div>
                  </div>
                ) : documentType === 'SOIT_TRANSMIS_A4' || documentType === 'BORDEREAU_DGL_A4' ? (
                  /* SOIT TRANSMIS & BORDEREAU CENTRAL MINISTERE BRAZZAVILLE */
                  <div className="space-y-6 text-sm">
                    {/* Destination & Calling Header */}
                    <div className="flex justify-end">
                      <div className="w-80 text-right font-serif">
                        <p className="font-bold text-slate-800 text-xs uppercase">
                          Le Directeur Départemental des Loisirs de Pointe-Noire
                        </p>
                        <div className="my-3 text-center sm:text-right">
                          <p className="text-xs font-serif italic text-slate-600">A</p>
                          <p className="font-serif italic text-base font-bold text-[#022448] tracking-wide">
                            Madame La Directrice Générale Des Loisirs.
                          </p>
                          <p className="text-xs font-serif font-bold text-slate-700">- Brazzaville -</p>
                        </div>
                      </div>
                    </div>

                    {/* Objet */}
                    <div className="border-b-2 border-slate-300 pb-2">
                      <p className="text-sm font-serif">
                        <span className="font-extrabold text-[#022448] uppercase underline underline-offset-4">Objet :</span>{' '}
                        <span className="font-bold text-slate-900">Soit transmis.</span>
                      </p>
                    </div>

                    {/* Salutation & Body */}
                    <div className="text-sm leading-relaxed space-y-4 font-serif text-slate-800 my-8">
                      <p className="font-bold">Madame la Directrice Générale,</p>

                      <p className="text-justify indent-8 leading-loose">
                        {data.transmission_message ||
                          data.motif ||
                          (data.items && data.items.length > 0
                            ? `J’ai l’honneur de vous faire parvenir, pour toutes fins utiles et signature ministérielle, le bordereau récapitulatif ainsi que les dossiers d'agrément instruits et régularisés (${data.count || data.items.length} établissements) au titre du Plan de Travail Annuel (PTA 2026).`
                            : 'J’ai l’honneur de vous faire parvenir, pour toutes fins utiles le rapport d’activités et de sensibilisation des établissements de loisirs de Pointe-Noire.')}
                      </p>

                      <p className="text-justify indent-8 pt-4">
                        Je vous prie de recevoir, Madame la Directrice Générale, l’expression de mon plus grand respect/-
                      </p>
                    </div>

                    {/* Optional table if multiple dossiers are attached */}
                    {data.items && data.items.length > 0 && (
                      <div className="my-4 pt-2">
                        <p className="text-xs font-bold uppercase text-[#022448] mb-2 font-mono-ref">
                          Bordereau Récapitulatif des Pièces Jointes :
                        </p>
                        <table className="w-full text-xs border border-slate-300 text-left">
                          <thead className="bg-[#022448] text-white text-[11px]">
                            <tr>
                              <th className="p-2 border border-slate-400">N°</th>
                              <th className="p-2 border border-slate-400">Établissement</th>
                              <th className="p-2 border border-slate-400">Promoteur / Gérant</th>
                              <th className="p-2 border border-slate-400">Arrondissement</th>
                              <th className="p-2 border border-slate-400 text-right">Redevance Versée</th>
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
                ) : documentType === 'RAPPORT_TRIMESTRIEL_A4' ? (
                  /* RAPPORT TRIMESTRIEL D'ACTIVITE OFFICIEL MINISTERE */
                  <div className="space-y-6">
                    <div className="text-center pb-3 border-b-2 border-[#006d2f]">
                      <h2 className="text-lg font-black uppercase tracking-wide text-[#022448] font-republic">
                        RAPPORT D'ACTIVITÉS DU {data.trimestre || '3ème TRIMESTRE'} ({data.year || '2026'})
                      </h2>
                      <p className="text-xs font-semibold text-slate-600 mt-0.5">
                        Direction Départementale des Loisirs de Pointe-Noire • Période : {data.periodLabel || data.period || 'Exercice en cours'}
                      </p>
                    </div>

                    {/* Section 1 : Introduction & Contexte */}
                    <div className="text-xs text-justify leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                      <p className="font-bold text-[#022448] uppercase mb-1">1. Introduction & Contexte Général</p>
                      <p className="text-slate-700 whitespace-pre-line">{data.introduction || 'Le présent rapport dresse le bilan des activités de la Direction Départementale des Loisirs de Pointe-Noire.'}</p>
                    </div>

                    {/* Section 2 : Cadre Juridique */}
                    {data.cadreJuridique && (
                      <div className="text-xs text-justify leading-relaxed bg-blue-50/40 p-3 rounded-lg border border-blue-200">
                        <p className="font-bold text-[#022448] uppercase mb-1">2. Cadre Légal & Réglementaire Opposable</p>
                        <p className="text-slate-700 whitespace-pre-line">{data.cadreJuridique}</p>
                      </div>
                    )}

                    {/* Section 3 : Tableau des Indicateurs PTA */}
                    {data.indicators && data.indicators.length > 0 && (
                      <div>
                        <p className="font-bold text-xs text-[#022448] uppercase mb-1.5">3. Synthèse d'Exécution du Plan de Travail Annuel (PTA)</p>
                        <table className="w-full text-[11px] border border-slate-300 text-left">
                          <thead className="bg-[#022448] text-white">
                            <tr>
                              <th className="p-1.5 border">Indicateur / Activité Clé</th>
                              <th className="p-1.5 border">Cible</th>
                              <th className="p-1.5 border">Résultat Obtenu</th>
                              <th className="p-1.5 border text-center">Statut</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.indicators.map((ind: any, i: number) => (
                              <tr key={i} className="border-b border-slate-200">
                                <td className="p-1.5 border font-semibold">{ind.name}</td>
                                <td className="p-1.5 border font-mono-ref">{ind.target}</td>
                                <td className="p-1.5 border font-bold text-slate-800">{ind.result}</td>
                                <td className="p-1.5 border text-center font-bold text-[10px]">{ind.status}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Section 4 : Activités par Service */}
                    <div>
                      <p className="font-bold text-xs text-[#022448] uppercase mb-1.5">4. Activités Programmées Réalisées par Service</p>
                      <div className="grid grid-cols-2 gap-3 text-[11px]">
                        <div className="p-2.5 bg-slate-50 rounded border">
                          <p className="font-bold text-slate-900 uppercase text-[10px]">a. Service Administratif & Financier (SAFM)</p>
                          <p className="text-slate-600 mt-1 whitespace-pre-line">{data.safmBilan || 'Continuité administrative et comptabilité de régie assurées.'}</p>
                        </div>
                        <div className="p-2.5 bg-emerald-50/50 rounded border border-emerald-200">
                          <p className="font-bold text-emerald-950 uppercase text-[10px]">b. Service Assistance & Autorisation (SAA — Jacques MATOKO)</p>
                          <p className="text-slate-600 mt-1 whitespace-pre-line">{data.saaBilan || 'Recensement, contrôle in situ et régularisation des établissements de loisirs.'}</p>
                        </div>
                        <div className="p-2.5 bg-blue-50/50 rounded border border-blue-200">
                          <p className="font-bold text-blue-950 uppercase text-[10px]">c. Statistiques & Information (SSID)</p>
                          <p className="text-slate-600 mt-1 whitespace-pre-line">{data.ssidBilan || 'Consolidation de la base de données et cartographie des opérateurs.'}</p>
                        </div>
                        <div className="p-2.5 bg-amber-50/50 rounded border border-amber-200">
                          <p className="font-bold text-amber-950 uppercase text-[10px]">d. Promotion & Animation (SPA)</p>
                          <p className="text-slate-600 mt-1 whitespace-pre-line">{data.spaBilan || 'Animation des loisirs sains et partenariats stratégiques.'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Section 5 : Bilan Financier & Territorial */}
                    {data.bilanTerritorial && (
                      <div className="text-xs text-justify leading-relaxed bg-emerald-50/30 p-3 rounded-lg border border-emerald-200">
                        <p className="font-bold text-emerald-950 uppercase mb-1">5. Bilan Territorial & Ventilation des Recettes (70% Trésor / 30% Régie)</p>
                        <p className="text-slate-700 whitespace-pre-line">{data.bilanTerritorial}</p>
                      </div>
                    )}

                    {/* Section 6 : Police Acoustique & Partenariats */}
                    <div className="grid grid-cols-2 gap-3 text-[11px]">
                      <div className="p-2.5 bg-slate-50 rounded border">
                        <p className="font-bold text-slate-900 uppercase text-[10px]">6. Police Acoustique & Contrôles Sonométriques</p>
                        <p className="text-slate-600 mt-1 whitespace-pre-line">{data.policeAcoustique || 'Contrôles in situ réalisés au sonomètre sous 80 dB.'}</p>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded border">
                        <p className="font-bold text-slate-900 uppercase text-[10px]">7. Partenariats (Globaline, IFPN, Wing Wah)</p>
                        <p className="text-slate-600 mt-1 whitespace-pre-line">{data.partenariats || 'Conventions de partenariat en cours de signature.'}</p>
                      </div>
                    </div>

                    {/* Section 7 : Difficultés & Recommandations */}
                    <div className="grid grid-cols-2 gap-3 text-[11px]">
                      <div className="p-2.5 bg-slate-50 rounded border">
                        <p className="font-bold text-slate-900 uppercase text-[10px]">8. Difficultés & Contraintes</p>
                        <p className="text-slate-600 mt-1 whitespace-pre-line">{data.difficultes || 'Insuffisance de moyens de transport et contraintes budgétaires.'}</p>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded border">
                        <p className="font-bold text-slate-900 uppercase text-[10px]">9. Suggestions à Monsieur le Directeur</p>
                        <p className="text-slate-600 mt-1 whitespace-pre-line">{data.recommandations || 'Arbitrage budgétaire minimal et acquisition de moyens roulants.'}</p>
                      </div>
                    </div>

                    {/* Section 8 : Conclusion */}
                    {data.conclusion && (
                      <div className="text-xs text-justify leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <p className="font-bold text-[#022448] uppercase mb-1">10. Conclusion & Perspectives</p>
                        <p className="text-slate-700 whitespace-pre-line">{data.conclusion}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* ATTESTATION DE DEPOT OFFICIELLE DDL-PN */
                  <div className="space-y-8 my-6">
                    <div className="text-center my-6">
                      <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-widest text-[#022448] font-republic underline decoration-slate-400 underline-offset-8">
                        ATTESTATION DE DEPOT
                      </h1>
                    </div>

                    <div className="text-sm sm:text-base text-justify leading-loose space-y-6 font-serif text-slate-900 px-2 sm:px-6">
                      <p className="indent-8">
                        Par la présente, je soussigné, Directeur Départemental des Loisirs de Pointe-Noire, atteste que{' '}
                        <strong className="font-bold text-[#022448]">
                          {data.promoter_title || 'Monsieur/Madame'} {data.promoter_name || 'l’Exploitant'}
                        </strong>{' '}
                        a déposé un dossier en cours d’étude pour solliciter une autorisation d’exploitation d’un{' '}
                        <strong className="font-bold">
                          {data.activity_type || 'établissement de loisirs'}
                        </strong>{' '}
                        dénommé{' '}
                        <strong className="font-extrabold uppercase text-[#022448] tracking-wide">
                          « {data.establishment_name || data.name} »
                        </strong>, ayant pour adresse{' '}
                        <span className="italic font-medium">
                          {data.address || data.quartier || 'Pointe-Noire'}
                        </span>.
                      </p>

                      <p className="indent-8 pt-4 font-semibold text-slate-800">
                        En foi de quoi la présente attestation lui est établie pour servir et valoir ce que de droit. /-
                      </p>
                    </div>

                    {/* Financial & Renewal metadata strip for administrative traceability */}
                    <div className="mt-8 p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5 font-mono-ref max-w-xl mx-auto">
                      <div className="flex justify-between text-slate-700">
                        <span>Réf. Quittance de Dépôt :</span>
                        <strong className="text-[#022448]">{data.receipt_reference || 'REC-DDL-PN-2026'}</strong>
                      </div>
                      <div className="flex justify-between text-emerald-800 font-bold border-t border-slate-200 pt-1">
                        <span>Acompte enregistré en Régie :</span>
                        <span>{(data.amount_paid || data.amount || 0).toLocaleString('fr-FR')} FCFA</span>
                      </div>
                      {(data.annual_renewal_scheduled_date || data.annual_renewal_date) && (
                        <div className="flex justify-between text-amber-900 text-[11px] border-t border-slate-200 pt-1 font-sans">
                          <span>📅 Échéance Annuelle N+1 :</span>
                          <strong className="font-mono-ref">{data.annual_renewal_scheduled_date || data.annual_renewal_date}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Signatures & Seals Section */}
                <div className="mt-14 pt-6 border-t border-slate-300 flex items-end justify-between text-xs">
                  <div className="text-left font-mono-ref text-[11px]">
                    <OfficialVerifiableQrCode
                      data={{
                        ref: data.reference_number || data.receipt_reference || 'CERT-DDL-PN-2026',
                        type: documentType,
                        establishment_name: data.establishment_name || data.name,
                        promoter_name: data.promoter_name,
                        date: data.date_emission || data.record_date,
                        arrondissement: data.arrondissement
                      }}
                      size={72}
                      showDetails={true}
                    />
                  </div>

                  <div className="flex flex-col items-center">
                    <OfficialRepublicLogo size="md" />
                    <p className="text-[9px] uppercase font-bold text-slate-600 mt-1">Sceau officiel DDL-PN</p>
                  </div>

                  <div className="text-center font-serif">
                    <p className="text-xs text-slate-600 mb-1">
                      Fait à Pointe – Noire, le {data.record_date || data.date_emission || new Date().toLocaleDateString('fr-FR')}
                    </p>
                    <p className="font-bold text-slate-900">Le Directeur Départemental des Loisirs de Pointe-Noire,</p>
                    <div className="h-12 flex items-center justify-center text-slate-400 text-xs italic font-serif">
                      [Signature officielle et Cachet]
                    </div>
                    <p className="font-extrabold text-[#022448] text-sm tracking-wide uppercase">
                      NTSEKE NGOUAKA Jean Richard
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

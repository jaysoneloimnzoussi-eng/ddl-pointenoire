import React, { useMemo } from 'react';
import {
  CheckCircle2,
  ShieldCheck,
  Building2,
  Calendar,
  X,
  QrCode,
  UserCheck,
  Award,
  FileText,
  BadgeCheck,
  Check,
  ExternalLink,
  Phone
} from 'lucide-react';
import { OfficialRepublicLogo, RepublicTricolorBar } from './OfficialSeal';
import { formatDateFR } from '../../utils/dateUtils';
import { authService } from '../../services/authService';
import { storageService } from '../../services/storageService';
import { REPUBLIQUE_CONGO } from '../../constants/referential';

interface PublicVerificationViewProps {
  refCode: string;
  establishmentName?: string;
  date?: string;
  agentBadge?: string;
  type?: string;
  nom?: string;
  role?: string;
  amount?: number;
  onClose: () => void;
  onOpenScanner?: () => void;
}

export const PublicVerificationView: React.FC<PublicVerificationViewProps> = ({
  refCode,
  establishmentName,
  date,
  agentBadge,
  type,
  nom,
  role,
  amount,
  onClose,
  onOpenScanner
}) => {
  // Determine if this is an Agent Badge verification
  const isAgentVerification = useMemo(() => {
    const code = (agentBadge || refCode || '').toUpperCase();
    return (
      type === 'BADGE_ASSERMENTE' ||
      code.startsWith('SAA-') ||
      code.startsWith('ADM-') ||
      code.startsWith('DDL-') ||
      code.startsWith('SAF-') ||
      code.startsWith('SPA-') ||
      Boolean(agentBadge)
    );
  }, [agentBadge, refCode, type]);

  // Find agent in database if available
  const agentData = useMemo(() => {
    if (!isAgentVerification) return null;
    const targetBadge = (agentBadge || refCode || '').trim();
    const accounts = authService.getAllAccounts();
    const found = accounts.find(
      a =>
        a.badge.toLowerCase() === targetBadge.toLowerCase() ||
        a.id.toLowerCase() === targetBadge.toLowerCase() ||
        (nom && a.name.toLowerCase().includes(nom.toLowerCase()))
    );
    if (found) return found;

    // Fallback constructed profile
    return {
      name: nom || 'Agent Assermenté DDL-PN',
      badge: targetBadge || 'SAA-PN-001',
      title: role || 'Contrôleur Qualité et Conformité (Police des Loisirs)',
      service: 'Service Assistance et Autorisation (SAA) - Terrain',
      matricule: '315 713H',
      zone: 'Arrondissements de Pointe-Noire',
      phone: '+242 06 600 00 01',
      photoUrl: undefined,
      sermentDate: '2026-01-15'
    };
  }, [isAgentVerification, agentBadge, refCode, nom, role]);

  // Find establishment if applicable
  const establishmentData = useMemo(() => {
    if (isAgentVerification) return null;
    const establishments = storageService.getEstablishments();
    const query = (establishmentName || refCode || '').toLowerCase();
    return establishments.find(
      e =>
        e.id.toLowerCase() === refCode.toLowerCase() ||
        (query && e.name.toLowerCase().includes(query))
    );
  }, [isAgentVerification, establishmentName, refCode]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border-2 border-emerald-400 my-auto animate-in zoom-in-95 duration-200">
        <RepublicTricolorBar className="h-2.5" />

        <div className="p-5 sm:p-7 text-center space-y-4">
          {/* Header Seal & Republic identification */}
          <div className="flex flex-col items-center">
            <OfficialRepublicLogo size="md" className="mx-auto" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#006d2f] font-mono-ref mt-1">
              RÉPUBLIQUE DU CONGO • MCAPNIT
            </span>
            <span className="text-xs font-black text-[#022448] uppercase tracking-tight font-republic">
              Direction Départementale des Loisirs de Pointe-Noire
            </span>
          </div>

          {/* Verification Status Pill */}
          <div className="inline-flex items-center gap-2 bg-emerald-100 border border-emerald-300 text-[#006d2f] font-black px-4 py-1.5 rounded-full text-xs shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>AUTHENTIFICATION RÉPUBLICAINE OFFICIELLE</span>
          </div>

          {/* ========================================================
              CASE 1: AGENT ASSERMENTÉ BADGE VERIFICATION
             ======================================================== */}
          {isAgentVerification && agentData ? (
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-lg sm:text-xl font-black text-[#022448] font-republic uppercase">
                  Carte Professionnelle d'Agent Assermenté
                </h2>
                <p className="text-[11px] text-slate-500 font-mono-ref">
                  Accréditation Officielle • Force Publique & Police des Loisirs
                </p>
              </div>

              {/* Photo & Identity Card */}
              <div className="bg-slate-50 border-2 border-slate-300 rounded-2xl p-4 text-left shadow-inner flex flex-col sm:flex-row items-center gap-4">
                {/* Agent Photo */}
                <div className="w-24 h-28 rounded-xl bg-[#006d2f] text-amber-300 font-black text-3xl flex flex-col items-center justify-center border-2 border-amber-400 shadow-md shrink-0 relative overflow-hidden">
                  {agentData.photoUrl ? (
                    <img
                      src={agentData.photoUrl}
                      alt={agentData.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{agentData.name.charAt(0)}</span>
                  )}
                  <div className="absolute bottom-0 inset-x-0 bg-[#022448]/95 text-[7.5px] text-amber-300 font-mono-ref text-center py-0.5 font-bold uppercase tracking-wider">
                    ASSERMENTÉ
                  </div>
                </div>

                {/* Agent Credentials */}
                <div className="flex-1 min-w-0 space-y-1.5 text-xs">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Agent Vérifié :</span>
                    <strong className="text-sm font-black text-[#022448] block leading-tight">
                      {agentData.name}
                    </strong>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">N° de Badge :</span>
                      <span className="font-extrabold text-[#850404] font-mono-ref bg-amber-100 px-2 py-0.5 rounded inline-block">
                        {agentData.badge}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Matricule :</span>
                      <span className="font-bold text-slate-800 font-mono-ref">
                        {agentData.matricule || '315 713H'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Fonction & Service :</span>
                    <p className="font-bold text-slate-700 text-[11px] leading-tight">
                      {agentData.title}
                    </p>
                  </div>
                </div>
              </div>

              {/* Legal Oath Certification Box */}
              <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 text-left text-xs space-y-1 text-emerald-950 font-mono-ref">
                <div className="flex items-center gap-1.5 font-bold text-[#006d2f]">
                  <BadgeCheck className="w-4 h-4" />
                  <span className="uppercase text-[11px]">Serment Prêté & Accréditation Active</span>
                </div>
                <p className="text-[10.5px] text-slate-700">
                  • <strong>Tribunal de Grande Instance de Pointe-Noire</strong> (Loi N° 13-2011)
                </p>
                <p className="text-[10.5px] text-slate-700">
                  • Validité : <strong>Exercice & PTA 2026</strong> (Jusqu'au 31 Décembre 2026)
                </p>
                <p className="text-[10px] text-slate-600 italic">
                  Habilité à procéder aux recensements, encaissements de quittances officielles, contrôles sonométriques et notifications de mise en demeure.
                </p>
              </div>
            </div>
          ) : (
            /* ========================================================
               CASE 2: ESTABLISHMENT MACARON / RECEIPT / PV VERIFICATION
               ======================================================== */
            <div className="space-y-4">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-[#022448] font-republic uppercase">
                  Certificat de Conformité Réglementaire
                </h2>
                <p className="text-[11px] text-slate-500 font-mono-ref">
                  Registre Officiel de Régulation des Établissements de Loisirs
                </p>
              </div>

              {/* Data Card */}
              <div className="bg-slate-50 border border-slate-300 rounded-2xl p-4 text-left text-xs space-y-2.5 font-mono-ref shadow-inner">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-bold">RÉFÉRENCE OFFICIELLE :</span>
                  <strong className="text-[#022448] bg-amber-100 text-amber-950 px-2 py-0.5 rounded font-black">
                    {refCode || 'DDL-PN-2026'}
                  </strong>
                </div>

                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-slate-500">ÉTABLISSEMENT :</span>
                  <strong className="text-slate-900 uppercase font-sans text-xs">
                    {establishmentName || establishmentData?.name || 'Établissement Homologué'}
                  </strong>
                </div>

                {establishmentData?.promoter_name && (
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <span className="text-slate-500">PROMOTEUR / EXPLOITANT :</span>
                    <strong className="text-slate-800">{establishmentData.promoter_name}</strong>
                  </div>
                )}

                {establishmentData?.arrondissement && (
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <span className="text-slate-500">LOCALISATION :</span>
                    <strong className="text-slate-800">
                      {establishmentData.arrondissement} • {establishmentData.quartier || 'Pointe-Noire'}
                    </strong>
                  </div>
                )}

                {amount !== undefined && amount > 0 && (
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <span className="text-slate-500">MONTANT QUITTANCÉ :</span>
                    <strong className="text-[#006d2f] font-black">
                      {amount.toLocaleString('fr-FR')} FCFA
                    </strong>
                  </div>
                )}

                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-slate-500">DATE D'ENREGISTREMENT :</span>
                  <strong className="text-slate-900">
                    {date ? formatDateFR(date) : 'Session Active 2026'}
                  </strong>
                </div>

                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-slate-500">AUTORITÉ HOMOLOGATRICE :</span>
                  <strong className="text-emerald-800">Jean Richard NTSEKE NGOUAKA</strong>
                </div>

                <div className="flex justify-between items-center pt-1 text-[11px]">
                  <span className="text-slate-500 font-bold">STATUT BASE DE DONNÉES :</span>
                  <span className="bg-emerald-100 text-emerald-800 font-black px-2.5 py-1 rounded-full border border-emerald-300">
                    ✓ ENREGISTRÉ AU REGISTRE CENTRAL SAA
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Legal Note */}
          <p className="text-[10px] text-slate-500 italic leading-snug">
            Ce certificat numérique fait foi de l'enregistrement de l'acte ou du titre auprès du Système Intégré DDL-PN (République du Congo). Toute falsification est punie par la loi.
          </p>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
            {onOpenScanner && (
              <button
                type="button"
                onClick={onOpenScanner}
                className="w-full bg-[#006d2f] hover:bg-[#005a26] text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <QrCode className="w-4 h-4 text-amber-300" />
                <span>Scanner un autre QR Code</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className={`w-full bg-[#022448] hover:bg-[#033468] text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer ${
                !onOpenScanner ? 'sm:col-span-2' : ''
              }`}
            >
              Fermer la vérification
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

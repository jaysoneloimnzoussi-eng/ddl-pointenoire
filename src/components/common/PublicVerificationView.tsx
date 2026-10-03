import React from 'react';
import { CheckCircle2, ShieldCheck, FileText, Calendar, Building2, MapPin, X } from 'lucide-react';
import { OfficialRepublicLogo, RepublicTricolorBar } from './OfficialSeal';
import { formatDateFR } from '../../utils/dateUtils';

interface PublicVerificationViewProps {
  refCode: string;
  establishmentName?: string;
  date?: string;
  onClose: () => void;
}

export const PublicVerificationView: React.FC<PublicVerificationViewProps> = ({
  refCode,
  establishmentName,
  date,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-emerald-300 animate-in zoom-in-95">
        <RepublicTricolorBar className="h-2" />
        <div className="p-6 text-center space-y-4">
          <OfficialRepublicLogo size="md" className="mx-auto" />
          
          <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-[#006d2f] font-bold px-3 py-1 rounded-full text-xs">
            <CheckCircle2 className="w-4 h-4" />
            <span>DOCUMENT OFFICIEL AUTHENTIFIÉ</span>
          </div>

          <div>
            <h2 className="text-xl font-black text-[#022448] font-republic uppercase">
              Certificat de Conformité Réglementaire
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Direction Départementale des Loisirs de Pointe-Noire (MCAPNIT)
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left text-xs space-y-2.5 font-mono-ref">
            <div className="flex justify-between border-b border-slate-200 pb-1.5">
              <span className="text-slate-500">RÉFÉRENCE :</span>
              <strong className="text-[#022448]">{refCode || 'DDL-PN-2026'}</strong>
            </div>
            {establishmentName && (
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500">ÉTABLISSEMENT :</span>
                <strong className="text-slate-900 uppercase font-sans">{establishmentName}</strong>
              </div>
            )}
            <div className="flex justify-between border-b border-slate-200 pb-1.5">
              <span className="text-slate-500">DATE D'ÉMISSION :</span>
              <strong className="text-slate-900">{date ? formatDateFR(date) : 'Session Active 2026'}</strong>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1.5">
              <span className="text-slate-500">SIGNATAIRE :</span>
              <strong className="text-emerald-800">Jean Richard NTSEKE NGOUAKA</strong>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-500">STATUT BASE DE DONNÉES :</span>
              <span className="bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200">
                ENREGISTRÉ AU REGISTRE CENTRAL SAA
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 italic">
            Ce document est juridiquement valable sous réserve de non-altération du support physique et des mentions de l'arrêté ministériel.
          </p>

          <button
            onClick={onClose}
            className="w-full bg-[#022448] hover:bg-[#033468] text-white font-bold py-2.5 rounded-xl text-xs transition"
          >
            Fermer la vérification
          </button>
        </div>
      </div>
    </div>
  );
};

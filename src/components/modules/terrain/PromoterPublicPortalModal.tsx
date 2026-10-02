import React, { useState } from 'react';
import {
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  ShieldCheck,
  Receipt,
  Download,
  Phone,
  Calendar,
  Building2,
  X,
  Lock,
  ArrowRight,
  Sparkles,
  CreditCard
} from 'lucide-react';
import { Establishment, TerrainPaymentRecord } from '../../../types';
import { storageService } from '../../../services/storageService';
import { OfficialRepublicLogo } from '../../common/OfficialSeal';

interface PromoterPublicPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  establishment: Establishment | null;
  onPaymentSuccess?: (payment: TerrainPaymentRecord) => void;
}

export const PromoterPublicPortalModal: React.FC<PromoterPublicPortalModalProps> = ({
  isOpen,
  onClose,
  establishment,
  onPaymentSuccess
}) => {
  const [operator, setOperator] = useState<'MTN' | 'AIRTEL'>('MTN');
  const [momoNumber, setMomoNumber] = useState<string>('+242 06 654 32 10');
  const [payAmount, setPayAmount] = useState<number>(() => establishment?.balance_due || 50000);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [lastPayment, setLastPayment] = useState<TerrainPaymentRecord | null>(null);

  if (!isOpen || !establishment) return null;

  const isFullyPaid = establishment.balance_due === 0;

  const handleSimulatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (payAmount <= 0) return;

    setIsProcessing(true);

    setTimeout(() => {
      try {
        const result = storageService.recordPayment({
          establishment_id: establishment.id,
          amount: Number(payAmount),
          payment_method: operator === 'MTN' ? 'MTN Mobile Money' : 'Airtel Money',
          collected_by: 'Télépaiement Guichet Numérique Tenancier DDL-PN',
          agent_badge: 'MOMO-PAY-PORTAL',
          notes: `Règlement mobile en ligne via portail QR Code (${operator} Money - N° ${momoNumber})`
        });

        setIsProcessing(false);
        setIsSuccess(true);
        setLastPayment(result.payment);

        if (onPaymentSuccess) {
          onPaymentSuccess(result.payment);
        }
      } catch (err) {
        setIsProcessing(false);
        alert('Erreur lors du traitement du télépaiement.');
      }
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 animate-in fade-in">
      <div className="bg-slate-100 rounded-3xl shadow-2xl max-w-md w-full max-h-[95vh] overflow-y-auto border-4 border-slate-800 flex flex-col text-xs">
        {/* Simulated Smartphone Top Bar */}
        <div className="bg-slate-900 text-white px-5 py-2.5 flex items-center justify-between text-[11px] font-mono-ref shrink-0">
          <span>09:41</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>4G • DDL-PN Secure</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-0.5">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Portal Body */}
        <div className="p-4 space-y-4 flex-1">
          {/* Official Republic Header */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#006d2f] via-[#fbde44] to-[#d92323]" />
            <div className="flex items-center justify-center gap-2 mb-1 pt-1">
              <OfficialRepublicLogo size="sm" />
              <div className="text-left">
                <p className="text-[9px] font-black uppercase text-slate-700 tracking-wider">
                  République du Congo
                </p>
                <p className="text-[10px] font-black text-[#022448] font-republic">
                  Direction Départementale des Loisirs de Pointe-Noire
                </p>
              </div>
            </div>
            <span className="inline-block mt-1 text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-200 font-extrabold px-2.5 py-0.5 rounded-full">
              PORTAIL OFFICIEL TENANCIER & SÉCURISATION FISCALE
            </span>
          </div>

          {/* Establishment Status Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Établissement Agréé</span>
                <h3 className="text-base font-extrabold text-[#022448] leading-tight">
                  {establishment.name}
                </h3>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Promoteur : <strong className="text-slate-900">{establishment.promoter_name}</strong>
                </p>
              </div>

              {/* Status Badge */}
              <div className="text-right">
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    isFullyPaid
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : establishment.status === 'mise_en_demeure'
                      ? 'bg-red-100 text-red-900 border border-red-300'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}
                >
                  {isFullyPaid ? (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Régularisé N° 2026</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                      <span>Solde en Attente</span>
                    </>
                  )}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
              <div>
                <span className="text-slate-400 block text-[9.5px]">Arrondissement</span>
                <strong className="text-slate-800">{establishment.arrondissement}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[9.5px]">Quartier</span>
                <strong className="text-slate-800">{establishment.quartier}</strong>
              </div>
            </div>
          </div>

          {/* Financial Overview Card */}
          <div className="bg-gradient-to-br from-[#022448] to-[#043d7a] text-white p-4 rounded-2xl shadow-md space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Situation Redevance SAA 2026</span>
              <span className="font-mono-ref bg-white/10 px-2 py-0.5 rounded text-[10px]">
                {establishment.regime_type}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="bg-white/10 p-2 rounded-xl">
                <span className="text-[9px] text-slate-300 block">Total Dû</span>
                <span className="font-extrabold text-xs font-mono-ref">
                  {establishment.total_due.toLocaleString('fr-FR')} F
                </span>
              </div>
              <div className="bg-emerald-500/20 border border-emerald-400/30 p-2 rounded-xl">
                <span className="text-[9px] text-emerald-200 block">Déjà Réglé</span>
                <span className="font-black text-xs text-emerald-300 font-mono-ref">
                  {establishment.amount_paid.toLocaleString('fr-FR')} F
                </span>
              </div>
              <div className="bg-amber-500/20 border border-amber-400/30 p-2 rounded-xl">
                <span className="text-[9px] text-amber-200 block">Reste à Payer</span>
                <span className="font-black text-xs text-amber-300 font-mono-ref">
                  {establishment.balance_due.toLocaleString('fr-FR')} F
                </span>
              </div>
            </div>

            {establishment.annual_renewal_date && (
              <p className="text-[10px] text-amber-200/90 text-center bg-white/5 py-1 px-2 rounded-lg">
                ⭐ Renouvellement Annuel N+1 programmé au : <strong>{establishment.annual_renewal_date}</strong>
              </p>
            )}
          </div>

          {/* Direct Mobile Money Payment Section */}
          {!isFullyPaid && !isSuccess && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-slate-800 font-extrabold text-sm">
                <CreditCard className="w-4 h-4 text-[#006d2f]" />
                <span>Payer directement par Mobile Money</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Réglez votre acompte ou solde en direct sans vous déplacer au bureau. Quittance officielle délivrée instantanément.
              </p>

              {/* Operator Select (MTN MoMo vs Airtel Money) */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOperator('MTN')}
                  className={`p-2.5 rounded-xl border-2 font-bold flex items-center justify-center gap-2 transition ${
                    operator === 'MTN'
                      ? 'border-[#ffcc00] bg-amber-50 text-slate-900 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-[#ffcc00]" />
                  <span>MTN MoMo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOperator('AIRTEL')}
                  className={`p-2.5 rounded-xl border-2 font-bold flex items-center justify-center gap-2 transition ${
                    operator === 'AIRTEL'
                      ? 'border-red-500 bg-red-50 text-red-900 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-red-600" />
                  <span>Airtel Money</span>
                </button>
              </div>

              <form onSubmit={handleSimulatePayment} className="space-y-3 pt-1">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Numéro de téléphone {operator === 'MTN' ? 'MTN' : 'Airtel'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={momoNumber}
                    onChange={e => setMomoNumber(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl font-mono-ref font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Montant à verser (FCFA) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={1000}
                      max={establishment.balance_due}
                      value={payAmount}
                      onChange={e => setPayAmount(Number(e.target.value))}
                      className="w-full p-2 border border-slate-300 rounded-xl font-mono-ref font-black text-emerald-800 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setPayAmount(establishment.balance_due)}
                      className="absolute right-2 top-2 text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded font-bold text-slate-700"
                    >
                      Tout solder
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`w-full py-3 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition ${
                    operator === 'MTN'
                      ? 'bg-[#ffcc00] hover:bg-[#e6b800] text-slate-950'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                      <span>Confirmation USSD sur votre téléphone...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Payer {Number(payAmount).toLocaleString('fr-FR')} FCFA via {operator}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Success Card after Payment */}
          {isSuccess && lastPayment && (
            <div className="bg-emerald-50 border-2 border-emerald-400 p-4 rounded-2xl text-emerald-950 space-y-2 animate-in zoom-in-95 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-base">Paiement validé avec succès !</h4>
              <p className="text-[11px] text-emerald-800">
                Votre transaction de <strong>{lastPayment.amount_paid.toLocaleString('fr-FR')} FCFA</strong> a été validée et créditée à la Régie des Recettes DDL-PN.
              </p>
              <div className="p-2 bg-white rounded-xl border border-emerald-200 font-mono-ref text-[11px]">
                <span>Quittance Officielle : </span>
                <strong className="text-emerald-700">{lastPayment.receipt_reference}</strong>
              </div>
            </div>
          )}

          {/* QR Code Validation Stamp */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center gap-3">
            <div className="w-16 h-16 bg-slate-900 p-1 rounded-xl text-white flex items-center justify-center shrink-0">
              <QrCode className="w-12 h-12 text-amber-300" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Authentification Numérique</p>
              <p className="font-extrabold text-slate-800 text-xs truncate">
                ID : {establishment.id}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Certifié conforme par les serveurs de la DDL-PN et le Trésor Public.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-200 border-t border-slate-300 text-center shrink-0">
          <p className="text-[10px] text-slate-600 font-medium">
            DDL-PN • République du Congo • Loi N° 21-2019 du 12 juillet 2019
          </p>
        </div>
      </div>
    </div>
  );
};

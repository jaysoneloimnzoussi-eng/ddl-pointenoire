import React, { useState } from 'react';
import {
  Landmark,
  Coins,
  Receipt,
  Printer,
  Calendar,
  Building2,
  TrendingUp,
  Download,
  CheckCircle2,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { useSession } from '../../context/SessionContext';
import { TerrainPaymentRecord } from '../../types';
import { TAXATION_RULES } from '../../constants/referential';
import { PrintModal } from '../print/PrintModal';

export const SafRegieRecettesModule: React.FC = () => {
  const { currentUser, triggerNotification } = useSession();
  const [payments, setPayments] = useState<TerrainPaymentRecord[]>(() => storageService.getPayments());
  const stats = storageService.getSystemStats();

  const [filterMethod, setFilterMethod] = useState<string>('ALL');

  // Print modal
  const [printDoc, setPrintDoc] = useState<{
    isOpen: boolean;
    type: 'TICKET_58MM';
    title: string;
    data: any;
  }>({
    isOpen: false,
    type: 'TICKET_58MM',
    title: '',
    data: null
  });

  const filteredPayments = payments.filter(p => {
    return filterMethod === 'ALL' || p.payment_method === filterMethod;
  });

  // Calculate breakdown by method
  const methodBreakdown = payments.reduce((acc, p) => {
    acc[p.payment_method] = (acc[p.payment_method] || 0) + p.amount_paid;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded font-mono-ref">
              COMPTABILITÉ PUBLIQUE • SAF
            </span>
            <span className="text-xs text-slate-500">Régie des Recettes DDL-PN</span>
          </div>
          <h2 className="text-base sm:text-lg font-black text-[#022448] tracking-tight mt-1 flex items-center gap-2">
            <Landmark className="w-5 h-5 text-amber-700" />
            <span>Régie des Recettes & Versements au Trésor Public (SAF)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Application de la clé légale de répartition : 70% Trésor Public (Trésorier Payeur Général) / 30% Compte de Fonctionnement DDL-PN.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              triggerNotification('Bordereau de versement au Trésorier Payeur Général préparé avec succès.', 'success');
            }}
            className="bg-[#022448] hover:bg-[#033468] text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow transition"
          >
            <Printer className="w-3.5 h-3.5 text-amber-300" />
            <span>Bordereau Versement Trésor</span>
          </button>
        </div>
      </div>

      {/* Split & Financial Balances */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {/* Total Encaissement */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Total Recettes Encaissées</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl sm:text-3xl font-black text-[#022448] font-mono-ref">
              {stats.totalPaid.toLocaleString('fr-FR')}
            </span>
            <span className="text-xs font-bold text-slate-500">FCFA</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Sur un total exigible de {stats.totalDue.toLocaleString('fr-FR')} FCFA ({stats.recoveryRate}%)
          </p>
        </div>

        {/* Trésor Public 70% */}
        <div className="bg-emerald-50/60 p-5 rounded-xl border border-emerald-300 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-emerald-800 font-bold uppercase">Trésor Public (70%)</span>
            <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-1.5 py-0.5 rounded">
              Décret 2021-412
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl sm:text-3xl font-black text-[#006d2f] font-mono-ref">
              {stats.shareTresor.toLocaleString('fr-FR')}
            </span>
            <span className="text-xs font-bold text-emerald-800">FCFA</span>
          </div>
          <p className="text-[11px] text-emerald-800 mt-2">
            Reversé au Trésorier Payeur Général de Pointe-Noire
          </p>
        </div>

        {/* Régie DDL-PN 30% */}
        <div className="bg-blue-50/60 p-5 rounded-xl border border-blue-300 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-blue-800 font-bold uppercase">Régie Fonctionnement (30%)</span>
            <span className="text-[10px] bg-blue-200 text-blue-900 font-bold px-1.5 py-0.5 rounded">
              DDL-PN
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl sm:text-3xl font-black text-blue-900 font-mono-ref">
              {stats.shareRegie.toLocaleString('fr-FR')}
            </span>
            <span className="text-xs font-bold text-blue-800">FCFA</span>
          </div>
          <p className="text-[11px] text-blue-800 mt-2">
            Carburant brigade SAA, fournitures et missions in situ
          </p>
        </div>
      </div>

      {/* Breakdown by Payment Channel */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-xs">
        <h3 className="font-bold text-slate-800 mb-3 text-sm">Répartition par Canal de Paiement</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(methodBreakdown).map(([method, total]) => (
            <div key={method} className="bg-slate-50 p-3 rounded-lg border">
              <span className="text-[10px] text-slate-500 block truncate">{method}</span>
              <span className="font-mono-ref font-extrabold text-slate-900 text-sm mt-0.5 block">
                {total.toLocaleString('fr-FR')} F
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold">
                {stats.totalPaid > 0 ? ((total / stats.totalPaid) * 100).toFixed(1) : 0}% du volume
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Grand-Livre des Quittances Encaissées</h3>
            <p className="text-xs text-slate-500">Journal chronologique des écritures de régie</p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterMethod}
              onChange={e => setFilterMethod(e.target.value)}
              className="py-1 px-2 border rounded text-xs bg-slate-50"
            >
              <option value="ALL">Tous les modes de paiement</option>
              <option value="MTN Mobile Money">MTN Mobile Money</option>
              <option value="Airtel Money">Airtel Money</option>
              <option value="Espèces (Régie)">Espèces (Régie)</option>
              <option value="Virement Trésor Public">Virement Trésor Public</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#022448] text-white uppercase text-[10px] font-bold">
              <tr>
                <th className="py-2.5 px-3">Réf Quittance</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Établissement & Promoteur</th>
                <th className="py-2.5 px-3">Canal</th>
                <th className="py-2.5 px-3">Montant Encaissé</th>
                <th className="py-2.5 px-3">Part Trésor (70%)</th>
                <th className="py-2.5 px-3">Part Régie (30%)</th>
                <th className="py-2.5 px-3 text-right">Ticket</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono-ref">
              {filteredPayments.slice(0, 25).map(p => {
                const tresor = Math.round(p.amount_paid * 0.7);
                const regie = p.amount_paid - tresor;
                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3 font-bold text-[#022448]">{p.receipt_reference}</td>
                    <td className="py-2.5 px-3 text-slate-500">{p.record_date}</td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className="font-bold text-slate-800 block">{p.establishment_name}</span>
                      <span className="text-[10px] text-slate-500">{p.promoter_name}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-sans font-medium">
                        {p.payment_method}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-emerald-800">
                      {p.amount_paid.toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="py-2.5 px-3 text-blue-900">{tresor.toLocaleString('fr-FR')} F</td>
                    <td className="py-2.5 px-3 text-slate-700">{regie.toLocaleString('fr-FR')} F</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => {
                          setPrintDoc({
                            isOpen: true,
                            type: 'TICKET_58MM',
                            title: `Ticket - ${p.receipt_reference}`,
                            data: p
                          });
                        }}
                        className="p-1 hover:bg-slate-200 rounded text-slate-600 transition"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Thermal Ticket Modal */}
      <PrintModal
        isOpen={printDoc.isOpen}
        onClose={() => setPrintDoc(prev => ({ ...prev, isOpen: false }))}
        documentType="TICKET_58MM"
        title={printDoc.title}
        data={printDoc.data}
      />
    </div>
  );
};

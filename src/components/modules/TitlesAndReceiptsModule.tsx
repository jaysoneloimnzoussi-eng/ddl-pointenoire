import React, { useState } from 'react';
import {
  Receipt,
  Printer,
  Search,
  Building2,
  FileCheck2,
  QrCode,
  Smartphone,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { useSession } from '../../context/SessionContext';
import { TerrainPaymentRecord, Establishment } from '../../types';
import { PrintModal, PrintDocumentType } from '../print/PrintModal';

export const TitlesAndReceiptsModule: React.FC = () => {
  const { currentUser } = useSession();
  const [searchTerm, setSearchTerm] = useState('');
  const payments = storageService.getPayments();
  const establishments = storageService.getEstablishments();

  // Print modal
  const [printDoc, setPrintDoc] = useState<{
    isOpen: boolean;
    type: PrintDocumentType;
    title: string;
    data: any;
  }>({
    isOpen: false,
    type: 'ATTESTATION_A4',
    title: '',
    data: null
  });

  const filtered = payments.filter(p => {
    return (
      p.receipt_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.establishment_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.promoter_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handlePrint = (record: TerrainPaymentRecord, format: 'A4' | '58MM') => {
    const est = establishments.find(e => e.id === record.establishment_id);
    const docType: PrintDocumentType = format === 'A4' ? 'ATTESTATION_A4' : 'TICKET_58MM';

    setPrintDoc({
      isOpen: true,
      type: docType,
      title: format === 'A4' ? `Attestation A4 - ${record.establishment_name}` : `Ticket 58mm - ${record.receipt_reference}`,
      data: {
        ...record,
        ...est,
        receipt_reference: record.receipt_reference,
        amount_paid: record.amount_paid,
        total_fee: record.total_fee,
        balance_remaining: record.balance_remaining
      }
    });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-emerald-100 text-[#006d2f] font-bold px-2 py-0.5 rounded font-mono-ref">
              DÉLIVRANCE IMMÉDIATE
            </span>
            <span className="text-xs text-slate-500">Sécurisé par QR Code</span>
          </div>
          <h2 className="text-base sm:text-lg font-black text-[#022448] tracking-tight mt-1 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#006d2f]" />
            <span>Gestionnaire des Titres, Attestations Provisoires & Quittances</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Délivrance immédiate en double format : Titre officiel A4 républicain ou Ticket thermique POS 58mm / 80mm de terrain.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Rechercher quittance ou établissement..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#006d2f]"
          />
        </div>
      </div>

      {/* Cards of Receipts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(record => (
          <div
            key={record.id}
            className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between border-b pb-2 mb-2">
                <span className="font-mono-ref font-bold text-xs text-[#022448]">
                  {record.receipt_reference}
                </span>
                <span className="text-[10px] text-slate-500 font-mono-ref">
                  {record.record_date}
                </span>
              </div>

              <h3 className="font-extrabold text-sm text-slate-900 uppercase">
                {record.establishment_name}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Promoteur : <span className="font-semibold">{record.promoter_name}</span>
              </p>
              <p className="text-[11px] text-slate-500">{record.arrondissement}</p>

              <div className="bg-slate-50 p-3 rounded-lg border my-3 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Encaissé (Acompte) :</span>
                  <span className="font-mono-ref font-bold text-emerald-800">
                    {record.amount_paid.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Mode :</span>
                  <span>{record.payment_method}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Agent SAA :</span>
                  <span>{record.collected_by}</span>
                </div>
              </div>
            </div>

            {/* Actions: Double print format */}
            <div className="pt-2 border-t flex items-center justify-between gap-2">
              <button
                onClick={() => handlePrint(record, '58MM')}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Ticket 58mm</span>
              </button>

              <button
                onClick={() => handlePrint(record, 'A4')}
                className="flex-1 bg-[#006d2f] hover:bg-[#005a26] text-white text-xs font-bold py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 shadow transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Attestation A4</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Global Print Modal */}
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

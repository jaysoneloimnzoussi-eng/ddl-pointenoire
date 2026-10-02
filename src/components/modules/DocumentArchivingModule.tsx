import React, { useState, useMemo, useEffect } from 'react';
import {
  Archive,
  Search,
  Filter,
  FileText,
  Download,
  Printer,
  Eye,
  Plus,
  X,
  CheckCircle2,
  Calendar,
  Building2,
  Shield,
  Layers,
  FileCheck2,
  Receipt,
  FileBarChart,
  Award,
  Clock,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { useSession } from '../../context/SessionContext';
import { OfficialLegalAct, TerrainPaymentRecord, Establishment, SpaHonorDiploma } from '../../types';
import { PrintModal, PrintDocumentType } from '../print/PrintModal';

export interface ArchivedDocumentItem {
  id: string;
  coteArchive: string; // e.g. "ARCH-2026-SAA-042"
  title: string;
  service: 'SAFM' | 'SAA' | 'SAF' | 'SSID' | 'SPA' | 'DIRECTION';
  category: 'ACTE_JURIDIQUE' | 'FINANCE_REGIE' | 'DOSSIER_ETABLISSEMENT' | 'RAPPORT_OFFICIEL' | 'LABEL_DIPLOME';
  dateEmission: string;
  dateArchivage: string;
  beneficiaireOuEtab: string;
  signataire: string;
  statut: 'ARCHIVE_DEFINITIVE' | 'CLASSE_ACTIF' | 'COMMUNICATION_RESTREINTE';
  tailleKo: number;
  tags: string[];
  referenceOrigine?: string;
  originalPayload?: any;
}

export const DocumentArchivingModule: React.FC = () => {
  const { currentUser, triggerNotification } = useSession();

  const establishments = storageService.getEstablishments();
  const acts = storageService.getActs();
  const payments = storageService.getPayments();
  const diplomas = storageService.getDiplomas();

  // Local state for dynamically archived documents
  const [customArchives, setCustomArchives] = useState<ArchivedDocumentItem[]>(() => {
    const saved = localStorage.getItem('ddl_pn_custom_archives_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedYear, setSelectedYear] = useState<string>('2026');

  // Preview modal for single document
  const [previewItem, setPreviewItem] = useState<ArchivedDocumentItem | null>(null);

  // Print modal for official printable generation
  const [printDoc, setPrintDoc] = useState<{
    isOpen: boolean;
    type: PrintDocumentType;
    title: string;
    data: any;
  }>({
    isOpen: false,
    type: 'ACTE_JURIDIQUE_A4',
    title: '',
    data: null
  });

  // Modal to archive a new document
  const [isAddArchiveOpen, setIsAddArchiveOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newService, setNewService] = useState<ArchivedDocumentItem['service']>('SAA');
  const [newCategory, setNewCategory] = useState<ArchivedDocumentItem['category']>('ACTE_JURIDIQUE');
  const [newTarget, setNewTarget] = useState(establishments[0]?.name || '');
  const [newSignataire, setNewSignataire] = useState('Jean Richard NTSEKE NGOUAKA');
  const [newRef, setNewRef] = useState('');
  const [newTags, setNewTags] = useState('Régularisation, SAA 2026');

  // Compile all system documents into the central archive ledger
  const allArchivedDocuments = useMemo<ArchivedDocumentItem[]>(() => {
    const list: ArchivedDocumentItem[] = [];

    // 1. Legal Acts from SAA
    acts.forEach((act, idx) => {
      list.push({
        id: `ARCH-ACT-${act.id}`,
        coteArchive: `ARCH-DDLPN-${act.date_emission.slice(0, 4)}-SAA-${String(idx + 1).padStart(3, '0')}`,
        title: `${act.type.replace(/_/g, ' ')} : ${act.establishment_name}`,
        service: 'SAA',
        category: 'ACTE_JURIDIQUE',
        dateEmission: act.date_emission,
        dateArchivage: act.date_emission,
        beneficiaireOuEtab: `${act.establishment_name} (${act.promoter_name})`,
        signataire: act.signataire_nom || 'Directeur Départemental',
        statut: 'ARCHIVE_DEFINITIVE',
        tailleKo: 185,
        tags: [act.type, 'Contrôle SAA', act.arrondissement],
        referenceOrigine: act.reference_number,
        originalPayload: act
      });
    });

    // 2. Financial payment records & receipts from SAF
    payments.forEach((p, idx) => {
      list.push({
        id: `ARCH-PAY-${p.id}`,
        coteArchive: `ARCH-DDLPN-${(p.record_date || '2026').slice(0, 4)}-SAF-${String(idx + 1).padStart(3, '0')}`,
        title: `Quittance Régie SAA N° ${p.receipt_reference} (${p.amount_paid.toLocaleString('fr-FR')} FCFA)`,
        service: 'SAF',
        category: 'FINANCE_REGIE',
        dateEmission: p.record_date || '2026-09-07',
        dateArchivage: p.record_date || '2026-09-07',
        beneficiaireOuEtab: `${p.establishment_name} (${p.promoter_name})`,
        signataire: p.collected_by || 'Régisseur SAF',
        statut: 'CLASSE_ACTIF',
        tailleKo: 92,
        tags: ['Quittance', p.payment_method, 'Ventilation 70/30'],
        referenceOrigine: p.receipt_reference,
        originalPayload: p
      });
    });

    // 3. Establishment technical files & uploaded certificates
    establishments.forEach((est, idx) => {
      list.push({
        id: `ARCH-EST-${est.id}`,
        coteArchive: `ARCH-DDLPN-${(est.identified_date || '2026').slice(0, 4)}-DOSSIER-${String(idx + 1).padStart(3, '0')}`,
        title: `Dossier Technique d'Agrément : « ${est.name} »`,
        service: 'SAA',
        category: 'DOSSIER_ETABLISSEMENT',
        dateEmission: est.identified_date || '2026-09-01',
        dateArchivage: est.created_at ? est.created_at.split('T')[0] : '2026-09-01',
        beneficiaireOuEtab: `${est.name} • ${est.promoter_name}`,
        signataire: 'Inspecteur SAA & Régisseur',
        statut: est.status === 'autorise_dgl' ? 'ARCHIVE_DEFINITIVE' : 'CLASSE_ACTIF',
        tailleKo: 340,
        tags: [est.regime_type, est.activity_type, est.arrondissement],
        referenceOrigine: est.id,
        originalPayload: est
      });
    });

    // 4. Official Quarterly Reports from DDL-PN / Direction
    const officialReports = [
      {
        id: 'ARCH-RAP-T3-2026',
        cote: 'ARCH-DDLPN-2026-DIR-003',
        title: "Rapport d'Activités du Troisième Trimestre 2026 (Juillet – Septembre 2026)",
        date: '2026-09-30',
        signataire: 'Jean Richard NTSEKE NGOUAKA, Directeur Départemental',
        taille: 480,
        ref: 'N°______/MICTAL/DGL/DPN/DDL-PN'
      },
      {
        id: 'ARCH-RAP-T2-2026',
        cote: 'ARCH-DDLPN-2026-DIR-002',
        title: "Rapport d'Activités du Deuxième Trimestre 2026 (Avril – Juin 2026)",
        date: '2026-06-30',
        signataire: 'Jean Richard NTSEKE NGOUAKA, Directeur Départemental',
        taille: 450,
        ref: 'N°044/MICTAL/DGL/DPN/DDL-PN'
      },
      {
        id: 'ARCH-RAP-STAT-V2',
        cote: 'ARCH-DDLPN-2026-SSID-001',
        title: "Rapport d'Enquête Statistique Départementale Consolidée (Version V2 - 512 Répondants)",
        date: '2026-05-15',
        signataire: 'Chef du Service des Statistiques (SSID)',
        taille: 890,
        ref: 'RAP-ENQ-STAT-V2-DDLPN'
      },
      {
        id: 'ARCH-FICHE-MANQUES',
        cote: 'ARCH-DDLPN-2026-DIR-001',
        title: "Fiche Technique Exhaustive des Manques et Besoins DDL-PN (Remise Ministérielle)",
        date: '2026-06-17',
        signataire: 'Direction Départementale des Loisirs de Pointe-Noire',
        taille: 310,
        ref: 'FT-MANQUES-MCAPNIT-2026'
      }
    ];

    officialReports.forEach(r => {
      list.push({
        id: r.id,
        coteArchive: r.cote,
        title: r.title,
        service: r.id.includes('SSID') ? 'SSID' : 'DIRECTION',
        category: 'RAPPORT_OFFICIEL',
        dateEmission: r.date,
        dateArchivage: r.date,
        beneficiaireOuEtab: 'Direction Générale des Loisirs (DGL) / MICTAL',
        signataire: r.signataire,
        statut: 'ARCHIVE_DEFINITIVE',
        tailleKo: r.taille,
        tags: ['Rapport Officiel', 'PTA 2026', 'Pointe-Noire'],
        referenceOrigine: r.ref
      });
    });

    // 5. Diplomas & SPA promotion acts
    diplomas.forEach((d, idx) => {
      list.push({
        id: `ARCH-DIP-${d.id}`,
        coteArchive: `ARCH-DDLPN-2026-SPA-${String(idx + 1).padStart(3, '0')}`,
        title: `${d.label} : « ${d.establishment_name} »`,
        service: 'SPA',
        category: 'LABEL_DIPLOME',
        dateEmission: d.award_date,
        dateArchivage: d.award_date,
        beneficiaireOuEtab: `${d.establishment_name} (${d.promoter_name})`,
        signataire: 'Jean Richard NTSEKE NGOUAKA',
        statut: 'ARCHIVE_DEFINITIVE',
        tailleKo: 215,
        tags: ['Diplôme d\'Honneur', 'Loisirs Sains', 'Charte Acoustique'],
        referenceOrigine: d.reference_number,
        originalPayload: d
      });
    });

    // 6. Custom archives added by the user
    list.unshift(...customArchives);

    return list;
  }, [acts, payments, establishments, diplomas, customArchives]);

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    return allArchivedDocuments.filter(doc => {
      const matchSearch =
        searchQuery.trim() === '' ||
        doc.coteArchive.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.beneficiaireOuEtab.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.referenceOrigine && doc.referenceOrigine.toLowerCase().includes(searchQuery.toLowerCase())) ||
        doc.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchService = selectedService === 'ALL' || doc.service === selectedService;
      const matchCat = selectedCategory === 'ALL' || doc.category === selectedCategory;
      const matchYear = selectedYear === 'ALL' || doc.dateEmission.startsWith(selectedYear);

      return matchSearch && matchService && matchCat && matchYear;
    });
  }, [allArchivedDocuments, searchQuery, selectedService, selectedCategory, selectedYear]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: allArchivedDocuments.length,
      saa: allArchivedDocuments.filter(d => d.service === 'SAA').length,
      saf: allArchivedDocuments.filter(d => d.service === 'SAF').length,
      direction: allArchivedDocuments.filter(d => d.service === 'DIRECTION' || d.service === 'SAFM').length,
      spa: allArchivedDocuments.filter(d => d.service === 'SPA').length,
      ssid: allArchivedDocuments.filter(d => d.service === 'SSID').length,
    };
  }, [allArchivedDocuments]);

  // Listen to Escape key for modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (previewItem) setPreviewItem(null);
        if (isAddArchiveOpen) setIsAddArchiveOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewItem, isAddArchiveOpen]);

  // Handle Add custom archive
  const handleSaveArchive = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const newArch: ArchivedDocumentItem = {
      id: `ARCH-CUSTOM-${Date.now()}`,
      coteArchive: `ARCH-DDLPN-2026-${newService}-${String(customArchives.length + 101).padStart(3, '0')}`,
      title: newTitle.trim(),
      service: newService,
      category: newCategory,
      dateEmission: todayStr,
      dateArchivage: todayStr,
      beneficiaireOuEtab: newTarget || 'Direction Départementale des Loisirs',
      signataire: newSignataire,
      statut: 'CLASSE_ACTIF',
      tailleKo: Math.round(150 + Math.random() * 450),
      tags: newTags.split(',').map(t => t.trim()).filter(Boolean),
      referenceOrigine: newRef || `NOTE-INT-${Date.now().toString().slice(-6)}`
    };

    const updated = [newArch, ...customArchives];
    setCustomArchives(updated);
    localStorage.setItem('ddl_pn_custom_archives_v1', JSON.stringify(updated));
    setIsAddArchiveOpen(false);
    setNewTitle('');
    setNewRef('');
    triggerNotification(`Document "${newArch.title}" classé et numéroté dans les archives centrales !`, 'success');
  };

  // Open appropriate print/preview
  const handleOpenDocument = (doc: ArchivedDocumentItem) => {
    if (doc.category === 'ACTE_JURIDIQUE' && doc.originalPayload) {
      setPrintDoc({
        isOpen: true,
        type: 'ACTE_JURIDIQUE_A4',
        title: doc.title,
        data: doc.originalPayload
      });
    } else if (doc.category === 'FINANCE_REGIE' && doc.originalPayload) {
      setPrintDoc({
        isOpen: true,
        type: 'TICKET_58MM',
        title: doc.title,
        data: doc.originalPayload
      });
    } else if (doc.category === 'LABEL_DIPLOME' && doc.originalPayload) {
      setPrintDoc({
        isOpen: true,
        type: 'DIPLOME_HONNEUR_A4',
        title: doc.title,
        data: doc.originalPayload
      });
    } else {
      // Show rich in-app archive previewer
      setPreviewItem(doc);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-purple-100 text-purple-900 font-bold px-2 py-0.5 rounded font-mono-ref">
              MODULE 15 • GED RÉPUBLICAINE
            </span>
            <span className="text-xs text-slate-500">Service SAFM / Chrono & Archives DDL-PN</span>
          </div>
          <h2 className="text-base sm:text-lg font-black text-[#022448] tracking-tight mt-1 flex items-center gap-2 font-republic">
            <Archive className="w-5 h-5 text-purple-700" />
            <span>Archivage & Registre Central des Documents Officiels</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Conservation pérenne, numérotation de chrono et consultation de tous les actes, quittances, rapports trimestriels et dossiers promoteurs.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsAddArchiveOpen(true)}
            className="bg-[#006d2f] hover:bg-[#005a26] text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Verser une Pièce aux Archives</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase">Total Archives</span>
            <Layers className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-2xl font-black text-slate-900 font-mono-ref">{stats.total}</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Pièces cotées au chrono</span>
        </div>

        <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 shadow-xs">
          <div className="flex items-center justify-between text-emerald-800 mb-1">
            <span className="text-[10px] font-bold uppercase">Service SAA</span>
            <FileCheck2 className="w-4 h-4 text-[#006d2f]" />
          </div>
          <span className="text-2xl font-black text-[#006d2f] font-mono-ref">{stats.saa}</span>
          <span className="text-[10px] text-emerald-700 block mt-0.5">Actes & PV de contrôle</span>
        </div>

        <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200 shadow-xs">
          <div className="flex items-center justify-between text-blue-800 mb-1">
            <span className="text-[10px] font-bold uppercase">Régie & Finances</span>
            <Receipt className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-2xl font-black text-[#022448] font-mono-ref">{stats.saf}</span>
          <span className="text-[10px] text-blue-700 block mt-0.5">Quittances & bordereaux</span>
        </div>

        <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between text-amber-900 mb-1">
            <span className="text-[10px] font-bold uppercase">Direction & DGL</span>
            <FileBarChart className="w-4 h-4 text-amber-700" />
          </div>
          <span className="text-2xl font-black text-amber-950 font-mono-ref">{stats.direction}</span>
          <span className="text-[10px] text-amber-800 block mt-0.5">Rapports & fiches d'État</span>
        </div>

        <div className="bg-purple-50/60 p-4 rounded-xl border border-purple-200 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-purple-900 mb-1">
            <span className="text-[10px] font-bold uppercase">SPA & SSID</span>
            <Award className="w-4 h-4 text-purple-700" />
          </div>
          <span className="text-2xl font-black text-purple-950 font-mono-ref">{stats.spa + stats.ssid}</span>
          <span className="text-[10px] text-purple-800 block mt-0.5">Labels & statistiques V2</span>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Rechercher par cote d'archive, référence, nom d'établissement, promoteur ou mot-clé..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#022448]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Selectors */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Service filter */}
            <select
              value={selectedService}
              onChange={e => setSelectedService(e.target.value)}
              className="py-1.5 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 font-bold"
            >
              <option value="ALL">Tous les Services DDL</option>
              <option value="SAFM">SAFM (Admin & Matériel)</option>
              <option value="SAA">Service SAA (Assistance & Autorisation)</option>
              <option value="SAF">Service SAF (Finances & Régie)</option>
              <option value="SSID">Service SSID (Stats & Enquêtes)</option>
              <option value="SPA">Service SPA (Promotion & Labels)</option>
              <option value="DIRECTION">Cabinet Direction & DGL</option>
            </select>

            {/* Category filter */}
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="py-1.5 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 font-bold"
            >
              <option value="ALL">Toutes les Natures de Pièces</option>
              <option value="ACTE_JURIDIQUE">Actes Juridiques (Mises en demeure, Convocations)</option>
              <option value="FINANCE_REGIE">Finances & Quittances</option>
              <option value="DOSSIER_ETABLISSEMENT">Dossiers Techniques Promoteurs</option>
              <option value="RAPPORT_OFFICIEL">Rapports d'Activités Trimestriels</option>
              <option value="LABEL_DIPLOME">Labels & Diplômes d'Honneur</option>
            </select>

            {/* Year filter */}
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              className="py-1.5 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 font-bold"
            >
              <option value="ALL">Toutes Années</option>
              <option value="2026">Exercice 2026</option>
              <option value="2025">Exercice 2025</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
          <span>
            {filteredDocuments.length} document{filteredDocuments.length > 1 ? 's' : ''} répertorié{filteredDocuments.length > 1 ? 's' : ''} dans le registre officiel des archives
          </span>
          <span className="font-mono-ref">Répertoire central DDL-PN • Pointe-Noire</span>
        </div>
      </div>

      {/* Document Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#022448] text-white uppercase text-[10px] font-bold">
              <tr>
                <th className="py-3 px-3">Cote Archive</th>
                <th className="py-3 px-3">Intitulé du Document</th>
                <th className="py-3 px-3">Service</th>
                <th className="py-3 px-3">Établissement / Destinataire</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Statut</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Archive className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-bold">Aucun document archivé ne correspond aux critères de recherche.</p>
                    <p className="text-[11px] mt-1">Modifiez vos filtres ou réinitialisez la barre de recherche.</p>
                  </td>
                </tr>
              ) : (
                filteredDocuments.map(doc => {
                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/80 transition group">
                      {/* Cote */}
                      <td className="py-3 px-3 font-mono-ref font-bold text-[#022448]">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                          <span>{doc.coteArchive}</span>
                        </div>
                        {doc.referenceOrigine && (
                          <span className="text-[9.5px] text-slate-400 block font-normal mt-0.5">
                            Réf: {doc.referenceOrigine}
                          </span>
                        )}
                      </td>

                      {/* Title */}
                      <td className="py-3 px-3 max-w-xs">
                        <span className="font-bold text-slate-800 block line-clamp-1 group-hover:text-blue-900 transition">
                          {doc.title}
                        </span>
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          {doc.tags.slice(0, 3).map((tag, i) => (
                            <span
                              key={i}
                              className="text-[9.5px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono-ref"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Service */}
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono-ref ${
                            doc.service === 'SAA'
                              ? 'bg-emerald-100 text-emerald-800'
                              : doc.service === 'SAF'
                              ? 'bg-blue-100 text-blue-800'
                              : doc.service === 'DIRECTION'
                              ? 'bg-amber-100 text-amber-900'
                              : doc.service === 'SPA'
                              ? 'bg-purple-100 text-purple-900'
                              : doc.service === 'SSID'
                              ? 'bg-teal-100 text-teal-900'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {doc.service}
                        </span>
                      </td>

                      {/* Beneficiaire */}
                      <td className="py-3 px-3 text-slate-700">
                        <span className="font-semibold block truncate max-w-[200px]">
                          {doc.beneficiaireOuEtab}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          Signataire : {doc.signataire}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-3 font-mono-ref text-slate-500 whitespace-nowrap">
                        <span>{doc.dateEmission}</span>
                        <span className="text-[10px] text-slate-400 block">{doc.tailleKo} Ko</span>
                      </td>

                      {/* Statut */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3 text-[#006d2f]" />
                          <span>Classé conforme</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenDocument(doc)}
                            className="p-1.5 bg-slate-100 hover:bg-[#022448] hover:text-white text-slate-700 rounded-lg transition font-bold cursor-pointer"
                            title="Consulter et ouvrir l'aperçu du document officiel"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenDocument(doc)}
                            className="p-1.5 bg-slate-100 hover:bg-[#006d2f] hover:text-white text-slate-700 rounded-lg transition font-bold cursor-pointer"
                            title="Imprimer / Exporter A4"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          MODAL 1: RICH IN-APP DOCUMENT PREVIEWER (WITH DEDICATED CLOSE BUTTON)
         ========================================================================= */}
      {previewItem && (
        <div
          onClick={() => setPreviewItem(null)}
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 animate-in fade-in cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-300 cursor-default"
          >
            {/* Header */}
            <div className="bg-[#022448] text-white p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white font-republic">
                    Aperçu Officiel de la Pièce Archivée
                  </h3>
                  <p className="text-[10px] text-slate-300 font-mono-ref">
                    {previewItem.coteArchive} • {previewItem.service} DDL-PN
                  </p>
                </div>
              </div>

              {/* Working Close Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setPreviewItem(null);
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition cursor-pointer hover:scale-105 active:scale-95"
                title="Fermer l'aperçu du document officiel"
              >
                <X className="w-4 h-4" />
                <span>Fermer l'aperçu</span>
              </button>
            </div>

            {/* Document Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
              <div className="bg-white p-6 rounded-xl border border-slate-300 shadow-sm space-y-4 font-serif text-slate-800">
                <div className="border-b border-slate-300 pb-3 text-center">
                  <p className="text-xs uppercase font-bold text-slate-600">RÉPUBLIQUE DU CONGO</p>
                  <p className="text-[10px] italic text-slate-500">Unité • Travail • Progrès</p>
                  <p className="font-extrabold text-[#022448] text-xs uppercase mt-1">
                    Direction Départementale des Loisirs de Pointe-Noire (DDL-PN)
                  </p>
                  <p className="text-[10px] font-mono-ref text-slate-600 mt-0.5">
                    Service émetteur : {previewItem.service} • Cote d'archive : {previewItem.coteArchive}
                  </p>
                </div>

                <div className="text-center py-2">
                  <h4 className="text-base font-black text-[#022448] uppercase underline decoration-amber-500 underline-offset-4">
                    {previewItem.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Émis le {previewItem.dateEmission} • Classé le {previewItem.dateArchivage}
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs font-sans space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Établissement / Tiers :</span>
                      <span className="font-bold text-slate-800">{previewItem.beneficiaireOuEtab}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Signataire Officiel :</span>
                      <span className="font-bold text-slate-800">{previewItem.signataire}</span>
                    </div>
                  </div>

                  {previewItem.referenceOrigine && (
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Numéro de Référence d'Origine :</span>
                      <span className="font-mono-ref font-bold text-[#006d2f]">{previewItem.referenceOrigine}</span>
                    </div>
                  )}

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Mots-clés & Indexation :</span>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {previewItem.tags.map((t, idx) => (
                        <span key={idx} className="bg-white border px-1.5 py-0.5 rounded text-[10px] font-mono-ref">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-xs leading-relaxed text-justify text-slate-700 font-sans">
                  Le présent document constitue une reproduction certifiée conforme de la pièce originale cotée et classée au registre central des archives départementales sous l'autorité du Directeur Départemental des Loisirs de Pointe-Noire.
                </p>
              </div>
            </div>

            {/* Modal Bottom Footer with Close Button */}
            <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-500 font-mono-ref">
                Archive DDL-PN • {previewItem.tailleKo} Ko
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleOpenDocument(previewItem);
                    setPreviewItem(null);
                  }}
                  className="px-3 py-1.5 bg-[#006d2f] hover:bg-[#005a26] text-white font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimer Feuille A4</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setPreviewItem(null);
                  }}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-red-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                  title="Fermer l'aperçu du document officiel"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Fermer l'aperçu</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: ARCHIVER UNE NOUVELLE PIÈCE
         ========================================================================= */}
      {isAddArchiveOpen && (
        <div
          onClick={() => setIsAddArchiveOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 animate-in fade-in cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 cursor-default"
          >
            <div className="bg-[#022448] text-white p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Archive className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-sm text-white">Verser une Pièce aux Archives Départementales</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddArchiveOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveArchive} className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Intitulé officiel de la pièce *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="ex: PV de Contrôle In Situ - Discothèque Le Palmier"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Service Émetteur</label>
                  <select
                    value={newService}
                    onChange={e => setNewService(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                  >
                    <option value="SAA">Service Assistance et Autorisation (SAA)</option>
                    <option value="SAFM">Service SAFM (Admin & Matériel)</option>
                    <option value="SAF">Service SAF (Finances & Régie)</option>
                    <option value="SSID">Service SSID (Stats & SIG)</option>
                    <option value="SPA">Service SPA (Promotion)</option>
                    <option value="DIRECTION">Cabinet Direction / DGL</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nature de la Pièce</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                  >
                    <option value="ACTE_JURIDIQUE">Acte Juridique / Sanction</option>
                    <option value="FINANCE_REGIE">Quittance / Bordereau Financier</option>
                    <option value="DOSSIER_ETABLISSEMENT">Dossier Technique Promoteur</option>
                    <option value="RAPPORT_OFFICIEL">Rapport Administratif</option>
                    <option value="LABEL_DIPLOME">Label / Convention</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Établissement / Tiers</label>
                  <input
                    type="text"
                    value={newTarget}
                    onChange={e => setNewTarget(e.target.value)}
                    placeholder="Nom de l'établissement ou tiers"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Signataire Officiel</label>
                  <input
                    type="text"
                    value={newSignataire}
                    onChange={e => setNewSignataire(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Numéro de Référence d'Origine</label>
                <input
                  type="text"
                  value={newRef}
                  onChange={e => setNewRef(e.target.value)}
                  placeholder="ex: PV-088/DDL-PN/SAA-2026"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono-ref"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mots-clés (séparés par des virgules)</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={e => setNewTags(e.target.value)}
                  placeholder="Contrôle, Lumumba, Régularisation"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono-ref"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900">
                La cote d'archive sera automatiquement attribuée conformément au schéma républicain (ex: <code>ARCH-DDLPN-2026-{newService}-XXX</code>).
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddArchiveOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#006d2f] hover:bg-[#005a26] text-white font-bold rounded-lg cursor-pointer"
                >
                  Enregistrer aux Archives
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

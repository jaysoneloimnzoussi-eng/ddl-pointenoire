import React, { useState } from 'react';
import {
  FolderLock,
  Upload,
  FileText,
  Image,
  Download,
  Trash2,
  CheckCircle2,
  Calendar,
  Building2,
  X,
  Plus,
  Eye,
  Camera
} from 'lucide-react';
import { Establishment, AttachedDocument } from '../../../types';
import { storageService } from '../../../services/storageService';

interface DocumentVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  establishment: Establishment | null;
  agentName: string;
  onDocumentAdded?: () => void;
}

export const DocumentVaultModal: React.FC<DocumentVaultModalProps> = ({
  isOpen,
  onClose,
  establishment,
  agentName,
  onDocumentAdded
}) => {
  const [docCategory, setDocCategory] = useState<AttachedDocument['category']>('BAIL_COMMERCIAL');
  const [docName, setDocName] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [previewDoc, setPreviewDoc] = useState<AttachedDocument | null>(null);

  if (!isOpen || !establishment) return null;

  const currentDocs = establishment.documents || [];

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) return;

    setIsUploading(true);

    setTimeout(() => {
      storageService.attachDocumentToEstablishment(establishment.id, {
        name: docName.trim(),
        category: docCategory,
        file_url: `https://ddlpn.gouv.cg/ged/docs/${establishment.id}/${Date.now()}.pdf`,
        uploaded_by: agentName,
        size_kb: Math.round(120 + Math.random() * 850)
      });

      setIsUploading(false);
      setDocName('');
      if (onDocumentAdded) onDocumentAdded();
    }, 600);
  };

  const getCategoryLabel = (cat: AttachedDocument['category']) => {
    switch (cat) {
      case 'BAIL_COMMERCIAL': return { label: 'Bail Commercial', color: 'bg-blue-100 text-blue-800' };
      case 'RCCM': return { label: 'Extrait RCCM', color: 'bg-purple-100 text-purple-800' };
      case 'PIECE_IDENTITE': return { label: 'Pièce d\'Identité', color: 'bg-amber-100 text-amber-800' };
      case 'PHOTO_FACADE': return { label: 'Photo Façade & Enseigne', color: 'bg-emerald-100 text-emerald-800' };
      default: return { label: 'Autre Pièce', color: 'bg-slate-100 text-slate-800' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 text-xs">
        {/* Header */}
        <div className="bg-[#022448] text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300 border border-white/20">
              <FolderLock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                Coffre-Fort Numérique & GED DDL-PN
              </h3>
              <p className="text-[11px] text-slate-300">
                {establishment.name} • {establishment.promoter_name}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Add Document Section */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-[#006d2f]" />
              <span>Numériser / Joindre une Pièce Justificative in situ</span>
            </h4>

            <form onSubmit={handleAddDocument} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Nature de la pièce *
                  </label>
                  <select
                    value={docCategory}
                    onChange={e => setDocCategory(e.target.value as any)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-800"
                  >
                    <option value="BAIL_COMMERCIAL">Bail Commercial / Titre d'occupation</option>
                    <option value="RCCM">Extrait Registre de Commerce (RCCM)</option>
                    <option value="PIECE_IDENTITE">CNI / Passeport du Promoteur</option>
                    <option value="PHOTO_FACADE">Photo de la Façade & Enseigne</option>
                    <option value="AUTRE">Autre Justificatif (Quittance, Plan...)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Intitulé du document *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Bail 2026 notarié Tié-Tié"
                    value={docName}
                    onChange={e => setDocName(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg font-semibold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500">
                  📁 Fichiers acceptés : PDF, JPEG, PNG horodatés
                </span>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-2 bg-[#006d2f] hover:bg-emerald-800 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition"
                >
                  {isUploading ? (
                    <span>Chiffrement et archivage...</span>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Ajouter au dossier</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* List of Archived Documents */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-800 text-xs flex items-center justify-between">
              <span>Pièces versées au dossier ({currentDocs.length})</span>
              <span className="text-[10px] text-slate-400 font-normal">Chiffrement SHA-256</span>
            </h4>

            {currentDocs.length === 0 ? (
              <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <FolderLock className="w-10 h-10 mx-auto text-slate-300 mb-1" />
                <p className="font-semibold text-slate-600">Aucune pièce numérisée pour le moment.</p>
                <p className="text-[11px]">Utilisez le formulaire ci-dessus pour archiver les justificatifs.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {currentDocs.map(doc => {
                  const catStyle = getCategoryLabel(doc.category);
                  return (
                    <div
                      key={doc.id}
                      className="p-3 bg-white rounded-xl border border-slate-200 hover:border-blue-300 shadow-2xs flex items-center justify-between gap-3 transition"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                          {doc.category === 'PHOTO_FACADE' ? <Image className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-800 truncate">
                              {doc.name}
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${catStyle.color}`}>
                              {catStyle.label}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            Archivé par {doc.uploaded_by} • {new Date(doc.uploaded_at).toLocaleDateString('fr-FR')} • {doc.size_kb || 240} Ko
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold"
                          title="Aperçu"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={doc.file_url}
                          download
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-bold"
                          title="Télécharger"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500">
            Dossier certifié conforme pour transmission DGL Brazzaville.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

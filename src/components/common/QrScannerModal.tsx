import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Upload,
  X,
  Search,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  QrCode,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import jsQR from 'jsqr';
import { OfficialRepublicLogo, RepublicTricolorBar } from './OfficialSeal';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decodedResult: string) => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess
}) => {
  const [mode, setMode] = useState<'CAMERA' | 'FILE' | 'MANUAL'>('CAMERA');
  const [manualCode, setManualCode] = useState('');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  // Stop camera stream cleanly
  const stopCamera = () => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // Start camera and continuous QR code scan loop
  const startCamera = async () => {
    stopCamera();
    setCameraError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("L'accès à la caméra n'est pas pris en charge par ce navigateur.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setHasCameraPermission(true);
        scanFrame();
      }
    } catch (err: any) {
      console.warn('Camera error:', err);
      setHasCameraPermission(false);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Autorisation caméra refusée. Veuillez autoriser l’accès ou utiliser le téléversement d’image.'
          : err.message || 'Impossible d’accéder à la caméra.'
      );
      setMode('FILE');
    }
  };

  // Continuous frame analysis with jsQR
  const scanFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationFrameIdRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      animationFrameIdRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert'
    });

    if (code && code.data) {
      stopCamera();
      onScanSuccess(code.data);
      return;
    }

    animationFrameIdRef.current = requestAnimationFrame(scanFrame);
  };

  // Handle uploaded image file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    const reader = new FileReader();

    reader.onload = event => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code && code.data) {
          onScanSuccess(code.data);
        } else {
          setCameraError("Aucun QR Code valide détecté dans l'image sélectionnée. Veuillez essayer avec une autre photo plus nette.");
        }
      };
      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  };

  // Toggle camera direction (front / back)
  const toggleFacingMode = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  useEffect(() => {
    if (isOpen && mode === 'CAMERA') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, mode, facingMode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border-2 border-emerald-400 animate-in zoom-in-95">
        <RepublicTricolorBar className="h-2" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#006d2f] text-amber-300 flex items-center justify-center shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#022448] font-republic uppercase">
                Scanner Officiel DDL-PN
              </h3>
              <p className="text-[10px] text-slate-500 font-mono-ref">
                Vérificateur de Badges, Macarons & Quittances
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-3 border-b border-slate-200 text-xs font-bold text-center">
          <button
            type="button"
            onClick={() => setMode('CAMERA')}
            className={`py-2.5 flex items-center justify-center gap-1.5 transition cursor-pointer ${
              mode === 'CAMERA'
                ? 'border-b-2 border-[#006d2f] text-[#006d2f] bg-emerald-50/50'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Caméra</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('FILE')}
            className={`py-2.5 flex items-center justify-center gap-1.5 transition cursor-pointer ${
              mode === 'FILE'
                ? 'border-b-2 border-[#006d2f] text-[#006d2f] bg-emerald-50/50'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Photo / Fichier</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('MANUAL')}
            className={`py-2.5 flex items-center justify-center gap-1.5 transition cursor-pointer ${
              mode === 'MANUAL'
                ? 'border-b-2 border-[#006d2f] text-[#006d2f] bg-emerald-50/50'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Code Manuel</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-4">
          {cameraError && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{cameraError}</span>
            </div>
          )}

          {/* TAB 1: LIVE CAMERA SCAN */}
          {mode === 'CAMERA' && (
            <div className="space-y-3">
              <div className="relative aspect-square max-h-[300px] w-full bg-black rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Targeting Viewfinder Overlay */}
                <div className="absolute inset-8 border-2 border-emerald-400 rounded-2xl pointer-events-none shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-amber-400 rounded-tl-lg" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-amber-400 rounded-tr-lg" />
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-amber-400 rounded-bl-lg" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-amber-400 rounded-br-lg" />

                  {/* Scanning Laser Animation */}
                  <div className="w-full h-0.5 bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse relative top-1/2 -translate-y-1/2" />
                </div>

                <div className="absolute bottom-2 inset-x-0 text-center">
                  <span className="text-[10px] bg-black/70 text-white font-mono-ref px-3 py-1 rounded-full">
                    Pointez l'objectif vers le QR Code
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={toggleFacingMode}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Basculer Caméra (Avant/Arrière)</span>
                </button>
                <span className="text-[10px] text-slate-400 font-mono-ref">Scan automatique</span>
              </div>
            </div>
          )}

          {/* TAB 2: FILE / PHOTO UPLOAD */}
          {mode === 'FILE' && (
            <div className="space-y-3">
              <label className="border-2 border-dashed border-slate-300 hover:border-[#006d2f] rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer bg-slate-50 hover:bg-emerald-50/40 transition">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#006d2f] flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-slate-800">
                    Sélectionnez une photo ou capture d'écran
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    PNG, JPG, WebP contenant un QR Code officiel
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* TAB 3: MANUAL CODE ENTRY */}
          {mode === 'MANUAL' && (
            <form
              onSubmit={e => {
                e.preventDefault();
                if (manualCode.trim()) {
                  stopCamera();
                  onScanSuccess(manualCode.trim());
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  N° de Badge, Réf. Quittance ou Titre :
                </label>
                <input
                  type="text"
                  placeholder="Ex: SAA-PN-315 ou MCAPNIT-2026-0012"
                  value={manualCode}
                  onChange={e => setManualCode(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono-ref text-xs font-bold outline-none focus:ring-2 focus:ring-[#006d2f]"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={!manualCode.trim()}
                className="w-full py-2.5 bg-[#006d2f] hover:bg-[#005a26] disabled:bg-slate-300 text-white font-black text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                <span>Vérifier l'Authenticité dans le Registre</span>
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[10px] text-slate-500 font-mono-ref">
          Système Intégré de Régulation DDL-PN • Contrôle d'Authenticité Instantané
        </div>
      </div>
    </div>
  );
};

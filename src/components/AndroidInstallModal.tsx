import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  Download,
  QrCode,
  Check,
  Copy,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Package,
  Layers,
  HelpCircle,
  FileCode,
  CheckCircle2,
} from 'lucide-react';
import QRCode from 'qrcode';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface AndroidInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstalled, isAndroid, hasNativePrompt, install } = usePWAInstall();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [installSuccess, setInstallSuccess] = useState<boolean>(false);
  const [apkDownloaded, setApkDownloaded] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'download' | 'guide'>('download');

  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(window.location.href, {
        width: 260,
        margin: 2,
        color: {
          dark: '#1e293b',
          light: '#ffffff',
        },
      })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.warn('QR code generation failed:', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const res = await install();
    if (res === 'accepted') {
      setInstallSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1800);
    }
  };

  const handleDownloadApk = () => {
    // Trigger download of rosebloom-monthsary.apk
    const link = document.createElement('a');
    link.href = '/rosebloom-monthsary.apk';
    link.download = 'rosebloom-monthsary.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setApkDownloaded(true);
    setTimeout(() => setApkDownloaded(false), 4000);
  };

  const handleDownloadProjectZip = () => {
    // Trigger download of Android Studio source project zip
    const link = document.createElement('a');
    link.href = '/rosebloom-android-project.zip';
    link.download = 'rosebloom-android-project.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200 font-sans-custom">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-rose-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header with Android themed gradient badge */}
        <div className="p-6 pb-4 border-b border-stone-100 flex items-start justify-between bg-gradient-to-r from-emerald-50/70 via-rose-50/30 to-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-200/50 shrink-0">
              {/* Android Robot Icon SVG */}
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v6c0 .83.67 1.5 1.5 1.5S5 16.33 5 15.5v-6C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v6c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-6c0-.83-.67-1.5-1.5-1.5zm-4.97-4.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.62 2.24 12.83 2 12 2c-.83 0-1.62.24-2.64.63L7.88.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.3 1.3C6.46 3.32 5 5.48 5 8h14c0-2.52-1.46-4.68-3.47-5.84zM9 5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm6 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-bold text-stone-900">Download Android App</h3>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  v1.0.0 APK
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Install <span className="font-semibold text-rose-950 font-cormorant text-sm">Rosebloom Monthsary</span> on any Android phone
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center px-6 pt-3 border-b border-stone-100 bg-stone-50/50 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('download')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'download'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download &amp; Install</span>
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'guide'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Installation Guide</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {activeTab === 'download' && (
            <>
              {/* PRIMARY OPTION 1: Direct APK Download */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-rose-500/10 border-2 border-emerald-400/60 shadow-xs relative overflow-hidden">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Package className="w-4 h-4 text-emerald-700" />
                      <h4 className="text-sm font-bold text-stone-900">Direct Android APK Package</h4>
                      <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded">
                        Recommended
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 mt-1">
                      Download the standalone <code>.apk</code> installer file to install directly on your Android phone or tablet.
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row items-center gap-2.5">
                  <button
                    onClick={handleDownloadApk}
                    className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {apkDownloaded ? (
                      <>
                        <Check className="w-4 h-4 text-white" />
                        <span>Downloading APK... (47 KB)</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Download Rosebloom APK (.apk)</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDownloadProjectZip}
                    className="w-full sm:w-auto py-3 px-3.5 rounded-xl bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    title="Download complete Android Studio Project source code"
                  >
                    <FileCode className="w-3.5 h-3.5 text-stone-500" />
                    <span>Source .ZIP</span>
                  </button>
                </div>

                {apkDownloaded && (
                  <p className="text-[11px] text-emerald-700 font-medium mt-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Download started! Check your phone&apos;s Downloads folder.</span>
                  </p>
                )}
              </div>

              {/* OPTION 2: Instant 1-Click Install to Android Home Screen (WebAPK) */}
              {hasNativePrompt && !isInstalled && (
                <div className="p-4 rounded-2xl bg-white border border-teal-200 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-teal-600" />
                        <span>1-Click WebAPK Installation</span>
                      </h4>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Installs seamlessly into your Android app drawer without unknown source prompts.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleInstallClick}
                    className="mt-3 w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Install to Android Home Screen Now</span>
                  </button>
                </div>
              )}

              {installSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>App successfully installed to your device!</span>
                </div>
              )}

              {/* QR Code section for scanning from desktop */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 text-center">
                <span className="text-xs font-semibold text-stone-800 block mb-0.5">
                  Scan to Open &amp; Download on your Android Phone:
                </span>
                <p className="text-[11px] text-stone-500 mb-3">
                  Point your Android camera at the QR code to open the download page directly on mobile
                </p>

                <div className="inline-block p-2 bg-white rounded-xl shadow-xs border border-stone-200 mb-2.5">
                  {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="Scan to install on Android" className="w-36 h-36 mx-auto" />
                  ) : (
                    <div className="w-36 h-36 flex items-center justify-center text-stone-400 text-xs">
                      Generating QR...
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="px-3.5 py-1.5 rounded-lg bg-white border border-stone-300 hover:border-stone-400 text-stone-700 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-500" />}
                    <span>{copied ? 'Link Copied!' : 'Copy Mobile Download Link'}</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-4">
              {/* How to install the .apk */}
              <div>
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Installing the .APK File on Android:</span>
                </h4>

                <ol className="space-y-2 text-xs text-stone-600">
                  <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-50 border border-stone-200/60">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[11px] shrink-0">
                      1
                    </span>
                    <div>
                      <strong className="text-stone-900">Download the APK:</strong> Tap the &quot;Download Rosebloom APK&quot; button above. The file <code>rosebloom-monthsary.apk</code> will save to your device.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-50 border border-stone-200/60">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[11px] shrink-0">
                      2
                    </span>
                    <div>
                      <strong className="text-stone-900">Open Downloads:</strong> Swipe down from your notification shade or open your <strong>Files / Downloads</strong> app, then tap <code>rosebloom-monthsary.apk</code>.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-50 border border-stone-200/60">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[11px] shrink-0">
                      3
                    </span>
                    <div>
                      <strong className="text-stone-900">Allow Unknown Sources (if asked):</strong> Android will ask: &quot;For your security, your phone is not allowed to install unknown apps from this source&quot;. Tap <strong>Settings</strong> &rarr; enable <strong>&quot;Allow from this source&quot;</strong>.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-50 border border-stone-200/60">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[11px] shrink-0">
                      4
                    </span>
                    <div>
                      <strong className="text-stone-900">Tap Install:</strong> Return to the prompt and tap <strong>Install</strong>. Rosebloom will appear with its pink rose icon in your app drawer!
                    </div>
                  </li>
                </ol>
              </div>

              {/* Alternative Chrome 1-Click Method */}
              <div className="pt-2 border-t border-stone-100">
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-teal-600" />
                  <span>Alternative: Install with Chrome WebAPK</span>
                </h4>
                <p className="text-xs text-stone-600">
                  Open this link in <strong>Google Chrome</strong> or <strong>Samsung Internet</strong> on Android, tap the three dots (<strong>⋮</strong>) in the top-right corner, and tap <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong>. Chrome automatically creates a WebAPK without needing to enable unknown sources.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer info badge */}
        <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Standalone Android Package &amp; WebAPK</span>
          </div>
          <span className="text-[10px] text-stone-400">Offline &amp; Fullscreen Ready</span>
        </div>
      </div>
    </div>
  );
};

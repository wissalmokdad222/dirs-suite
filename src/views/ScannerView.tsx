import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Smartphone, Zap, Unlock, Lock, DownloadCloud } from 'lucide-react';
import { DeviceData, computeCategoryScores, computeGlobalScore, generateVulnerabilities } from '../engine/ScannerEngine';
import { useAuditStore } from '../hooks/useAuditStore';

const PROFILES: Record<string, Partial<DeviceData>> = {
  secure: {
    deviceName: 'Pixel 8 Pro',
    bootloaderLocked: true,
    rootAccess: false,
    encryptionEnabled: true,
  },
  rooted: {
    deviceName: 'OnePlus 9 (Modded)',
    bootloaderLocked: false,
    rootAccess: true,
    encryptionEnabled: true,
  }
};

const ScannerView: React.FC = () => {
  const { addAudit } = useAuditStore();
  const [data, setData] = useState<DeviceData>({
    deviceName: '',
    manufacturer: 'Generic',
    androidVersion: '14',
    securityPatch: '2024-03',
    // System (10)
    bootloaderLocked: true,
    verifiedBoot: true,
    dmVerity: true,
    developerOptions: false,
    usbDebugging: false,
    oemUnlockEnabled: false,
    mockLocations: false,
    sensitivePropsModified: false,
    partitionIntegrity: true,
    systemRWMounted: false,
    // Privilege (10)
    rootAccess: false,
    magisk: false,
    adbEnabled: false,
    suBinaryFound: false,
    busyboxFound: false,
    kingrootFound: false,
    xposedDetected: false,
    fridaDetected: false,
    superuserAppInstalled: false,
    debuggerAttached: false,
    // Network (8)
    vpnActive: false,
    dnsSecure: false,
    wifiSecurity: 'WPA3',
    proxyEnabled: false,
    bluetoothInsecure: false,
    nfcActive: false,
    hotspotActive: false,
    captivePortalDetected: false,
    // Crypto (8)
    encryptionEnabled: true,
    keystoreHardware: true,
    biometricStrong: true,
    screenLockStrong: true,
    storageIsolation: true,
    credentialStorageSecure: true,
    trustZoneActive: true,
    strongBoxEnabled: true,
    // Apps (6)
    unknownSources: false,
    playProtect: true,
    debuggableAppsFound: false,
    backupAllowed: false,
    systemAppModified: false,
    permissionsExcessive: false,
    // OS (3)
    patchLevelOutdated: false,
    kernelVersionInsecure: false,
    eolDevice: false,
    // Runtime (2)
    selinuxEnforcing: true,
    asrEnabled: true,

    networkMonitor: false,
    googleAccountLogin: true,
  });

  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleProfileClick = (profileKey: string) => {
    setData({ ...data, ...PROFILES[profileKey] });
  };

  const handleScan = () => {
    setIsScanning(true);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            const catScores = computeCategoryScores(data);
            const global = computeGlobalScore(catScores);
            const vulns = generateVulnerabilities(data);
            
            addAudit({
              id: `AUDIT-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
              date: new Date().toISOString(),
              deviceName: data.deviceName || 'Inconnu',
              data: { ...data },
              globalScore: global,
              categoryScores: catScores,
              vulns
            });
            
            setIsScanning(false);
            window.location.href = '/'; // Navigate back to see the history
          }, 500);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  return (
    <div className="fade-in max-w-4xl mx-auto">
      <header className="mb-12">
        <h1 className="text-4xl font-serif mb-3">Audit de Sécurité</h1>
        <p className="text-text-secondary">Configurez les paramètres physiques du terminal pour l'évaluation.</p>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <button onClick={() => handleProfileClick('secure')} className="card card-hover flex flex-col items-center gap-4 py-8">
          <Shield className="text-risk-safe" />
          <span className="font-semibold text-sm">Profil Sécurisé</span>
        </button>
        <button onClick={() => handleProfileClick('rooted')} className="card card-hover flex flex-col items-center gap-4 py-8">
          <Unlock className="text-risk-danger" />
          <span className="font-semibold text-sm">Profil Rooté</span>
        </button>
        {/* Placeholder for others */}
      </section>

      <div className="card p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="form-group">
            <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-3">Modèle du Terminal</label>
            <input 
              type="text" 
              className="w-full bg-beige-light border border-beige-dark rounded-xl px-5 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              value={data.deviceName}
              onChange={(e) => setData({...data, deviceName: e.target.value})}
              placeholder="ex: Google Pixel 8 Pro"
            />
          </div>
          <div className="form-group">
            <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-3">Version d'Android</label>
            <select 
              className="w-full bg-beige-light border border-beige-dark rounded-xl px-5 py-3 outline-none"
              value={data.androidVersion}
              onChange={(e) => setData({...data, androidVersion: e.target.value})}
            >
              <option value="14">Android 14 (U)</option>
              <option value="13">Android 13 (T)</option>
              <option value="12">Android 12 (S)</option>
            </select>
          </div>
        </div>

        <div className="space-y-6 pt-6 border-t border-beige-dark">
          <Toggle 
            label="Bootloader Verrouillé" 
            checked={data.bootloaderLocked} 
            onChange={(val) => setData({...data, bootloaderLocked: val})} 
          />
          <Toggle 
            label="Accès Privilèges Root" 
            checked={data.rootAccess} 
            onChange={(val) => setData({...data, rootAccess: val})} 
          />
          <Toggle 
            label="Chiffrement des Données" 
            checked={data.encryptionEnabled} 
            onChange={(val) => setData({...data, encryptionEnabled: val})} 
          />
        </div>

        <button 
          onClick={handleScan}
          disabled={isScanning}
          className="btn-primary w-full mt-12 py-5 text-lg shadow-xl shadow-primary/20 disabled:opacity-50"
        >
          {isScanning ? 'ANALYSE EN COURS...' : "LANCER L'AUDIT STRATÉGIQUE"}
        </button>
      </div>

      <AnimatePresence>
        {isScanning && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-beige-light/95 backdrop-blur-sm z-50 flex items-center justify-center p-10"
          >
            <div className="w-full max-w-lg text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="inline-block mb-10"
              >
                <Zap size={60} className="text-primary" />
              </motion.div>
              <h2 className="text-3xl font-serif mb-6">Analyse de Risque Critique...</h2>
              <div className="h-1 bg-beige-dark w-full rounded-full overflow-hidden mb-6">
                <motion.div 
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
              <div className="font-mono text-primary text-xl font-bold">{progress}%</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Toggle = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: (v: boolean) => void }) => (
  <div className="flex items-center justify-between py-2">
    <span className="font-medium text-text-secondary">{label}</span>
    <button 
      onClick={() => onChange(!checked)}
      className={`w-12 h-6 rounded-full transition-colors duration-200 relative ${checked ? 'bg-primary' : 'bg-beige-dark'}`}
    >
      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${checked ? 'translate-x-6' : ''}`} />
    </button>
  </div>
);

export default ScannerView;

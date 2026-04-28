export interface DeviceData {
  deviceName: string;
  manufacturer: string;
  androidVersion: string;
  securityPatch: string;
  bootloaderLocked: boolean;
  verifiedBoot: boolean;
  dmVerity: boolean;
  rootAccess: boolean;
  magisk: boolean;
  adbEnabled: boolean;
  developerOptions: boolean;
  encryptionEnabled: boolean;
  keystoreHardware: boolean;
  biometricStrong: boolean;
  unknownSources: boolean;
  playProtect: boolean;
  vpnActive: boolean;
  dnsSecure: boolean;
  wifiSecurity: 'WPA3' | 'WPA2' | 'WEP' | 'Open';
  selinuxEnforcing: boolean;
  asrEnabled: boolean;
  networkMonitor: boolean;
  googleAccountLogin: boolean;
}

export interface CategoryScore {
  id: string;
  name: string;
  icon: string;
  weight: number;
  score: number;
}

export interface Vulnerability {
  id: string;
  title: string;
  desc: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  cvss: string;
  owasp: string;
}

export const CATEGORIES = [
  { id: 'system',    name: 'Intégrité Système',         icon: 'shield',   weight: 0.20 },
  { id: 'privilege', name: 'Élévation de Privilèges',   icon: 'key',      weight: 0.20 },
  { id: 'network',   name: 'Sécurité Réseau',           icon: 'globe',    weight: 0.15 },
  { id: 'crypto',    name: 'Chiffrement & Données',     icon: 'lock',     weight: 0.15 },
  { id: 'apps',      name: 'Applications & Permissions',icon: 'smartphone',weight: 0.15 },
  { id: 'os',        name: 'Version & Patchs OS',       icon: 'settings', weight: 0.10 },
  { id: 'runtime',   name: 'Comportement Runtime',      icon: 'zap',      weight: 0.05 },
];

export const computeCategoryScores = (data: DeviceData) => {
  const scores: Record<string, number> = {};

  // 1. System Integrity
  let sys = 100;
  if (!data.bootloaderLocked) sys -= 40;
  if (!data.verifiedBoot) sys -= 30;
  if (!data.dmVerity) sys -= 20;
  if (data.developerOptions) sys -= 10;
  scores.system = Math.max(0, sys);

  // 2. Privilege
  let priv = 100;
  if (data.rootAccess) priv -= 50;
  if (data.magisk) priv -= 20;
  if (data.adbEnabled) priv -= 20;
  scores.privilege = Math.max(0, priv);

  // 3. Network
  let net = 100;
  if (!data.vpnActive) net -= 20;
  if (!data.dnsSecure) net -= 20;
  if (data.wifiSecurity === 'WPA2') net -= 10;
  if (data.wifiSecurity === 'WEP') net -= 40;
  if (data.wifiSecurity === 'Open') net -= 50;
  scores.network = Math.max(0, net);

  // 4. Crypto
  let crypto = 100;
  if (!data.encryptionEnabled) crypto -= 50;
  if (!data.keystoreHardware) crypto -= 25;
  if (!data.biometricStrong) crypto -= 15;
  scores.crypto = Math.max(0, crypto);

  // 5. Apps
  let apps = 100;
  if (data.unknownSources) apps -= 35;
  if (!data.playProtect) apps -= 35;
  scores.apps = Math.max(0, apps);

  // 6. OS
  const androidVer = parseInt(data.androidVersion, 10);
  let os = 100;
  if (androidVer < 11) os -= 40;
  else if (androidVer < 13) os -= 15;
  scores.os = Math.max(0, os);

  // 7. Runtime
  let rt = 100;
  if (!data.selinuxEnforcing) rt -= 60;
  if (!data.asrEnabled) rt -= 30;
  scores.runtime = Math.max(0, rt);

  return scores;
};

export const computeGlobalScore = (categoryScores: Record<string, number>) => {
  return Math.round(
    CATEGORIES.reduce((total, cat) => {
      return total + (categoryScores[cat.id] * cat.weight);
    }, 0)
  );
};

export const generateVulnerabilities = (data: DeviceData): Vulnerability[] => {
  const vulns: Vulnerability[] = [];
  if (data.rootAccess) vulns.push({ id: 'root', title: 'Accès Root Détecté', desc: 'L\'appareil est rooté.', severity: 'critical', category: 'Privilège', cvss: '9.8', owasp: 'M8' });
  if (!data.bootloaderLocked) vulns.push({ id: 'bootloader', title: 'Bootloader Déverrouillé', desc: 'Risque d\'OS malveillant.', severity: 'critical', category: 'Système', cvss: '9.1', owasp: 'M9' });
  if (!data.encryptionEnabled) vulns.push({ id: 'encryption', title: 'Chiffrement Désactivé', desc: 'Données exposées.', severity: 'critical', category: 'Crypto', cvss: '8.7', owasp: 'M9' });
  return vulns;
};

export interface DeviceData {
  deviceName: string;
  manufacturer: string;
  androidVersion: string;
  securityPatch: string;
  // System Integrity (10)
  bootloaderLocked: boolean;
  verifiedBoot: boolean;
  dmVerity: boolean;
  developerOptions: boolean;
  usbDebugging: boolean;
  oemUnlockEnabled: boolean;
  mockLocations: boolean;
  sensitivePropsModified: boolean;
  partitionIntegrity: boolean;
  systemRWMounted: boolean;
  // Privilege (10)
  rootAccess: boolean;
  magisk: boolean;
  adbEnabled: boolean;
  suBinaryFound: boolean;
  busyboxFound: boolean;
  kingrootFound: boolean;
  xposedDetected: boolean;
  fridaDetected: boolean;
  superuserAppInstalled: boolean;
  debuggerAttached: boolean;
  // Network (8)
  vpnActive: boolean;
  dnsSecure: boolean;
  wifiSecurity: 'WPA3' | 'WPA2' | 'WEP' | 'Open';
  proxyEnabled: boolean;
  bluetoothInsecure: boolean;
  nfcActive: boolean;
  hotspotActive: boolean;
  captivePortalDetected: boolean;
  // Crypto & Data (8)
  encryptionEnabled: boolean;
  keystoreHardware: boolean;
  biometricStrong: boolean;
  screenLockStrong: boolean;
  storageIsolation: boolean;
  credentialStorageSecure: boolean;
  trustZoneActive: boolean;
  strongBoxEnabled: boolean;
  // Apps & Permissions (6)
  unknownSources: boolean;
  playProtect: boolean;
  debuggableAppsFound: boolean;
  backupAllowed: boolean;
  systemAppModified: boolean;
  permissionsExcessive: boolean;
  // OS & Patch (3)
  patchLevelOutdated: boolean;
  kernelVersionInsecure: boolean;
  eolDevice: boolean;
  // Runtime (2)
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

/**
 * PHASE 1: AHP (Analytic Hierarchy Process)
 */
export const calculateAHP = (matrix: number[][]) => {
  const n = matrix.length;
  const colSums = matrix[0].map((_, j) => matrix.reduce((sum, row) => sum + row[j], 0));
  const normalized = matrix.map(row => row.map((v, j) => v / (colSums[j] || 1)));
  const weights = normalized.map(row => row.reduce((sum, v) => sum + v, 0) / n);
  const lambdaMax = matrix.map((row, i) => 
    row.reduce((sum, v, j) => sum + v * weights[j], 0) / weights[i]
  ).reduce((sum, v) => sum + v, 0) / n;
  const RI = [0, 0, 0.58, 0.90, 1.12, 1.24, 1.32, 1.41, 1.45];
  const CI = (lambdaMax - n) / (n - 1);
  const cr = CI / (RI[n] || 1.49);
  return { weights, cr: Number(cr.toFixed(4)), isConsistent: cr <= 0.10 };
};

/**
 * PHASE 2: TOPSIS
 */
export const scoreTOPSIS = (matrix: number[][], weights: number[], isBenefit: boolean[]) => {
  const n = weights.length;
  const norms = Array.from({ length: n }, (_, j) => Math.sqrt(matrix.reduce((sum, row) => sum + row[j] ** 2, 0)));
  const V = matrix.map(row => row.map((v, j) => (v / (norms[j] || 1)) * weights[j]));
  const pis = Array.from({ length: n }, (_, j) => isBenefit[j] ? Math.max(...V.map(r => r[j])) : Math.min(...V.map(r => r[j])));
  const nis = Array.from({ length: n }, (_, j) => isBenefit[j] ? Math.min(...V.map(r => r[j])) : Math.max(...V.map(r => r[j])));
  return V.map(row => {
    const dp = Math.sqrt(row.reduce((sum, v, j) => sum + (v - pis[j]) ** 2, 0));
    const dn = Math.sqrt(row.reduce((sum, v, j) => sum + (v - nis[j]) ** 2, 0));
    return Number((dn / (dp + dn) * 100).toFixed(2));
  });
};

export const computeCategoryScores = (data: DeviceData) => {
  const scores: Record<string, number> = {};

  // 1. System Integrity (10 indicators)
  let sys = 100;
  if (!data.bootloaderLocked) sys -= 20;
  if (!data.verifiedBoot) sys -= 15;
  if (!data.dmVerity) sys -= 15;
  if (data.developerOptions) sys -= 10;
  if (data.usbDebugging) sys -= 10;
  if (data.oemUnlockEnabled) sys -= 10;
  if (data.mockLocations) sys -= 5;
  if (data.sensitivePropsModified) sys -= 5;
  if (!data.partitionIntegrity) sys -= 5;
  if (data.systemRWMounted) sys -= 5;
  scores.system = Math.max(0, sys);

  // 2. Privilege (10 indicators)
  let priv = 100;
  if (data.rootAccess) priv -= 30;
  if (data.magisk) priv -= 10;
  if (data.suBinaryFound) priv -= 10;
  if (data.busyboxFound) priv -= 5;
  if (data.kingrootFound) priv -= 10;
  if (data.xposedDetected) priv -= 10;
  if (data.fridaDetected) priv -= 10;
  if (data.superuserAppInstalled) priv -= 5;
  if (data.adbEnabled) priv -= 5;
  if (data.debuggerAttached) priv -= 5;
  scores.privilege = Math.max(0, priv);

  // 3. Network (8 indicators)
  let net = 100;
  if (!data.vpnActive) net -= 15;
  if (!data.dnsSecure) net -= 15;
  if (data.wifiSecurity === 'WPA2') net -= 5;
  if (data.wifiSecurity === 'WEP') net -= 20;
  if (data.wifiSecurity === 'Open') net -= 25;
  if (data.proxyEnabled) net -= 10;
  if (data.bluetoothInsecure) net -= 5;
  if (data.hotspotActive) net -= 5;
  scores.network = Math.max(0, net);

  // 4. Crypto & Data (8 indicators)
  let crypto = 100;
  if (!data.encryptionEnabled) crypto -= 30;
  if (!data.keystoreHardware) crypto -= 15;
  if (!data.biometricStrong) crypto -= 10;
  if (!data.screenLockStrong) crypto -= 15;
  if (!data.storageIsolation) crypto -= 10;
  if (!data.trustZoneActive) crypto -= 10;
  if (!data.strongBoxEnabled) crypto -= 5;
  if (!data.credentialStorageSecure) crypto -= 5;
  scores.crypto = Math.max(0, crypto);

  // 5. Apps (6 indicators)
  let apps = 100;
  if (data.unknownSources) apps -= 25;
  if (!data.playProtect) apps -= 25;
  if (data.debuggableAppsFound) apps -= 15;
  if (data.backupAllowed) apps -= 15;
  if (data.systemAppModified) apps -= 10;
  if (data.permissionsExcessive) apps -= 10;
  scores.apps = Math.max(0, apps);

  // 6. OS & Patch (3 indicators)
  let os = 100;
  const androidVer = parseInt(data.androidVersion, 10);
  if (androidVer < 11) os -= 40;
  else if (androidVer < 13) os -= 15;
  if (data.patchLevelOutdated) os -= 30;
  if (data.eolDevice) os -= 15;
  scores.os = Math.max(0, os);

  // 7. Runtime (2 indicators)
  let rt = 100;
  if (!data.selinuxEnforcing) rt -= 70;
  if (!data.asrEnabled) rt -= 30;
  scores.runtime = Math.max(0, rt);

  return scores;
};

/**
 * Intégration TOPSIS pour le score global
 * Au lieu d'une simple moyenne, nous utilisons la proximité à l'idéal de sécurité.
 */
export const computeGlobalScore = (categoryScores: Record<string, number>) => {
  const criteriaValues = CATEGORIES.map(cat => categoryScores[cat.id]);
  const weights = CATEGORIES.map(cat => cat.weight);
  
  // Pour TOPSIS, nous considérons que des scores de catégories élevés sont bénéfiques (Benefit)
  const isBenefit = CATEGORIES.map(() => true);
  
  // Nous créons une matrice avec une seule alternative (l'appareil courant) 
  // et deux alternatives de référence (Pire cas : 0 partout, Meilleur cas : 100 partout)
  // pour permettre le calcul de distance TOPSIS.
  const matrix = [
    criteriaValues,            // L'appareil audité
    [0, 0, 0, 0, 0, 0, 0],    // Pire cas
    [100, 100, 100, 100, 100, 100, 100] // Meilleur cas
  ];
  
  const results = scoreTOPSIS(matrix, weights, isBenefit);
  return Math.round(results[0]); // On retourne le score de l'alternative 0 (notre appareil)
};

export const generateVulnerabilities = (data: DeviceData): Vulnerability[] => {
  const vulns: Vulnerability[] = [];
  if (data.rootAccess) vulns.push({ id: 'root', title: 'Accès Root Détecté', desc: 'L\'appareil est rooté.', severity: 'critical', category: 'Privilège', cvss: '9.8', owasp: 'M8' });
  if (!data.bootloaderLocked) vulns.push({ id: 'bootloader', title: 'Bootloader Déverrouillé', desc: 'Risque d\'OS malveillant.', severity: 'critical', category: 'Système', cvss: '9.1', owasp: 'M9' });
  if (!data.encryptionEnabled) vulns.push({ id: 'encryption', title: 'Chiffrement Désactivé', desc: 'Données exposées.', severity: 'critical', category: 'Crypto', cvss: '8.7', owasp: 'M9' });
  return vulns;
};

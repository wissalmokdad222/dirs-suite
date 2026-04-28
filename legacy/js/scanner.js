/**
 * scanner.js — Moteur de scoring et simulation d'analyse
 * Device Integrity Risk Scorer
 */

// ─── Catégories de sécurité ────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'system',    name: 'Intégrité Système',         icon: '🛡️',  weight: 0.20 },
  { id: 'privilege', name: 'Élévation de Privilèges',   icon: '🔑',  weight: 0.20 },
  { id: 'network',   name: 'Sécurité Réseau',           icon: '🌐',  weight: 0.15 },
  { id: 'crypto',    name: 'Chiffrement & Données',     icon: '🔒',  weight: 0.15 },
  { id: 'apps',      name: 'Applications & Permissions',icon: '📱',  weight: 0.15 },
  { id: 'os',        name: 'Version & Patchs OS',       icon: '⚙️',  weight: 0.10 },
  { id: 'runtime',   name: 'Comportement Runtime',      icon: '⚡',  weight: 0.05 },
];

// ─── Profils prédéfinis ────────────────────────────────────────────────────
const PROFILES = {
  secure: {
    name: 'Appareil Sécurisé',
    emoji: '🟢',
    risk: 'FAIBLE',
    data: {
      deviceName: 'Pixel 8 Pro',
      manufacturer: 'Google',
      androidVersion: '14',
      securityPatch: '2024-03',
      bootloaderLocked: true,
      verifiedBoot: true,
      dmVerity: true,
      rootAccess: false,
      magisk: false,
      adbEnabled: false,
      developerOptions: false,
      encryptionEnabled: true,
      keystoreHardware: true,
      biometricStrong: true,
      unknownSources: false,
      playProtect: true,
      vpnActive: true,
      dnsSecure: true,
      wifiSecurity: 'WPA3',
      selinuxEnforcing: true,
      asrEnabled: true,
      networkMonitor: false,
      googleAccountLogin: true,
    }
  },
  standard: {
    name: 'Appareil Standard',
    emoji: '🟡',
    risk: 'MODÉRÉ',
    data: {
      deviceName: 'Samsung Galaxy A54',
      manufacturer: 'Samsung',
      androidVersion: '13',
      securityPatch: '2023-09',
      bootloaderLocked: true,
      verifiedBoot: true,
      dmVerity: true,
      rootAccess: false,
      magisk: false,
      adbEnabled: true,
      developerOptions: true,
      encryptionEnabled: true,
      keystoreHardware: true,
      biometricStrong: false,
      unknownSources: true,
      playProtect: true,
      vpnActive: false,
      dnsSecure: false,
      wifiSecurity: 'WPA2',
      selinuxEnforcing: true,
      asrEnabled: true,
      networkMonitor: false,
      googleAccountLogin: true,
    }
  },
  rooted: {
    name: 'Appareil Rooté',
    emoji: '🟠',
    risk: 'ÉLEVÉ',
    data: {
      deviceName: 'OnePlus 9',
      manufacturer: 'OnePlus',
      androidVersion: '12',
      securityPatch: '2022-11',
      bootloaderLocked: false,
      verifiedBoot: false,
      dmVerity: false,
      rootAccess: true,
      magisk: true,
      adbEnabled: true,
      developerOptions: true,
      encryptionEnabled: false,
      keystoreHardware: false,
      biometricStrong: false,
      unknownSources: true,
      playProtect: false,
      vpnActive: false,
      dnsSecure: false,
      wifiSecurity: 'WPA2',
      selinuxEnforcing: false,
      asrEnabled: false,
      networkMonitor: true,
      googleAccountLogin: false,
    }
  },
  compromised: {
    name: 'Appareil Compromis',
    emoji: '🔴',
    risk: 'CRITIQUE',
    data: {
      deviceName: 'Inconnu',
      manufacturer: 'Generic',
      androidVersion: '10',
      securityPatch: '2021-06',
      bootloaderLocked: false,
      verifiedBoot: false,
      dmVerity: false,
      rootAccess: true,
      magisk: true,
      adbEnabled: true,
      developerOptions: true,
      encryptionEnabled: false,
      keystoreHardware: false,
      biometricStrong: false,
      unknownSources: true,
      playProtect: false,
      vpnActive: false,
      dnsSecure: false,
      wifiSecurity: 'WEP',
      selinuxEnforcing: false,
      asrEnabled: false,
      networkMonitor: true,
      googleAccountLogin: false,
    }
  }
};

// ─── Moteur de scoring ─────────────────────────────────────────────────────
function computeCategoryScores(data) {
  const scores = {};

  // 1. Intégrité Système (bootloader, verified boot, dm-verity)
  let sysScore = 100;
  if (!data.bootloaderLocked)  sysScore -= 40;
  if (!data.verifiedBoot)      sysScore -= 30;
  if (!data.dmVerity)          sysScore -= 20;
  if (data.developerOptions)   sysScore -= 10;
  scores.system = Math.max(0, sysScore);

  // 2. Élévation de Privilèges (root, magisk, adb)
  let privScore = 100;
  if (data.rootAccess)   privScore -= 50;
  if (data.magisk)       privScore -= 20;
  if (data.adbEnabled)   privScore -= 20;
  if (data.developerOptions && !data.adbEnabled) privScore -= 10;
  scores.privilege = Math.max(0, privScore);

  // 3. Sécurité Réseau
  let netScore = 100;
  if (!data.vpnActive)                      netScore -= 20;
  if (!data.dnsSecure)                      netScore -= 20;
  if (data.wifiSecurity === 'WPA2')         netScore -= 10;
  if (data.wifiSecurity === 'WEP')          netScore -= 40;
  if (data.wifiSecurity === 'Open')         netScore -= 50;
  if (data.networkMonitor)                  netScore -= 10;
  scores.network = Math.max(0, netScore);

  // 4. Chiffrement & Données
  let cryptoScore = 100;
  if (!data.encryptionEnabled)   cryptoScore -= 50;
  if (!data.keystoreHardware)    cryptoScore -= 25;
  if (!data.biometricStrong)     cryptoScore -= 15;
  scores.crypto = Math.max(0, cryptoScore);

  // 5. Applications & Permissions
  let appsScore = 100;
  if (data.unknownSources)   appsScore -= 35;
  if (!data.playProtect)     appsScore -= 35;
  if (!data.googleAccountLogin) appsScore -= 10;
  if (data.networkMonitor)   appsScore -= 20;
  scores.apps = Math.max(0, appsScore);

  // 6. Version OS & Patchs
  const androidVer  = parseInt(data.androidVersion, 10) || 0;
  const patchDate   = data.securityPatch || '2020-01';
  const [patchYear, patchMonth] = patchDate.split('-').map(Number);
  const now = new Date();
  const patchAgeMonths = (now.getFullYear() - patchYear) * 12 + (now.getMonth() + 1 - patchMonth);

  let osScore = 100;
  if (androidVer < 10)  osScore -= 50;
  else if (androidVer < 12) osScore -= 25;
  else if (androidVer < 13) osScore -= 10;
  if (patchAgeMonths > 24)  osScore -= 30;
  else if (patchAgeMonths > 12) osScore -= 20;
  else if (patchAgeMonths > 6)  osScore -= 10;
  scores.os = Math.max(0, osScore);

  // 7. Runtime (SELinux, ASLR)
  let rtScore = 100;
  if (!data.selinuxEnforcing) rtScore -= 60;
  if (!data.asrEnabled)       rtScore -= 30;
  scores.runtime = Math.max(0, rtScore);

  return scores;
}

function computeGlobalScore(categoryScores) {
  return Math.round(
    CATEGORIES.reduce((total, cat) => {
      return total + (categoryScores[cat.id] * cat.weight);
    }, 0)
  );
}

function getRiskLevel(score) {
  if (score >= 80) return { level: 'FAIBLE',    color: '#00FF94', cssClass: 'risk-low',      badgeClass: 'badge-safe' };
  if (score >= 60) return { level: 'MODÉRÉ',    color: '#FFB800', cssClass: 'risk-medium',   badgeClass: 'badge-medium' };
  if (score >= 40) return { level: 'ÉLEVÉ',     color: '#FF7A00', cssClass: 'risk-high',     badgeClass: 'badge-high' };
  return               { level: 'CRITIQUE',  color: '#FF3366', cssClass: 'risk-critical', badgeClass: 'badge-critical' };
}

function getCategoryColor(score) {
  if (score >= 80) return '#00FF94';
  if (score >= 60) return '#FFB800';
  if (score >= 40) return '#FF7A00';
  return '#FF3366';
}

// ─── Génération des vulnérabilités ─────────────────────────────────────────
function generateVulnerabilities(data, categoryScores) {
  const vulns = [];

  if (data.rootAccess) {
    vulns.push({
      title: 'Accès Root Détecté',
      desc: "L'appareil est rooté. Le modèle de sécurité Android est contourné, exposant les données système à toute application malveillante.",
      severity: 'critical',
      category: 'Élévation de Privilèges',
      cvss: '9.8',
      owasp: 'M8 - Security Misconfiguration',
    });
  }

  if (!data.bootloaderLocked) {
    vulns.push({
      title: 'Bootloader Déverrouillé',
      desc: "Le bootloader est déverrouillé, permettant le chargement de systèmes d'exploitation non vérifiés et des attaques Evil Maid.",
      severity: 'critical',
      category: 'Intégrité Système',
      cvss: '9.1',
      owasp: 'M9 - Insecure Data Storage',
    });
  }

  if (!data.encryptionEnabled) {
    vulns.push({
      title: 'Chiffrement Désactivé',
      desc: "Le chiffrement complet du disque est désactivé. Toutes les données utilisateur sont accessibles en cas de vol ou d'accès physique.",
      severity: 'critical',
      category: 'Chiffrement',
      cvss: '8.7',
      owasp: 'M9 - Insecure Data Storage',
    });
  }

  if (!data.selinuxEnforcing) {
    vulns.push({
      title: 'SELinux en Mode Permissif',
      desc: "SELinux n'est pas en mode Enforcing. Le contrôle d'accès mandatoire est inefficace, laissant les processus sans isolation.",
      severity: 'high',
      category: 'Runtime',
      cvss: '7.5',
      owasp: 'M1 - Improper Platform Usage',
    });
  }

  if (data.unknownSources) {
    vulns.push({
      title: 'Sources Inconnues Activées',
      desc: "L'installation d'APK depuis des sources inconnues est autorisée. Risque élevé d'installation de logiciels malveillants.",
      severity: 'high',
      category: 'Applications',
      cvss: '7.2',
      owasp: 'M8 - Security Misconfiguration',
    });
  }

  if (!data.playProtect) {
    vulns.push({
      title: 'Google Play Protect Désactivé',
      desc: "Le service de détection des applications malveillantes est inactif. Les malwares ne seront pas détectés sur l'appareil.",
      severity: 'high',
      category: 'Applications',
      cvss: '6.8',
      owasp: 'M8 - Security Misconfiguration',
    });
  }

  if (data.magisk) {
    vulns.push({
      title: 'Magisk Framework Détecté',
      desc: "Magisk est présent sur l'appareil, permettant le root systématique et le contournement des vérifications SafetyNet/Play Integrity.",
      severity: 'high',
      category: 'Élévation de Privilèges',
      cvss: '7.8',
      owasp: 'M8 - Security Misconfiguration',
    });
  }

  if (data.wifiSecurity === 'WEP') {
    vulns.push({
      title: 'Protocole WiFi WEP Déprécié',
      desc: "L'appareil est connecté à un réseau WiFi utilisant WEP, un protocole cryptographiquement cassé depuis 2001. Susceptible aux attaques MITM.",
      severity: 'high',
      category: 'Réseau',
      cvss: '7.4',
      owasp: 'M3 - Insecure Communication',
    });
  }

  if (data.adbEnabled) {
    vulns.push({
      title: 'Débogage ADB Activé',
      desc: "Le débogage Android Debug Bridge est actif. Un attaquant avec accès USB peut extraire des données, installer des apps ou escalader ses privilèges.",
      severity: 'medium',
      category: 'Configuration',
      cvss: '5.9',
      owasp: 'M1 - Improper Platform Usage',
    });
  }

  if (!data.dnsSecure) {
    vulns.push({
      title: 'DNS Non Sécurisé',
      desc: "L'appareil utilise un DNS en clair. Les requêtes DNS peuvent être interceptées, permettant le DNS spoofing et des redirections malveillantes.",
      severity: 'medium',
      category: 'Réseau',
      cvss: '5.3',
      owasp: 'M3 - Insecure Communication',
    });
  }

  if (!data.vpnActive) {
    vulns.push({
      title: 'Aucun VPN Actif',
      desc: "Le trafic réseau n'est pas chiffré de bout en bout par un VPN. Les communications peuvent être surveillées sur des réseaux non fiables.",
      severity: 'low',
      category: 'Réseau',
      cvss: '3.7',
      owasp: 'M3 - Insecure Communication',
    });
  }

  const patchDate = data.securityPatch || '2020-01';
  const [patchYear, patchMonth] = patchDate.split('-').map(Number);
  const now = new Date();
  const patchAgeMonths = (now.getFullYear() - patchYear) * 12 + (now.getMonth() + 1 - patchMonth);

  if (patchAgeMonths > 12) {
    vulns.push({
      title: `Correctifs de Sécurité Expirés (${patchAgeMonths} mois)`,
      desc: `Le dernier patch de sécurité date de ${patchAgeMonths} mois. De nombreuses CVEs Android connues ne sont pas corrigées sur cet appareil.`,
      severity: patchAgeMonths > 24 ? 'high' : 'medium',
      category: 'OS',
      cvss: patchAgeMonths > 24 ? '7.1' : '5.5',
      owasp: 'M8 - Security Misconfiguration',
    });
  }

  if (data.developerOptions && !data.rootAccess) {
    vulns.push({
      title: 'Options Développeur Activées',
      desc: "Les options développeur exposent des fonctionnalités potentiellement dangereuses comme l'USB debugging et le mock location.",
      severity: 'low',
      category: 'Configuration',
      cvss: '3.1',
      owasp: 'M1 - Improper Platform Usage',
    });
  }

  // Trier par CVSS décroissant
  return vulns.sort((a, b) => parseFloat(b.cvss) - parseFloat(a.cvss));
}

// ─── Génération des recommandations ────────────────────────────────────────
function generateRecommendations(data, categoryScores) {
  const recos = [];
  let priority = 1;

  if (data.rootAccess) {
    recos.push({
      priority: priority++,
      icon: '🔑',
      title: 'Supprimer le Root / Unroot',
      desc: "Effectuez un unroot complet et réinstallez le firmware officiel depuis le site du fabricant pour restaurer l'intégrité système.",
      impact: '+40pts score',
      color: '#FF3366',
      bg: 'rgba(255,51,102,0.1)',
    });
  }

  if (!data.bootloaderLocked) {
    recos.push({
      priority: priority++,
      icon: '🛡️',
      title: 'Re-verrouiller le Bootloader',
      desc: "Utilisez `fastboot flashing lock` après avoir réinstallé le firmware officiel pour activer Verified Boot.",
      impact: '+30pts score',
      color: '#FF3366',
      bg: 'rgba(255,51,102,0.1)',
    });
  }

  if (!data.encryptionEnabled) {
    recos.push({
      priority: priority++,
      icon: '🔒',
      title: 'Activer le Chiffrement Complet',
      desc: "Allez dans Paramètres → Sécurité → Chiffrement et activez le chiffrement complet du stockage (FDE/FBE).",
      impact: '+25pts score',
      color: '#FF7A00',
      bg: 'rgba(255,122,0,0.1)',
    });
  }

  if (!data.selinuxEnforcing) {
    recos.push({
      priority: priority++,
      icon: '⚡',
      title: 'Activer SELinux Enforcing',
      desc: "Réactivez SELinux en mode enforcing. Si un ROM custom est utilisé, choisissez une ROM qui maintient SELinux enforcing.",
      impact: '+20pts score',
      color: '#FF7A00',
      bg: 'rgba(255,122,0,0.1)',
    });
  }

  if (data.unknownSources) {
    recos.push({
      priority: priority++,
      icon: '📱',
      title: 'Désactiver les Sources Inconnues',
      desc: "Paramètres → Sécurité → Sources inconnues → Désactiver. N'installez que des APK depuis le Play Store ou sources vérifiées.",
      impact: '+15pts score',
      color: '#FFB800',
      bg: 'rgba(255,184,0,0.1)',
    });
  }

  if (!data.playProtect) {
    recos.push({
      priority: priority++,
      icon: '🛡️',
      title: 'Réactiver Google Play Protect',
      desc: "Play Store → Menu → Play Protect → Activer l'analyse des apps. Exécutez un scan complet immédiatement.",
      impact: '+12pts score',
      color: '#FFB800',
      bg: 'rgba(255,184,0,0.1)',
    });
  }

  if (data.adbEnabled) {
    recos.push({
      priority: priority++,
      icon: '🔌',
      title: 'Désactiver le Débogage USB',
      desc: "Options développeur → Débogage USB → Désactiver. Si les options développeur ne sont pas nécessaires, désactivez-les entièrement.",
      impact: '+8pts score',
      color: '#00D4FF',
      bg: 'rgba(0,212,255,0.08)',
    });
  }

  if (!data.dnsSecure) {
    recos.push({
      priority: priority++,
      icon: '🌐',
      title: 'Configurer DNS over HTTPS',
      desc: "Android 9+ : Paramètres → Réseau → DNS Privé → Entrez `dns.google` ou `1.1.1.1` pour activer DoH.",
      impact: '+8pts score',
      color: '#00D4FF',
      bg: 'rgba(0,212,255,0.08)',
    });
  }

  if (!data.vpnActive) {
    recos.push({
      priority: priority++,
      icon: '🔐',
      title: 'Utiliser un VPN de Confiance',
      desc: "Installez un VPN reconnu (Mullvad, ProtonVPN) et activez-le systématiquement sur les réseaux WiFi publics.",
      impact: '+5pts score',
      color: '#00FF94',
      bg: 'rgba(0,255,148,0.08)',
    });
  }

  const patchDate = data.securityPatch || '2020-01';
  const [patchYear, patchMonth] = patchDate.split('-').map(Number);
  const now = new Date();
  const patchAgeMonths = (now.getFullYear() - patchYear) * 12 + (now.getMonth() + 1 - patchMonth);
  if (patchAgeMonths > 6) {
    recos.push({
      priority: priority++,
      icon: '⚙️',
      title: 'Mettre à Jour le Système Android',
      desc: "Paramètres → Sécurité → Mise à jour de sécurité. Activez les mises à jour automatiques pour maintenir les patchs à jour.",
      impact: `+${Math.min(20, patchAgeMonths)}pts score`,
      color: '#00FF94',
      bg: 'rgba(0,255,148,0.08)',
    });
  }

  return recos;
}

// ─── Données de conformité OWASP MASVS / CIS ──────────────────────────────
function generateCompliance(data, score) {
  return [
    {
      standard: 'OWASP MASVS',
      control: 'MASVS-RESILIENCE-1',
      description: 'Protection contre le tampering',
      status: data.bootloaderLocked && data.verifiedBoot ? 'CONFORME' : 'NON-CONFORME',
    },
    {
      standard: 'OWASP MASVS',
      control: 'MASVS-RESILIENCE-2',
      description: "Détection d'émulateur/root",
      status: !data.rootAccess && data.selinuxEnforcing ? 'CONFORME' : 'NON-CONFORME',
    },
    {
      standard: 'OWASP MASVS',
      control: 'MASVS-STORAGE-1',
      description: 'Stockage sécurisé des données',
      status: data.encryptionEnabled && data.keystoreHardware ? 'CONFORME' : 'NON-CONFORME',
    },
    {
      standard: 'OWASP MASVS',
      control: 'MASVS-NETWORK-1',
      description: 'Communications réseau sécurisées',
      status: data.vpnActive && data.dnsSecure ? 'CONFORME' : 'PARTIEL',
    },
    {
      standard: 'CIS Android',
      control: 'CIS-AOS-1.1',
      description: 'Chiffrement du stockage activé',
      status: data.encryptionEnabled ? 'CONFORME' : 'NON-CONFORME',
    },
    {
      standard: 'CIS Android',
      control: 'CIS-AOS-2.3',
      description: 'Sources inconnues désactivées',
      status: !data.unknownSources ? 'CONFORME' : 'NON-CONFORME',
    },
    {
      standard: 'CIS Android',
      control: 'CIS-AOS-3.1',
      description: 'SELinux en mode enforcing',
      status: data.selinuxEnforcing ? 'CONFORME' : 'NON-CONFORME',
    },
    {
      standard: 'NIST SP 800-124',
      control: 'NIST-4.2',
      description: 'Intégrité du système vérifiée',
      status: data.verifiedBoot && data.dmVerity ? 'CONFORME' : 'NON-CONFORME',
    },
  ];
}

// ─── Export ────────────────────────────────────────────────────────────────
window.Scanner = {
  CATEGORIES,
  PROFILES,
  computeCategoryScores,
  computeGlobalScore,
  getRiskLevel,
  getCategoryColor,
  generateVulnerabilities,
  generateRecommendations,
  generateCompliance,
};

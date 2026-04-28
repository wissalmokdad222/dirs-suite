/**
 * engine.js — Moteur de sécurité DIRS Elite
 * Logique de scoring, CVE database, Compliance NIST/OWASP
 */
const Engine = (function() {

    const CVE_DATABASE = [
        { id: 'CVE-2023-40121', title: 'RCE in System Component',      severity: 'Critical', score: 9.8, category: 'System',    date: '2023-11' },
        { id: 'CVE-2023-21214', title: 'Privilege Escalation in Kernel', severity: 'High',     score: 8.8, category: 'Kernel',    date: '2023-10' },
        { id: 'CVE-2023-21145', title: 'Info Disclosure in Framework',  severity: 'Medium',   score: 6.5, category: 'Framework', date: '2023-09' },
        { id: 'CVE-2022-20421', title: 'Denial of Service in Radio',    severity: 'Low',      score: 3.5, category: 'Hardware',  date: '2022-06' },
        { id: 'CVE-2024-0012',  title: 'Sandbox Escape in Runtime',     severity: 'Critical', score: 9.1, category: 'Runtime',   date: '2024-01' },
        { id: 'CVE-2023-45781', title: 'TrustZone Data Access',         severity: 'High',     score: 8.2, category: 'TEE',       date: '2023-12' }
    ];

    const ACADEMY_ARTICLES = [
        { id: 'boot-1',   icon: 'lock',   title: 'Sécurité du Bootloader',  desc: 'Pourquoi le verrouillage est la clé de voûte du Verified Boot et de la chaîne de confiance.', content: 'Le bootloader est le premier programme qui s\'exécute au démarrage. S\'il est déverrouillé, n\'importe quel système d\'exploitation, même malveillant, peut être chargé sur le terminal, brisant intégralement la chaîne de confiance.' },
        { id: 'root-1',   icon: 'unlock', title: 'Les Risques du Rooting',  desc: 'Comment le super-utilisateur brise le bac à sable Android et détruit l\'isolation des données.', content: 'Le rooting donne un accès root (UID 0) à l\'appareil. Cela désactive les protections SELinux et le bac à sable des applications (sandbox), permettant à n\'importe quel malware d\'accéder à toutes les données, y compris les clés cryptographiques.' },
        { id: 'crypto-1', icon: 'cpu',    title: 'Chiffrement & TEE',       desc: 'L\'importance du Trusted Execution Environment pour la sécurisation matérielle des données.', content: 'Le chiffrement basé sur le TEE (Trusted Execution Environment) stocke les clés dans une enclave sécurisée (ARM TrustZone). Même si le processeur principal est compromis, les clés restent physiquement inaccessibles.' }
    ];

    const REMEDIATION = {
        root:       { title: 'Désactiver le Root', impact: '+40 PTS SÉCURITÉ', steps: [{ text: 'Réinstaller le firmware officiel depuis le site du fabricant (Pixel, Samsung, etc.).' }, { text: 'Verrouiller le bootloader via commande fastboot pour activer Verified Boot.' }, { text: 'Effectuer une réinitialisation d\'usine pour supprimer les binaires superutilisateurs.' }] },
        bootloader: { title: 'Verrouiller le Bootloader', impact: '+30 PTS SÉCURITÉ', steps: [{ text: 'Sauvegarder vos données (le verrouillage efface le terminal).' }, { text: 'Démarrer en mode Fastboot : maintenir Volume Bas + Alimentation.' }, { text: 'Exécuter : fastboot flashing lock — puis valider sur l\'écran.' }] },
        encryption: { title: 'Activer le Chiffrement', impact: '+25 PTS SÉCURITÉ', steps: [{ text: 'Allez dans Paramètres → Sécurité → Chiffrement et identifiants.' }, { text: 'Sélectionner "Chiffrer le téléphone" et connecter le chargeur.' }, { text: 'Définir un code PIN fort (min. 8 chiffres) avant d\'activer.' }] }
    };

    function computeScores(data) {
        let system = 100, privilege = 100, network = 90, crypto = 100;
        if (!data.bootloaderLocked) system -= 40;
        if (data.androidVersion < 12) system -= 20;
        if (data.rootAccess) privilege -= 60;
        if (!data.encryptionEnabled) crypto -= 50;
        const global = Math.round((system + privilege + network + crypto) / 4);
        return { categoryScores: { system, privilege, network, crypto }, globalScore: global };
    }

    function generateVulnerabilities(data) {
        const v = [];
        if (data.rootAccess)        v.push({ id: 'root',       title: 'Accès Root Actif',         desc: 'Le modèle de sécurité Android (sandbox) est contourné. Toutes les données sont exposées.', severity: 'critical', cvss: '9.8' });
        if (!data.bootloaderLocked) v.push({ id: 'bootloader', title: 'Bootloader Déverrouillé',   desc: 'Verified Boot est désactivé. Un OS malveillant peut être chargé au démarrage.', severity: 'critical', cvss: '9.1' });
        if (!data.encryptionEnabled)v.push({ id: 'encryption', title: 'Données Non Chiffrées',     desc: 'L\'accès physique au terminal expose toutes les données utilisateur.', severity: 'critical', cvss: '8.7' });
        return v;
    }

    function getRiskLevel(score) {
        if (score >= 80) return { level: 'FAIBLE',   cssClass: 'safe',    color: '#4B6E4B' };
        if (score >= 60) return { level: 'MODÉRÉ',   cssClass: 'warning', color: '#C48D2A' };
        return              { level: 'CRITIQUE', cssClass: 'danger',  color: '#A64B4B' };
    }

    function getCompliance(data) {
        const v = parseInt(data.androidVersion) || 14;
        return [
            { std: 'NIST',   control: 'SP 800-124 §4.2', desc: 'Hardware Verified Boot',         ok: data.bootloaderLocked && v >= 12 },
            { std: 'OWASP',  control: 'MASVS-RES-1',     desc: 'Tamper & Root Protection',       ok: !data.rootAccess },
            { std: 'OWASP',  control: 'MASVS-STOR-1',    desc: 'Secure On-Device Storage',       ok: data.encryptionEnabled },
            { std: 'CIS',    control: 'CIS-AOS-3.1',     desc: 'File-Based Encryption (FBE)',    ok: data.encryptionEnabled && v >= 10 }
        ];
    }

    return { CVE_DATABASE, ACADEMY_ARTICLES, REMEDIATION, computeScores, generateVulnerabilities, getRiskLevel, getCompliance };
})();
window.Engine = Engine;

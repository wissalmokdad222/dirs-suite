/**
 * database.js — Base de données locale pour DIRS Security Suite
 * Contient les CVEs, les articles de l'Academy et les mocks analytiques.
 */

const CVE_DATABASE = [
  { id: 'CVE-2023-40121', title: 'RCE in System Component', severity: 'Critical', score: 9.8, category: 'System', date: '2023-11' },
  { id: 'CVE-2023-21214', title: 'Privilege Escalation in Kernel', severity: 'High', score: 8.8, category: 'Kernel', date: '2023-10' },
  { id: 'CVE-2023-21145', title: 'Information Disclosure in Framework', severity: 'Medium', score: 6.5, category: 'Framework', date: '2023-09' },
  { id: 'CVE-2022-20421', title: 'Denial of Service in Radio', severity: 'Low', score: 3.5, category: 'Hardware', date: '2022-06' },
  { id: 'CVE-2024-0012', title: 'Sandbox Escape in Runtime', severity: 'Critical', score: 9.1, category: 'Runtime', date: '2024-01' },
  { id: 'CVE-2023-45781', title: 'TrustZone Data Access', severity: 'High', score: 8.2, category: 'TEE', date: '2023-12' }
];

const ACADEMY_ARTICLES = [
  {
    id: 'bootloader-101',
    title: 'Comprendre le Bootloader',
    desc: 'Pourquoi le verrouillage est la première ligne de défense de votre terminal.',
    icon: 'lock',
    content: 'Le bootloader est le programme qui charge le système d\'exploitation. S\'il est déverrouillé, n\'importe quel OS non signé (donc potentiellement malveillant) peut être chargé.'
  },
  {
    id: 'root-risks',
    title: 'Les Risques du Rooting',
    desc: 'Comment l\'accès super-utilisateur brise le bac à sable Android.',
    icon: 'unlock',
    content: 'Le rooting donne un accès total au système, mais désactive les protections d\'isolation des applications (Sandbox), permettant à un malware d\'accéder à tout.'
  },
  {
    id: 'encryption-hw',
    title: 'Chiffrement Matériel',
    desc: 'L\'importance du TEE (Trusted Execution Environment) et de la sécurisation physique.',
    icon: 'cpu',
    content: 'Le chiffrement matériel utilise une puce dédiée pour stocker les clés, les rendant inaccessibles même si le processeur principal est compromis.'
  }
];

const ANALYTICS_MOCK = {
  trends: [85, 82, 88, 75, 92, 90], // Scores historiques
  compliance_distribution: {
    'OWASP': 85,
    'CIS': 70,
    'NIST': 92
  }
};

window.Database = {
  CVE_DATABASE,
  ACADEMY_ARTICLES,
  ANALYTICS_MOCK
};

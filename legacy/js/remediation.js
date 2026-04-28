/**
 * remediation.js — Guide de remédiation interactif pour DIRS Security Suite
 */

const REMEDIATION_GUIDES = {
  'root-access': {
    title: 'Suppression de l\'Accès Root',
    steps: [
      { text: 'Désinstallez les applications de gestion SuperUser (Magisk, SuperSU).', icon: 'trash' },
      { text: 'Redémarrez en mode Recovery et effectuez un "Factory Reset" si nécessaire.', icon: 'refresh-cw' },
      { text: 'Flashez une image système d\'origine signée par le fabricant.', icon: 'download-cloud' }
    ],
    impact: '+20 points de sécurité'
  },
  'bootloader-unlocked': {
    title: 'Verrouillage du Bootloader',
    steps: [
      { text: 'Activez le "Débogage USB" et le "Déverrouillage OEM" dans les options développeur.', icon: 'settings' },
      { text: 'Utilisez la commande fastboot : `fastboot flashing lock`.', icon: 'terminal' },
      { text: 'Confirmez sur l\'écran de l\'appareil (attention: cela effacera vos données).', icon: 'alert-triangle' }
    ],
    impact: '+15 points de sécurité'
  },
  'encryption-disabled': {
    title: 'Activation du Chiffrement',
    steps: [
      { text: 'Allez dans Paramètres > Sécurité > Chiffrement et identifiants.', icon: 'shield' },
      { text: 'Sélectionnez "Chiffrer le téléphone". Branchez l\'appareil sur secteur.', icon: 'zap' },
      { text: 'Définissez un code PIN ou un mot de passe robuste (requis pour la clé de chiffrement).', icon: 'key' }
    ],
    impact: '+15 points de sécurité'
  },
  'android-old-version': {
    title: 'Mise à jour du Système OS',
    steps: [
      { text: 'Accédez à Paramètres > Système > Mise à jour du système.', icon: 'download' },
      { text: 'Téléchargez et installez la dernière mise à jour de sécurité disponible.', icon: 'check-circle' }
    ],
    impact: 'Dépend des CVE corrigées'
  }
};

const SYSTEM_NOTIFICATIONS = [
  { id: 1, title: 'Nouvelle CVE critique détectée', time: 'Il y a 2h', text: 'La faille CVE-2024-0012 affecte les noyaux Android 12+. Un patch est recommandé.', read: false },
  { id: 2, title: 'Conseil de la semaine', time: 'Hier', text: 'Pensez à désactiver le Débogage USB lorsqu\'il n\'est pas utilisé.', read: true },
  { id: 3, title: 'Audit mensuel planifié', time: '2 jours', text: 'N\'oubliez pas de lancer un audit complet pour valider vos derniers patchs.', read: false }
];

window.Remediation = {
  GUIDES: REMEDIATION_GUIDES,
  NOTIFICATIONS: SYSTEM_NOTIFICATIONS
};

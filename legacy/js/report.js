/**
 * report.js — Rapport au style Édition Papier Beige
 * Device Integrity Risk Scorer
 */

function generateReportHTML(scanResult) {
  const { data, categoryScores, globalScore, riskInfo, vulns, recos, compliance } = scanResult;
  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  
  const conforme = compliance.filter(c => c.status === 'CONFORME').length;

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;700&family=Inter:wght@400;600&display=swap');
    body { font-family: 'Inter', sans-serif; background: #F9F7F2; color: #1F1F1F; padding: 60px; line-height: 1.5; }
    .report-container { max-width: 800px; margin: 0 auto; background: white; padding: 80px; box-shadow: 0 0 40px rgba(0,0,0,0.05); }
    h1, h2, h3 { font-family: 'Cormorant Garamond', serif; font-weight: 500; }
    .header { border-bottom: 1px solid #E5E0D8; padding-bottom: 20px; margin-bottom: 40px; display: flex; justify-content: space-between; align-items: flex-end; }
    .score-box { text-align: center; border: 1px solid #B8860B; padding: 20px; min-width: 120px; }
    .score-large { font-family: 'Cormorant Garamond', serif; font-size: 64px; color: #B8860B; line-height: 1; }
    .risk-tag { font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 20px; margin-top: 10px; color: #B8860B; }
    .table { width: 100%; border-collapse: collapse; margin: 30px 0; }
    .table th { text-align: left; padding: 10px; border-bottom: 1px solid #E5E0D8; font-size: 11px; text-transform: uppercase; color: #8F8F8F; }
    .table td { padding: 12px 10px; border-bottom: 1px solid #F0EDE9; font-size: 13px; }
    .vuln-item { margin-bottom: 20px; padding: 15px; border-left: 3px solid #CD5C5C; background: #FDFBFA; }
    .footer { margin-top: 60px; font-size: 10px; color: #8F8F8F; text-align: center; text-transform: uppercase; letter-spacing: 2px; }
  </style>
</head>
<body>
  <div class="report-container">
    <div class="header">
      <div>
        <div style="font-size: 10px; letter-spacing: 2px; color: #8F8F8F;">CERTIFICAT D'AUDIT</div>
        <h1 style="font-size: 32px; margin: 5px 0;">${data.deviceName}</h1>
        <div style="font-size: 12px; color: #5C5C5C;">Généré le ${dateStr}</div>
      </div>
      <div class="score-box">
        <div class="score-large">${globalScore}</div>
        <div style="font-size: 9px; letter-spacing: 1px;">SCORE GLOBAL</div>
      </div>
    </div>

    <div class="risk-tag">Évaluation Posturale : ${riskInfo.level}</div>
    
    <p style="margin: 30px 0; font-size: 14px; font-style: italic; color: #5C5C5C;">
      Ce document atteste de l'analyse d'intégrité réalisée sur le dispositif susmentionné. 
      L'audit a couvert les domaines critiques de la chaîne de confiance et du contrôle des privilèges.
    </p>

    <h2>Analyse par Domaine</h2>
    <table class="table">
      <thead>
        <tr><th>Domaine</th><th>Score</th><th>Statut</th></tr>
      </thead>
      <tbody>
        ${window.Scanner.CATEGORIES.map(cat => `
          <tr>
            <td>${cat.name}</td>
            <td style="font-weight:600">${Math.round(categoryScores[cat.id])}%</td>
            <td>${categoryScores[cat.id] >= 80 ? 'Optimal' : categoryScores[cat.id] >= 60 ? 'Adéquat' : 'Axe d\'amélioration'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <h2 style="margin-top: 40px;">Observations Critiques</h2>
    ${vulns.length > 0 ? vulns.map(v => `
      <div class="vuln-item">
        <div style="font-weight: 600; font-size: 14px; margin-bottom: 5px;">${v.title}</div>
        <div style="font-size: 12px; color: #5C5C5C;">${v.desc}</div>
      </div>
    `).join('')} : '<p style="font-size:13px; color:#8FBC8F">Aucune anomalie critique détectée lors de l\'audit.</p>'}

    <div class="footer">
      DIRS Plattform — Sécurité Android Avancée
    </div>
  </div>
</body>
</html>`;
}

window.Report = { generateReportHTML };

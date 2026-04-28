/**
 * app.js — DIRS Security Suite (Version Excellence Stable)
 * Gestionnaire de navigation et d'interface pour la plateforme d'audit.
 */

(function () {

  const state = {
    currentView: 'home',
    scanHistory: JSON.parse(localStorage.getItem('dirs_history') || '[]'),
    unreadCount: window.Remediation?.NOTIFICATIONS.filter(n => !n.read).length || 0,
  };

  // ─── Initialisation ──────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    initApp();
  });

  function initApp() {
    bindEvents();
    renderStats();
    renderHistory();
    renderInbox();
    renderComplianceMatrix();
    updateInboxBadge();
    
    // Modules Statiques
    renderCVEs();
    renderAcademy();
    
    // Forcer la vue home au lancement
    showView('home');
    
    // Lucide Icons
    if (window.lucide) lucide.createIcons();
    
    // Date Dashboard
    const d = new Date();
    const dateEl = document.getElementById('dashboard-date');
    if (dateEl) dateEl.textContent = d.toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' }).toUpperCase();
  }

  // ─── Navigation & Routing ───────────────────────────────────────────────
  function showView(viewId) {
    if (!viewId) return;
    state.currentView = viewId;
    
    // Mise à jour de la Sidebar
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.target === viewId);
    });

    // Basculement des sections (Masquer tout, Afficher la cible)
    document.querySelectorAll('.view-section').forEach(sect => {
      sect.classList.remove('active');
    });
    
    const target = document.getElementById('view-' + viewId);
    if (target) {
      target.classList.add('active');
    }

    // Initialisation spécifique par module
    switch (viewId) {
      case 'threat-map': initThreatMap(); break;
      case 'comparison': renderComparisonSelects(); break;
      case 'analytics': initAnalyticsCharts(); break;
      case 'inbox': renderInbox(); break;
      case 'compliance': renderComplianceMatrix(); break;
      case 'settings': /* Pas de init spécial requis */ break;
    }

    if (window.lucide) lucide.createIcons();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function bindEvents() {
    // Navigation Sidebar et liens data-target
    document.querySelectorAll('[data-target]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = link.dataset.target;
        showView(target);
      });
    });

    // Scanner Buttons
    idClick('btn-run-scan', startScan);
    idClick('btn-view-report-res', () => showView('report'));
    idClick('btn-back-results', () => showView('results'));

    // Modals
    idClick('btn-close-modal', closeModal);
    idClick('btn-done-remediation', () => { 
        showToast('✓ État de sécurité mis à jour.'); 
        closeModal(); 
    });

    // Statistiques / Analytics (Re-init on demand implicitly by showView)
    
    // Paramètres / Settings
    idClick('btn-export-json', exportHistory);
    const importInput = document.getElementById('input-import-json');
    if (importInput) {
        importInput.addEventListener('change', (e) => importHistory(e.target.files[0]));
    }
    idClick('btn-clear-history', clearHistory);
    idClick('btn-simulate-fleet', generateTestFleet);
    
    // Search & Filter CVE
    idOn('cve-search', 'input', renderCVEs);
    idOn('cve-filter', 'change', renderCVEs);

    // Reporting
    idClick('btn-print-report', () => {
      const frame = document.querySelector('#report-iframe-container iframe');
      if (frame) frame.contentWindow.print();
    });

    // Profile Selection
    document.querySelectorAll('.profile-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.profile-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        applyProfile(card.dataset.profile);
      });
    });

    // Global Comparison Selects
    idOn('comp-select-a', 'change', updateComparison);
    idOn('comp-select-b', 'change', updateComparison);
  }

  // ─── Module Statistiques (Analytics) ────────────────────────────────────
  let analyticsCharts = {};
  function initAnalyticsCharts() {
    const tCtx = document.getElementById('trend-chart')?.getContext('2d');
    const cCtx = document.getElementById('compliance-chart')?.getContext('2d');
    
    if (!tCtx || !cCtx) return;
    
    const db = window.Database.ANALYTICS_MOCK;
    
    // Chart 1: Trend
    if (analyticsCharts.trend) analyticsCharts.trend.destroy();
    analyticsCharts.trend = new Chart(tCtx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Féb', 'Mar', 'Avr', 'Mai', 'Jun'],
        datasets: [{
          label: 'Score Moyen',
          data: db.trends,
          borderColor: '#B8860B',
          backgroundColor: 'rgba(184, 134, 11, 0.04)',
          fill: true,
          tension: 0.4,
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, max: 100 } }
      }
    });

    // Chart 2: Compliance Distribution
    if (analyticsCharts.comp) analyticsCharts.comp.destroy();
    analyticsCharts.comp = new Chart(cCtx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(db.compliance_distribution),
        datasets: [{
          data: Object.values(db.compliance_distribution),
          backgroundColor: ['#4B6E4B', '#B8860B', '#2C2C2C'],
          borderWidth: 0
        }]
      },
      options: {
        cutout: '75%',
        plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 20 } } }
      }
    });
  }

  // ─── Module Paramètres (Settings) ───────────────────────────────────────
  function exportHistory() {
    if (state.scanHistory.length === 0) {
        showToast('Aucune donnée à exporter.');
        return;
    }
    const dataStr = JSON.stringify(state.scanHistory, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DIRS_Suite_Export_${new Date().toISOString().split('T')[0]}.dirs`;
    a.click();
    showToast('✓ Historique exporté avec succès.');
  }

  function importHistory(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (Array.isArray(data)) {
          state.scanHistory = data;
          localStorage.setItem('dirs_history', JSON.stringify(data));
          initApp(); // Reset everything
          showToast('✓ Historique importé et restauré.');
        } else { throw new Error(); }
      } catch (err) {
        showToast('✕ Erreur : Format de fichier invalide.');
      }
    };
    reader.readAsText(file);
  }

  function clearHistory() {
    if (confirm('Êtes-vous sûr de vouloir effacer définitivement tout l\'historique d\'audit ? Cette action est irréversible.')) {
      state.scanHistory = [];
      localStorage.removeItem('dirs_history');
      initApp();
      showToast('✓ Historique réinitialisé.');
    }
  }

  function generateTestFleet() {
    const devices = [
      { name: 'Samsung Galaxy S24 Ultra', score: 94, risk: 'FAIBLE', date: '2024-04-20T10:00:00', data: { rootAccess: false, bootloaderLocked: true, encryptionEnabled: true } },
      { name: 'Google Pixel 8 Pro', score: 98, risk: 'FAIBLE', date: '2024-04-19T14:30:00', data: { rootAccess: false, bootloaderLocked: true, encryptionEnabled: true } },
      { name: 'OnePlus 12 (Rooted)', score: 32, risk: 'CRITIQUE', date: '2024-04-18T09:15:00', data: { rootAccess: true, bootloaderLocked: false, encryptionEnabled: true } },
      { name: 'Xiaomi 14 Pro', score: 88, risk: 'MODÉRÉ', date: '2024-04-17T16:45:00', data: { rootAccess: false, bootloaderLocked: true, encryptionEnabled: true } },
      { name: 'Motorola Razr+', score: 58, risk: 'ÉLEVÉ', date: '2024-04-16T11:20:00', data: { rootAccess: true, bootloaderLocked: true, encryptionEnabled: false } }
    ];

    const fleet = devices.map(d => {
        const s = window.Scanner.computeCategoryScores(d.data);
        return { 
           id: 'FLT-' + Math.random().toString(36).substr(2, 4).toUpperCase(),
           data: { ...d.data, deviceName: d.name },
           deviceName: d.name,
           globalScore: d.score,
           score: d.score,
           riskInfo: { level: d.risk },
           date: d.date,
           categoryScores: s,
           vulns: window.Scanner.generateVulnerabilities(d.data, s)
        };
    });

    state.scanHistory = fleet;
    localStorage.setItem('dirs_history', JSON.stringify(fleet));
    initApp();
    showToast('✓ Flotte de test déployée (5 terminaux).');
    showView('home');
  }

  // ─── Threat Map Logic ────────────────────────────────────────────────────
  let mapTimer;
  function initThreatMap() {
    const container = document.getElementById('threat-map-container');
    if (!container) return;
    const colors = ['#A64B4B', '#C48D2A', '#D4AF37'];
    function addDot() {
      if (state.currentView !== 'threat-map') return;
      const dot = document.createElement('div');
      dot.className = 'map-dot';
      dot.style.left = Math.random() * 90 + 5 + '%';
      dot.style.top = Math.random() * 80 + 10 + '%';
      dot.style.background = colors[Math.floor(Math.random() * colors.length)];
      container.appendChild(dot);
      setTimeout(() => { if(dot.parentElement) dot.remove(); }, 2000);
    }
    if (mapTimer) clearInterval(mapTimer);
    mapTimer = setInterval(addDot, 700);
  }

  // ─── Common Modules (Simplified/Stable) ──────────────────────────────────
  function renderStats() {
    idTxt('stat-total-scans', state.scanHistory.length);
    if (state.scanHistory.length > 0) {
      const avg = Math.round(state.scanHistory.reduce((a, b) => a + (b.globalScore || b.score), 0) / state.scanHistory.length);
      idTxt('stat-avg-score', avg);
      idTxt('stat-critical', state.scanHistory.filter(s => (s.globalScore || s.score) < 60).length);
    }
  }

  function renderHistory() {
    const list = document.getElementById('scan-history-list'); if (!list) return;
    if (state.scanHistory.length === 0) return;
    list.innerHTML = state.scanHistory.slice(0, 10).map(h => `
      <div style="display:flex; justify-content:space-between; padding: 18px 0; border-bottom: 1px dashed var(--border-light);">
        <div><div style="font-weight: 600; font-size: 14px;">${h.data?.deviceName || h.deviceName}</div><div style="font-size: 11px; color: var(--text-muted);">${new Date(h.date || Date.now()).toLocaleDateString()}</div></div>
        <div style="font-family: var(--font-mono); font-weight: 700; color: var(--primary);">${h.globalScore || h.score}</div>
      </div>
    `).join('');
  }

  function renderComplianceMatrix() {
    const body = document.getElementById('compliance-matrix-body'); if (!body) return;
    const last = state.scanHistory[0];
    const controls = [
      { name: 'Hardware Attestation (TEE)', fw: 'NIST', ref: 'SP 800-124', key: 'verifiedBoot' },
      { name: 'System Integrity (AVB)', fw: 'OWASP', ref: 'MASVS-RES-1', key: 'bootloaderLocked' },
      { name: 'Root Separation', fw: 'OWASP', ref: 'MASVS-PLAT-1', key: 'rootAccess', invert: true },
      { name: 'Storage Encryption', fw: 'Android', ref: 'CDD 9.9.2', key: 'encryptionEnabled' }
    ];
    body.innerHTML = controls.map(c => {
      let ok = true; if (last && last.data) ok = c.invert ? !last.data[c.key] : last.data[c.key];
      return `<tr><td style="font-weight:600;">${c.name}</td><td>${c.fw}</td><td style="font-size:11px;">${c.ref}</td><td><span class="status-pill" style="background:${ok ? 'var(--safe-dim)':'var(--danger-dim)'}; color:${ok ? 'var(--safe)':'var(--danger)'}">${ok ? 'CONFORME' : 'ÉCHEC'}</span></td></tr>`;
    }).join('');
  }

  function renderInbox() {
    const list = document.getElementById('inbox-list'); if (!list) return;
    list.innerHTML = window.Remediation.NOTIFICATIONS.map(n => `
      <div class="inbox-item ${n.read ? '' : 'unread'}" onclick="app.markRead(${n.id})">
        <div style="color:var(--primary);"><i data-lucide="${n.read ? 'check' : 'mail'}"></i></div>
        <div style="flex:1;"><div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span style="font-weight:600;">${n.title}</span><span style="font-size:11px; color:var(--text-muted);">${n.time}</span></div><p style="font-size:12px; margin:0; line-height:1.4;">${n.text}</p></div>
      </div>
    `).join('');
    if (window.lucide) lucide.createIcons();
  }

  function markRead(id) {
    const n = window.Remediation.NOTIFICATIONS.find(i => i.id === id); if (n) n.read = true;
    state.unreadCount = window.Remediation.NOTIFICATIONS.filter(i => !i.read).length;
    updateInboxBadge(); renderInbox();
  }

  function updateInboxBadge() { const b = document.getElementById('inbox-badge'); if (b) { b.textContent = state.unreadCount; b.style.display = state.unreadCount > 0 ? 'inline-block' : 'none'; } }

  // ─── Scanner Modules ────────────────────────────────────────────────────
  function applyProfile(k) {
    const p = window.Scanner.PROFILES[k]; if (!p) return;
    idVal('device-name', p.name);
    document.getElementById('toggle-bootloader').checked = !!p.data.bootloaderLocked;
    document.getElementById('toggle-root').checked = !!p.data.rootAccess;
    document.getElementById('toggle-encryption').checked = !!p.data.encryptionEnabled;
    showToast('Profil technique appliqué.');
  }

  function startScan() {
    const data = {
      deviceName: document.getElementById('device-name').value || 'Unité Inconnue',
      bootloaderLocked: document.getElementById('toggle-bootloader').checked,
      rootAccess: document.getElementById('toggle-root').checked,
      encryptionEnabled: document.getElementById('toggle-encryption').checked,
      androidVersion: document.getElementById('android-version').value,
      securityPatch: '2024-03', verifiedBoot: true
    };
    showView('scanning');
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5; updateScanProgress(progress);
      if (progress >= 100) { clearInterval(interval); finalizeScan(data); }
    }, 110);
  }

  function updateScanProgress(p) {
    idStyle('scan-progress-bar', 'width', p + '%');
    idTxt('scan-progress-pct', p + '%');
    idTxt('scan-step-message', ["Initialisation TEE...", "Contrôle Boot...", "Analyse Systèmes...", "Mapping Compliance...", "Génération Rapport..."][Math.floor((p/101)*5)]);
  }

  function finalizeScan(data) {
    const s = window.Scanner.computeCategoryScores(data);
    const g = window.Scanner.computeGlobalScore(s);
    const v = window.Scanner.generateVulnerabilities(data, s);
    const res = { id: 'AUDIT-' + Math.random().toString(36).substr(2, 5).toUpperCase(), data, categoryScores: s, globalScore: g, riskInfo: window.Scanner.getRiskLevel(g), vulns: v, date: new Date() };
    state.scanHistory.unshift(res);
    localStorage.setItem('dirs_history', JSON.stringify(state.scanHistory.slice(0, 10)));
    renderResults(res); renderStats(); renderHistory(); renderComplianceMatrix();
    showView('results');
  }

  function renderResults(res) {
    idTxt('result-device-name', res.data.deviceName); idTxt('result-score-display', res.globalScore); idTxt('result-risk-level', 'Analysé : ' + res.riskInfo.level); idTxt('result-scan-id', 'AUDIT ID : ' + res.id);
    document.getElementById('category-rows').innerHTML = window.Scanner.CATEGORIES.map(c => `<div style="margin-bottom:14px;"><div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:6px;"><span>${c.name}</span><span style="font-weight:700;">${Math.round(res.categoryScores[c.id])}%</span></div><div style="height:4px; background:var(--border-light);"><div style="height:100%; background:var(--primary); width:${res.categoryScores[c.id]}%;"></div></div></div>`).join('');
    document.getElementById('vulns-list').innerHTML = res.vulns.map(v => `<div class="card" style="padding:20px; margin-bottom:16px; border-left:4px solid ${v.severity==='critical'?'var(--danger)':'var(--warning)'}; display:flex; justify-content:space-between; align-items:center;"><div style="flex:1;"><div style="font-weight:700; font-size:14px; margin-bottom:4px;">${v.title}</div><p style="font-size:12px; margin:0; color:var(--text-secondary);">${v.desc}</p></div>${window.Remediation.GUIDES[v.id] ? `<button class="btn btn-outline btn-sm" onclick="app.openRemediationModal('${v.id}')">FIX GUIDE</button>` : ''}</div>`).join('');
    window.Charts.animateRadar('radar-canvas', window.Scanner.CATEGORIES, window.Scanner.CATEGORIES.map(c => res.categoryScores[c.id]));
    const html = window.Report.generateReportHTML(res); if (document.getElementById('report-iframe-container')) document.getElementById('report-iframe-container').innerHTML = `<iframe srcdoc='${html.replace(/'/g, "&apos;")}' style="width:100%; height:100%; border:none;"></iframe>`;
  }

  // ─── Modals & Utils ──────────────────────────────────────────────────────
  function openRemediationModal(k) {
    const g = window.Remediation.GUIDES[k]; if (!g) return;
    const c = document.getElementById('modal-content');
    c.innerHTML = `<div style="text-align:center; margin-bottom:30px;"><h2 class="serif-title">${g.title}</h2><div class="status-pill" style="background:var(--safe-dim); color:var(--safe); margin-top:10px;">${g.impact}</div></div><div style="display:flex; flex-direction:column; gap:20px;">${g.steps.map((s,i)=>`<div style="display:flex; gap:16px; font-size:14px;"><div style="font-weight:700; color:var(--primary);">${i+1}.</div><div>${s.text}</div></div>`).join('')}</div>`;
    document.getElementById('modal-remediation').classList.add('active'); if (window.lucide) lucide.createIcons();
  }
  function closeModal() { document.getElementById('modal-remediation').classList.remove('active'); }
  function showToast(m) { const t=document.getElementById('toast'); if(!t)return; t.textContent=m; t.style.transform='translateY(0)'; t.style.opacity='1'; setTimeout(()=> { t.style.transform='translateY(120px)'; t.style.opacity='0'; }, 3000); }
  
  // Helpers
  function idTxt(i,v) { const el=document.getElementById(i); if(el)el.textContent=v; }
  function idVal(i,v) { const el=document.getElementById(i); if(el)el.value=v; }
  function idClick(i,f) { const el=document.getElementById(i); if(el)el.addEventListener('click',f); }
  function idOn(i,e,f) { const el=document.getElementById(i); if(el)el.addEventListener(e,f); }
  function idStyle(i,p,v) { const el=document.getElementById(i); if(el)el.style[p]=v; }

  // App Interface
  window.app = { showView, openRemediationModal, markRead };

  // Dummy Fallbacks
  function renderCVEs() { /* Déjà géré dans initApp */ }
  function renderAcademy() { /* Déjà géré dans initApp */ }
  function renderComparisonSelects() { /* Géré par switch */ }

})();

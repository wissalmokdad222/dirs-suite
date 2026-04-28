/**
 * app.js — Contrôleur Interface DIRS Elite
 * Navigation, rendu dynamique, gestion des événements
 */
(function() {
    const state = {
        view: 'dashboard',
        history: JSON.parse(localStorage.getItem('dirs_elite_v2') || '[]')
    };

    document.addEventListener('DOMContentLoaded', boot);

    function boot() {
        lucide.createIcons();
        document.querySelectorAll('[data-target]').forEach(el =>
            el.addEventListener('click', e => { e.preventDefault(); showView(el.dataset.target); })
        );
        document.querySelectorAll('.profile-card').forEach(card =>
            card.addEventListener('click', () => {
                document.querySelectorAll('.profile-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                applyProfile(card.dataset.profile);
            })
        );
        const cveSearch = document.getElementById('cve-search');
        if (cveSearch) cveSearch.addEventListener('input', e => renderCVE(e.target.value));
        const btnScan = document.getElementById('btn-scan');
        if (btnScan) btnScan.addEventListener('click', startScan);
        const btnClose = document.getElementById('modal-close-btn');
        if (btnClose) btnClose.addEventListener('click', closeModal);

        renderStats(); renderHistory(); renderCVE(); renderAcademy(); renderCompliance();
        showView('dashboard');
    }

    // ── Navigation ──────────────────────────────────────────────────────────
    function showView(v) {
        state.view = v;
        document.querySelectorAll('.nav-link').forEach(l => l.classList.toggle('active', l.dataset.target === v));
        document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
        const el = document.getElementById('view-' + v);
        if (el) el.classList.add('active');
        lucide.createIcons();
        document.querySelector('.main-content').scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ── Modules ─────────────────────────────────────────────────────────────
    function renderStats() {
        setText('stat-total', state.history.length);
        if (!state.history.length) return;
        const avg = Math.round(state.history.reduce((a, b) => a + b.globalScore, 0) / state.history.length);
        const crit = state.history.filter(h => h.globalScore < 50).length;
        setText('stat-avg', avg);
        setText('stat-crit', crit);
    }

    function renderHistory() {
        const el = document.getElementById('history-list');
        if (!el) return;
        if (!state.history.length) {
            el.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:50px;color:var(--prestige-slate);font-style:italic">Aucun audit — cliquez sur Audit Scanner pour commencer.</td></tr>';
            return;
        }
        el.innerHTML = state.history.map(h => `
            <tr onclick="App.viewResult('${h.id}')" style="cursor:pointer">
                <td style="font-weight:700">${h.deviceName}</td>
                <td style="font-size:12px;color:var(--prestige-slate)">${fmtDate(h.date)}</td>
                <td><span class="status-badge ${h.risk.cssClass}">${h.risk.level}</span></td>
                <td style="font-weight:700;text-align:right;color:var(--prestige-gold)">${h.globalScore}</td>
            </tr>`).join('');
    }

    function renderCVE(q = '') {
        const el = document.getElementById('cve-list');
        if (!el) return;
        const q2 = q.toLowerCase();
        const rows = Engine.CVE_DATABASE.filter(c =>
            !q2 || c.id.toLowerCase().includes(q2) || c.category.toLowerCase().includes(q2) || c.title.toLowerCase().includes(q2)
        );
        const sevColor = { Critical: 'danger', High: 'warning', Medium: 'warning', Low: 'safe' };
        el.innerHTML = rows.map(c => `
            <tr>
                <td style="font-weight:700;font-family:monospace;font-size:12px">${c.id}</td>
                <td><span style="font-size:10px;font-weight:700;color:var(--prestige-gold);text-transform:uppercase">${c.category}</span></td>
                <td style="font-size:13px">${c.title}</td>
                <td><span class="status-badge ${sevColor[c.severity]||'warning'}">${c.severity}</span></td>
                <td style="text-align:right;font-weight:700">${c.score}</td>
            </tr>`).join('');
    }

    function renderAcademy() {
        const el = document.getElementById('academy-grid');
        if (!el) return;
        el.innerHTML = Engine.ACADEMY_ARTICLES.map(a => `
            <div class="luxury-card article-card" onclick="App.openArticle('${a.id}')">
                <div class="article-icon"><i data-lucide="${a.icon}"></i></div>
                <h3>${a.title}</h3>
                <p>${a.desc}</p>
                <div class="article-link">Lire la doctrine →</div>
            </div>`).join('');
        lucide.createIcons();
    }

    function renderCompliance() {
        const el = document.getElementById('compliance-list');
        const empty = document.getElementById('compliance-empty');
        if (!el) return;
        if (!state.history.length) {
            if (empty) empty.style.display = 'flex';
            el.innerHTML = '';
            return;
        }
        if (empty) empty.style.display = 'none';
        const m = Engine.getCompliance(state.history[0].data);
        el.innerHTML = m.map(c => `
            <tr>
                <td style="font-weight:700">${c.std}</td>
                <td style="font-family:monospace;font-size:12px">${c.control}</td>
                <td style="font-size:13px">${c.desc}</td>
                <td><span class="status-badge ${c.ok ? 'safe' : 'danger'}">${c.ok ? 'CONFORME' : 'NON-CONFORME'}</span></td>
            </tr>`).join('');
    }

    // ── Scanner ──────────────────────────────────────────────────────────────
    function applyProfile(p) {
        setVal('scan-name', p === 'secure' ? 'Pixel 8 Pro (Enterprise)' : 'OnePlus 11 (Dev Mode)');
        setChk('chk-boot', p === 'secure');
        setChk('chk-root', p !== 'secure');
        setChk('chk-enc',  p === 'secure');
        setVal('scan-ver', p === 'secure' ? '14' : '12');
        toast('Profil appliqué');
    }

    function startScan() {
        const data = {
            deviceName:      getVal('scan-name') || 'Terminal Inconnu',
            bootloaderLocked: getChk('chk-boot'),
            rootAccess:       getChk('chk-root'),
            encryptionEnabled:getChk('chk-enc'),
            androidVersion:   parseInt(getVal('scan-ver')) || 14
        };
        showView('scanning');
        setText('scan-pct', '0%');
        setText('scan-msg', 'Initialisation...');
        document.getElementById('scan-bar').style.width = '0%';

        let p = 0;
        const msgs = ['Initialisation TEE...','Contrôle Bootloader...','Analyse Privilèges...','Mapping NIST/OWASP...','Finalisation Rapport...'];
        const iv = setInterval(() => {
            p += 2;
            document.getElementById('scan-bar').style.width = p + '%';
            setText('scan-pct', p + '%');
            setText('scan-msg', msgs[Math.floor(p / 20)] || 'Finalisation...');
            if (p >= 100) { clearInterval(iv); finalize(data); }
        }, 50);
    }

    function finalize(data) {
        const r = Engine.computeScores(data);
        const risk = Engine.getRiskLevel(r.globalScore);
        const audit = {
            id: 'AUDIT-' + Math.random().toString(36).substr(2,5).toUpperCase(),
            date: new Date().toISOString(),
            deviceName: data.deviceName,
            data,
            globalScore: r.globalScore,
            categoryScores: r.categoryScores,
            vulns: Engine.generateVulnerabilities(data),
            risk
        };
        state.history.unshift(audit);
        localStorage.setItem('dirs_elite_v2', JSON.stringify(state.history.slice(0, 15)));
        renderStats(); renderHistory(); renderCompliance();
        showResult(audit);
        showView('results');
        toast('✓ Audit terminé avec succès');
    }

    function showResult(audit) {
        setText('res-score', audit.globalScore);
        setText('res-device', audit.deviceName);
        setText('res-risk', 'NIVEAU : ' + audit.risk.level);
        setText('res-id', 'ID : ' + audit.id);
        document.getElementById('res-score').style.color = audit.risk.color;
        document.getElementById('res-risk').className = 'status-badge ' + audit.risk.cssClass;

        const el = document.getElementById('res-vulns');
        el.innerHTML = audit.vulns.length ? audit.vulns.map(v => `
            <div class="vuln-item">
                <div class="vuln-info">
                    <h4>${v.title}</h4>
                    <p>${v.desc}</p>
                </div>
                <button class="btn-prestige" onclick="App.openFix('${v.id}')" style="padding:10px 18px;font-size:10px;white-space:nowrap">Guide Fix</button>
            </div>`).join('')
            : '<p style="color:var(--prestige-slate);font-style:italic">Aucune vulnérabilité critique détectée.</p>';
    }

    // ── Modal ────────────────────────────────────────────────────────────────
    function openModal(title, badge, body) {
        document.getElementById('modal-body').innerHTML = `
            <div style="text-align:center;margin-bottom:30px">
                <h2 class="serif" style="font-size:32px;margin-bottom:12px">${title}</h2>
                <span class="status-badge safe" style="letter-spacing:2px">${badge}</span>
            </div>
            ${body}
            <button class="btn-prestige" onclick="App.closeModal()" style="width:100%;margin-top:36px;justify-content:center">Fermer</button>`;
        document.getElementById('modal').classList.add('active');
    }

    function closeModal() { document.getElementById('modal').classList.remove('active'); }

    // ── Export ───────────────────────────────────────────────────────────────
    function exportJSON() {
        const a = document.createElement('a');
        a.href = 'data:application/json,' + encodeURIComponent(JSON.stringify(state.history, null, 2));
        a.download = 'DIRS_Elite_Export.json';
        a.click();
        toast('Données exportées en .json');
    }

    // ── Helpers ──────────────────────────────────────────────────────────────
    function setText(id, v) { const e=document.getElementById(id); if(e) e.textContent=v; }
    function setVal(id, v)  { const e=document.getElementById(id); if(e) e.value=v; }
    function setChk(id, v)  { const e=document.getElementById(id); if(e) e.checked=v; }
    function getVal(id)     { const e=document.getElementById(id); return e ? e.value : ''; }
    function getChk(id)     { const e=document.getElementById(id); return e ? e.checked : false; }
    function fmtDate(d)     { return new Date(d).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'}); }
    function toast(msg)     { const t=document.getElementById('toast'); if(!t)return; t.textContent=msg; t.style.transform='translateY(0)'; t.style.opacity='1'; setTimeout(()=>{t.style.transform='translateY(100px)';t.style.opacity='0';},3000); }

    // ── Public API ───────────────────────────────────────────────────────────
    window.App = {
        openFix(id)     { const g=Engine.REMEDIATION[id]; if(!g)return; openModal(g.title, g.impact, g.steps.map((s,i)=>`<div style="display:flex;gap:16px;margin-bottom:18px"><div style="min-width:28px;height:28px;background:var(--prestige-gold-soft);color:var(--prestige-gold);border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700">${i+1}</div><p style="font-size:14px;line-height:1.6;color:var(--prestige-slate);padding-top:2px">${s.text}</p></div>`).join('')); },
        openArticle(id) { const a=Engine.ACADEMY_ARTICLES.find(x=>x.id===id); if(!a)return; openModal(a.title, 'ACADEMY DOCTRINE', `<p style="font-size:15px;line-height:1.8;color:var(--prestige-slate)">${a.content}</p>`); },
        viewResult(id)  { const a=state.history.find(h=>h.id===id); if(a){showResult(a);showView('results');} },
        closeModal,
        exportJSON
    };
})();

import React from 'react';
import { useAuditStore } from '../hooks/useAuditStore';
import { ShieldCheck, AlertCircle, Terminal, Calendar, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { history } = useAuditStore();
  
  const totalAudits = history.length;
  const avgScore = history.length > 0 
    ? Math.round(history.reduce((acc, curr) => acc + curr.globalScore, 0) / history.length)
    : '--';
  const criticalCount = history.filter(a => a.globalScore < 40).length;

  return (
    <div className="fade-in">
      <header className="mb-12 border-b border-beige-dark pb-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-serif mb-3">Tableau de Bord</h1>
            <p className="text-text-secondary text-lg">Synthèse de la santé de votre écosystème Android.</p>
          </div>
          <Link to="/scanner" className="btn-primary flex items-center gap-2">
            <ShieldCheck size={20} />
            Nouvel Audit
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <StatsCard label="Total Audits" value={totalAudits} color="border-primary" />
        <StatsCard label="Alertes Critiques" value={criticalCount} color="border-risk-danger" valueColor="text-risk-danger" />
        <StatsCard label="Score Santé Moyen" value={avgScore} color="border-risk-safe" valueColor="text-risk-safe" />
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="p-8 border-b border-beige-light bg-beige-light/30 flex justify-between items-center">
          <h3 className="text-2xl font-serif">Activités Récentes</h3>
          <span className="text-xs font-mono text-text-secondary uppercase tracking-[0.2em]">Live Intelligence Feed</span>
        </div>
        
        {history.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-beige-light rounded-full flex items-center justify-center text-beige-dark">
              <Calendar size={32} />
            </div>
            <p className="text-text-secondary italic">Aucun audit enregistré pour le moment.</p>
          </div>
        ) : (
          <div className="divide-y divide-beige-light">
            {history.map((audit) => (
              <div key={audit.id} className="p-6 hover:bg-beige-light/20 transition-colors flex items-center justify-between group">
                <div className="flex items-center gap-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    audit.globalScore < 40 ? 'bg-risk-danger/10 text-risk-danger' : 
                    audit.globalScore < 70 ? 'bg-risk-warning/10 text-risk-warning' : 'bg-risk-safe/10 text-risk-safe'
                    }`}>
                    {audit.globalScore < 40 ? <AlertCircle size={24} /> : <ShieldCheck size={24} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{audit.deviceName}</h4>
                    <p className="text-sm text-text-secondary flex items-center gap-2">
                      <Terminal size={12} />
                      {new Date(audit.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-10">
                   <div className="text-right">
                      <div className="text-2xl font-serif font-bold text-primary">{audit.globalScore}</div>
                      <div className="text-[10px] uppercase tracking-widest text-text-secondary">Global Score</div>
                   </div>
                   <ChevronRight className="text-beige-dark group-hover:text-primary transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const StatsCard = ({ label, value, color, valueColor }: any) => (
  <div className={`card border-b-4 ${color} card-hover`}>
    <div className="text-xs uppercase tracking-widest text-text-secondary mb-2">{label}</div>
    <div className={`text-5xl font-bold ${valueColor || 'text-gray-900'}`}>{value}</div>
  </div>
);

export default Dashboard;

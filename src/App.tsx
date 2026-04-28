import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './views/Dashboard';
import ScannerView from './views/ScannerView';

// Placeholder Views
const ThreatMap = () => <div className="p-10 card h-96 flex items-center justify-center italic text-text-secondary">Visualisation Mondiale des Menaces (En cours...)</div>;
const Compliance = () => <div className="p-10 card h-96 flex items-center justify-center italic text-text-secondary">Matrice de Conformité NIST/OWASP (En cours...)</div>;
const Comparison = () => <div className="p-10 card h-96 flex items-center justify-center italic text-text-secondary">Outil de Comparatif Différentiel (En cours...)</div>;
const CVEExplorer = () => <div className="p-10 card h-96 flex items-center justify-center italic text-text-secondary">Base de Données CVE Android (En cours...)</div>;
const Academy = () => <div className="p-10 card h-96 flex items-center justify-center italic text-text-secondary">Academy & Remédiation (En cours...)</div>;

const App: React.FC = () => {
  return (
    <Router>
      <div className="flex min-h-screen bg-beige-light">
        <Sidebar />
        <main className="flex-1 lg:ml-72 p-10 lg:p-16 max-w-7xl mx-auto w-full transition-all duration-300">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/scanner" element={<ScannerView />} />
            <Route path="/threat-map" element={<ThreatMap />} />
            <Route path="/compliance" element={<Compliance />} />
            <Route path="/comparison" element={<Comparison />} />
            <Route path="/cve" element={<CVEExplorer />} />
            <Route path="/academy" element={<Academy />} />
            <Route path="/analytics" element={<div className="p-10 card h-96 flex items-center justify-center italic text-text-secondary">Statistiques Avancées (En cours...)</div>} />
            <Route path="/settings" element={<div className="p-10 card h-96 flex items-center justify-center italic text-text-secondary">Paramètres de la Suite (En cours...)</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;

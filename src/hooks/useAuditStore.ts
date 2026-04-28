import { useState, useEffect } from 'react';
import { DeviceData, CategoryScore, Vulnerability } from '../engine/ScannerEngine';

export interface AuditResult {
  id: string;
  date: string;
  deviceName: string;
  data: DeviceData;
  globalScore: number;
  categoryScores: Record<string, number>;
  vulns: Vulnerability[];
}

export const useAuditStore = () => {
  const [history, setHistory] = useState<AuditResult[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('dirs_audit_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  const addAudit = (audit: AuditResult) => {
    const newHistory = [audit, ...history].slice(0, 20);
    setHistory(newHistory);
    localStorage.setItem('dirs_audit_history', JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('dirs_audit_history');
  };

  return {
    history,
    addAudit,
    clearHistory
  };
};

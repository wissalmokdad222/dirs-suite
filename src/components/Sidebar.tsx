import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  Globe, 
  ClipboardCheck, 
  GitCompare, 
  Bug, 
  GraduationCap, 
  BarChartBig, 
  Settings2,
  Menu,
  X
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { id: 'threat-map', label: 'Threat Intelligence', icon: Globe, path: '/threat-map' },
  { id: 'scanner', label: 'Audit Scanner', icon: ShieldCheck, path: '/scanner' },
  { id: 'compliance', label: 'Compliance Matrix', icon: ClipboardCheck, path: '/compliance' },
  { id: 'comparison', label: 'Comparateur', icon: GitCompare, path: '/comparison' },
  { id: 'cve', label: 'Base CVE', icon: Bug, path: '/cve' },
  { id: 'academy', label: 'Academy', icon: GraduationCap, path: '/academy' },
];

const secondaryItems = [
  { id: 'analytics', label: 'Statistiques', icon: BarChartBig, path: '/analytics' },
  { id: 'settings', label: 'Paramètres', icon: Settings2, path: '/settings' },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside className={`
        fixed top-0 left-0 h-full bg-white border-r border-beige-dark transition-all duration-300 z-40
        ${isOpen ? 'w-72' : 'w-0 lg:w-20 overflow-hidden'}
      `}>
        <div className="p-8 flex flex-col h-full gap-10">
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-gray-900">DIRS Allianz</span>
            <span className="text-[10px] tracking-[0.2em] font-bold text-primary uppercase mt-1">
              Secure Ecosystem
            </span>
          </div>

          <nav className="flex flex-col gap-1 flex-1">
            {navItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                <item.icon size={18} />
                <span className={isOpen ? 'opacity-100' : 'opacity-0 lg:hidden'}>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="border-t border-beige-dark pt-6 flex flex-col gap-1">
            {secondaryItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                <item.icon size={18} />
                <span className={isOpen ? 'opacity-100' : 'opacity-0 lg:hidden'}>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

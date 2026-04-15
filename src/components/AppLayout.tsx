import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UserPlus, 
  Users, 
  BarChart3, 
  Bell, 
  LogOut, 
  ShieldCheck, 
  GraduationCap, 
  ChevronRight,
  ClipboardCheck, 
  Settings as SettingsIcon 
} from 'lucide-react';
import { getAlerts } from '@/lib/store';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import Logo from './Logo';

const allNavItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/students', label: 'Student List', icon: Users },
  { to: '/quarterly-entry', label: 'Health Desk', icon: ClipboardCheck }, 
  { to: '/add-student', label: 'Enroll Student', icon: UserPlus },
  { to: '/class-report', label: 'Performance', icon: BarChart3 },
  { to: '/alerts', label: 'Alerts', icon: Bell },
  { to: '/manage-users', label: 'Management', icon: ShieldCheck, adminOnly: true },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user, logout, isAdmin, activeQuarter, isWindowOpen } = useAuth();
  
  const allAlerts = getAlerts() || [];
  const filteredAlerts = isAdmin 
    ? allAlerts 
    : allAlerts.filter(a => a.className === user?.assignedClass);

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      
      <aside className="w-72 flex flex-col bg-[#1E293B] text-slate-300 shadow-2xl relative z-50">
        
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1.5 rounded-xl shadow-lg">
               <Logo className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tighter uppercase leading-none">
                Baal <span className="text-blue-500">Aarogya</span>
              </h1>
              <div className="flex items-center gap-1.5 mt-1">
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full animate-pulse",
                  isWindowOpen ? "bg-emerald-500" : "bg-slate-500"
                )} />
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">
                  {activeQuarter} {isWindowOpen ? 'ASSESSMENT OPEN' : 'REGISTRY ONLY'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {user && (
          <div className="mx-6 mb-6 p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                {isAdmin ? (
                  <ShieldCheck className="w-5 h-5 text-blue-400" />
                ) : (
                  <GraduationCap className="w-5 h-5 text-emerald-400" />
                )}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-black text-white truncate uppercase tracking-wide leading-none">
                  {user.username}
                </p>
                <p className="text-[9px] text-slate-500 font-bold uppercase mt-1 truncate">
                  {isAdmin ? 'System Admin' : `Class ${user.assignedClass} Teacher`}
                </p>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 px-4 space-y-1.5 mt-2 overflow-y-auto scrollbar-hide">
          {allNavItems.map(item => {
            if (item.adminOnly && !isAdmin) return null;
            const active = location.pathname === item.to;
            
            return (
              <Link 
                key={item.to} 
                to={item.to} 
                className={`group flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 border ${
                  active 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-500/20 translate-x-1' 
                    : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <item.icon className={`w-5 h-5 transition-colors ${active ? 'text-white' : 'text-slate-500 group-hover:text-slate-400'}`} />
                <span className="flex-1">{item.label}</span>
                
                {item.label === 'Health Desk' && isWindowOpen && (
                  <span className="bg-emerald-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-lg animate-bounce">
                    ACTION
                  </span>
                )}

                {item.label === 'Alerts' && filteredAlerts.length > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-lg animate-pulse">
                    {filteredAlerts.length}
                  </span>
                )}
                {active && <ChevronRight className="ml-auto w-4 h-4 opacity-50" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 mt-auto border-t border-white/5 space-y-4">
          <button 
            onClick={logout} 
            className="flex items-center gap-3 w-full px-5 py-4 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:text-red-400 hover:bg-red-400/5 transition-all group"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> 
            Sign Out
          </button>
          <p className="text-[8px] text-slate-600 font-bold text-center uppercase tracking-[0.3em]">
            © 2026 BAAL AAROGYA • V1.0
          </p>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-12 bg-[#F8FAFC] scrollbar-hide">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
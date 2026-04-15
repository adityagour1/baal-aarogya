import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UserPlus, 
  Upload, 
  Users, 
  BarChart3, 
  Bell, 
  LogOut, 
  ShieldCheck, 
  GraduationCap, 
  Activity, 
  ChevronRight,
  ClipboardCheck,
  Star, // NEW: Added for the Success Logic
  Settings as SettingsIcon 
} from 'lucide-react';
import { getAlerts, getClassHealthScore } from '@/lib/store';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

const allNavItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/students', label: 'Student List', icon: Users },
  { to: '/quarterly-entry', label: 'Health Desk', icon: ClipboardCheck }, 
  { to: '/add-student', label: 'Enroll Student', icon: UserPlus },
  { to: '/bulk-upload', label: 'Bulk Upload', icon: Upload },
  { to: '/class-report', label: 'Performance', icon: BarChart3 },
  { to: '/alerts', label: 'Alerts', icon: Bell },
  { to: '/manage-users', label: 'Management', icon: ShieldCheck, adminOnly: true },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user, logout, isAdmin, activeQuarter, isWindowOpen } = useAuth();
  
  // Logic: Fetch and filter alerts based on role and class assignment
  const allAlerts = getAlerts() || [];
  const filteredAlerts = isAdmin 
    ? allAlerts 
    : allAlerts.filter(a => a.className === user?.assignedClass);

  // Success Logic for Sidebar Star
  const classStats = !isAdmin && user?.assignedClass ? getClassHealthScore(user.assignedClass) : null;
  const isHighPerforming = classStats && classStats.score >= 80;

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      
      {/* --- SIDEBAR SECTION --- */}
      <aside className="w-72 flex flex-col bg-[#1E293B] text-slate-300 shadow-2xl relative z-50">
        
        {/* Branding & Active Session Status */}
        <div className="p-8 pb-10">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 ring-4 ring-blue-500/10">
              <Activity className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tighter uppercase leading-none">
                Baal <span className="text-blue-500">Aarogya</span>
              </h1>
              <div className="flex items-center gap-1.5 mt-1.5">
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  isWindowOpen ? "bg-emerald-500 animate-pulse" : "bg-slate-500"
                )} />
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">
                  {activeQuarter} • {isWindowOpen ? 'ACTIVE PHASE' : 'REGISTRY'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* User Identity Card - Enhanced with Glassmorphism */}
        {user && (
          <div className="mx-6 mb-8 p-4 rounded-[1.5rem] bg-white/[0.03] border border-white/5 backdrop-blur-md group hover:bg-white/[0.05] transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-b from-white/10 to-transparent flex items-center justify-center shrink-0 shadow-inner">
                {isAdmin ? (
                  <ShieldCheck className="w-5 h-5 text-blue-400" />
                ) : (
                  <GraduationCap className="w-5 h-5 text-emerald-400" />
                )}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-black text-white truncate uppercase tracking-wide leading-none group-hover:text-blue-400 transition-colors">
                  {user.username}
                </p>
                <p className="text-[9px] text-slate-500 font-black uppercase mt-1.5 truncate tracking-tighter opacity-70">
                  {isAdmin ? 'System Management' : `Class ${user.assignedClass} Faculty`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Section Label */}
        <p className="px-9 text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4">Navigation</p>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto scrollbar-hide">
          {allNavItems.map(item => {
            if (item.adminOnly && !isAdmin) return null;
            const active = location.pathname === item.to;
            
            return (
              <Link 
                key={item.to} 
                to={item.to} 
                className={cn(
                  "group flex items-center gap-3 px-5 py-4 rounded-[1.2rem] text-sm font-bold transition-all duration-300 border relative overflow-hidden",
                  active 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-400/20 shadow-xl shadow-blue-500/20 translate-x-1.5' 
                    : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/[0.03] hover:translate-x-1'
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 transition-transform duration-300",
                  active ? 'text-white scale-110' : 'text-slate-500 group-hover:text-slate-400 group-hover:scale-110'
                )} />
                <span className="flex-1 tracking-tight">{item.label}</span>
                
                {/* Gold Class Star */}
                {item.label === 'Performance' && isHighPerforming && (
                   <div className="flex items-center gap-1 ml-auto">
                     <Star className="w-3 h-3 fill-amber-400 text-amber-400 animate-pulse" />
                     <span className="text-[8px] font-black text-amber-400 uppercase tracking-tighter">Gold</span>
                   </div>
                )}

                {/* Notification Badge */}
                {item.label === 'Alerts' && filteredAlerts.length > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-lg animate-pulse ml-auto">
                    {filteredAlerts.length}
                  </span>
                )}

                {/* Health Desk Badge */}
                {item.label === 'Health Desk' && isWindowOpen && (
                  <span className="bg-emerald-500 text-white text-[8px] font-black px-2 py-0.5 rounded-md shadow-lg animate-bounce uppercase">
                    New
                  </span>
                )}
                
                {active && <ChevronRight className="w-4 h-4 text-white/30" />}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-6 mt-auto border-t border-white/5 bg-black/10">
          <button 
            onClick={logout} 
            className="flex items-center gap-3 w-full px-5 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-400 hover:bg-red-400/5 transition-all duration-500 group"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> 
            Sign Out
          </button>
          <p className="text-[8px] text-slate-600 font-bold text-center uppercase tracking-[0.3em] mt-4 opacity-40">
            © 2026 BAAL AAROGYA • V1.0
          </p>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-12 bg-[#F8FAFC] scrollbar-hide">
        <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
          {children}
        </div>
      </main>
    </div>
  );
}
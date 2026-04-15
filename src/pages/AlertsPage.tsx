import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAlerts } from '@/lib/store';
import { Bell, AlertTriangle, AlertCircle, Info, ChevronRight, Inbox, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const iconMap = { 
  critical: AlertTriangle, 
  warning: AlertCircle, 
  info: Info 
};

const statusConfig = {
  critical: {
    bg: 'bg-red-50/30 border-red-100',
    icon: 'text-red-600', 
    indicator: 'bg-red-600',
    btn: 'hover:text-red-600 hover:bg-red-100/50'
  },
  warning: {
    bg: 'bg-amber-50/30 border-amber-100',
    icon: 'text-amber-600', 
    indicator: 'bg-amber-600',
    btn: 'hover:text-amber-600 hover:bg-amber-100/50'
  },
  info: {
    bg: 'bg-blue-50/30 border-blue-100',
    icon: 'text-blue-600', 
    indicator: 'bg-blue-600',
    btn: 'hover:text-blue-600 hover:bg-blue-100/50'
  }
};

export default function AlertsPage() {
  const { user, isAdmin } = useAuth(); 
  const allAlerts = getAlerts() || [];

  const filteredAlerts = isAdmin 
    ? allAlerts 
    : allAlerts.filter(alert => alert.className === user?.assignedClass);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 animate-in fade-in duration-700 pb-20">
      
      {/* 1. BALANCED HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3 uppercase tracking-tighter">
            <Bell className="w-7 h-7 text-blue-600" /> 
            Health Notifications
          </h1>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.25em] mt-1.5">
            {isAdmin ? 'Institutional Risk Monitoring' : `Class ${user?.assignedClass} Targeted Feed`}
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 px-5 rounded-2xl border border-slate-100 shadow-sm">
           <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
             {filteredAlerts.length} ACTIVE ISSUES
           </span>
        </div>
      </div>

      {/* 2. ALERT FEED */}
      {filteredAlerts.length === 0 ? (
        <Card className="border-none shadow-sm rounded-[3rem] bg-white overflow-hidden">
          <CardContent className="py-32 text-center flex flex-col items-center">
            <div className="h-24 w-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-8 border border-slate-100 shadow-inner">
              <CheckCircle2 className="w-10 h-10 text-emerald-300" />
            </div>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">System Status: Optimal</h2>
            <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest mt-3 max-w-xs leading-relaxed">
              No health concerns detected in the current jurisdiction. All student growth metrics remain stable.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => {
            const type = (alert.type as keyof typeof statusConfig) || 'info';
            const config = statusConfig[type];
            const Icon = iconMap[type] || Info;

            return (
              <Card 
                key={alert.id} 
                className={cn(
                  "border-none shadow-sm rounded-[2rem] bg-white transition-all duration-300 hover:translate-x-1 group overflow-hidden",
                  config.bg
                )}
              >
                <CardContent className="p-0 flex items-stretch min-h-[120px]">
                  {/* Status Indicator Bar */}
                  <div className={cn("w-1.5 shrink-0", config.indicator)} />
                  
                  <div className="p-6 flex flex-col md:flex-row md:items-center gap-6 flex-1">
                    {/* Icon Housing */}
                    <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-white/50 shrink-0 group-hover:scale-110 transition-transform">
                      <Icon className={cn("w-7 h-7 stroke-[2.5]", config.icon)} />
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                         <Badge className={cn(
                           "border-none px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest",
                           type === 'critical' ? 'bg-red-600 text-white' : 'bg-white text-slate-500 border border-slate-100'
                         )}>
                           {type}
                         </Badge>
                         <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                           REF: {alert.id.split('-').pop()?.toUpperCase()}
                         </span>
                      </div>
                      
                      <h3 className="text-base font-black text-slate-800 tracking-tight leading-tight">
                        {alert.message}
                      </h3>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Target Class:</span>
                           <span className="text-[10px] font-black text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded-md">{alert.className}</span>
                        </div>
                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                          {new Date(alert.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                    </div>

                    {/* Quick Link */}
                    <div className="shrink-0 pt-4 md:pt-0">
                      <Link to={`/students?class=${alert.className}`}>
                        <Button 
                          variant="ghost" 
                          className={cn(
                            "w-full md:w-auto px-6 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all", 
                            config.btn
                          )}
                        >
                          Review Data <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* FOOTER */}
      <div className="flex flex-col items-center gap-2 pt-10 opacity-30">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">
          Automated WHO-BMI Baseline Monitoring
        </p>
        <div className="h-px w-20 bg-slate-200" />
      </div>
    </div>
  );
}
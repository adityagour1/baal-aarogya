import { useState, useMemo } from 'react';
import { Users, AlertTriangle, Heart, TrendingDown, Activity, BarChart3, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip 
} from 'recharts';
import StatCard from '@/components/StatCard';
import { getStudents, getClassSummaries } from '@/lib/store';
import { useAuth } from '@/lib/auth';
import PriorityList from './PriorityList'; // RESTORED IMPORT
import { cn } from '@/lib/utils';

const CHART_COLORS = {
  normal: '#10B981',           
  underweight: '#F59E0B',        
  overweight: '#64748B',         
  obese: '#7E22CE',             
  severelyUnderweight: '#EF4444', 
};

export default function Dashboard() {
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);
  const { user, isAdmin, activeQuarter } = useAuth();
  
  const allStudents = getStudents();
  const allSummaries = getClassSummaries();

  // Role-Based Filtering
  const filteredStudents = useMemo(() => {
    return isAdmin ? allStudents : allStudents.filter(s => s.className === user?.assignedClass);
  }, [allStudents, user, isAdmin]);

  const filteredSummaries = useMemo(() => {
    return isAdmin ? allSummaries : allSummaries.filter(s => s.className === user?.assignedClass);
  }, [allSummaries, user, isAdmin]);

  // Derived Metrics
  const totalStudents = filteredStudents.length;
  const normalCount = filteredStudents.filter(s => s.bmiStatus === 'normal').length;
  const criticalCount = filteredStudents.filter(s => s.bmiStatus === 'severely-underweight').length;
  const underweightCount = filteredStudents.filter(s => s.bmiStatus === 'underweight').length;
  const totalUW = criticalCount + underweightCount;
  const underweightPct = totalStudents > 0 ? Math.round((totalUW / totalStudents) * 100) : 0;

  const pieData = [
    { name: 'Severely UW', value: criticalCount, key: 'severelyUnderweight' },
    { name: 'Underweight', value: underweightCount, key: 'underweight' },
    { name: 'Normal', value: normalCount, key: 'normal' },
    { name: 'Others', value: filteredStudents.filter(s => s.bmiStatus === 'obese' || s.bmiStatus === 'overweight').length, key: 'overweight' },
  ].filter(d => d.value > 0);

  const barData = filteredSummaries.map(s => ({
    name: s.className,
    "Critical": s.severelyUnderweight,
    "Warning": s.underweight,
    "Normal": s.normal,
  }));

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* 1. HEADER */}
      <div className="px-2 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800 uppercase leading-none">
              {isAdmin ? 'Institutional Health Systems' : `Class ${user?.assignedClass} Performance`}
          </h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em] mt-2">
            Baal Aarogya • {activeQuarter} Phase
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl border border-slate-100 shadow-sm">
           <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Live Sync Active</span>
        </div>
      </div>

      {/* 2. STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Registry" value={totalStudents} subtitle="Active Students" icon={Users} variant="primary" />
        <StatCard title="Nutritional Risk" value={`${underweightPct}%`} subtitle={`${totalUW} Students`} icon={TrendingDown} variant="warning" />
        <StatCard title="Healthy Count" value={normalCount} subtitle="Normal Range" icon={Heart} variant="success" />
        <StatCard title="Critical Care" value={criticalCount} subtitle="Immediate Focus" icon={AlertTriangle} variant="critical" />
      </div>

      {/* 3. TEACHER COMPLIANCE BANNER */}
      {!isAdmin && (
        <Card className="rounded-[2.5rem] border-none shadow-sm bg-blue-600 p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
          <div className="flex items-center gap-6 relative z-10">
            <div className="h-16 w-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tighter italic">Phase Compliance</h3>
              <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest mt-1">Status: Assessment Window Open</p>
              <p className="text-sm mt-3 opacity-90 leading-relaxed font-medium max-w-2xl">
                Please ensure all quarterly biometrics are finalized. Critical cases identified in your class will appear in the priority list below.
              </p>
            </div>
          </div>
          <Activity className="absolute -right-10 -bottom-10 w-48 h-48 opacity-10 rotate-12 transition-transform duration-1000" />
        </Card>
      )}

      {/* 4. CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border-none shadow-sm rounded-[2.5rem] bg-white group">
          <CardHeader className="border-b border-slate-50 pb-4">
            <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" /> Composition Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8 relative">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={75}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={12}
                    onMouseEnter={(_, index) => setHoveredSlice(index)}
                    onMouseLeave={() => setHoveredSlice(null)}
                  >
                    {pieData.map((entry, index) => (
                      <Cell 
                        key={index} 
                        fill={CHART_COLORS[entry.key as keyof typeof CHART_COLORS]} 
                        className="outline-none transition-all duration-300"
                        opacity={hoveredSlice === null || hoveredSlice === index ? 1 : 0.4}
                      />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '14px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', fontWeight: 'black', fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-4">
                <p className="text-4xl font-black text-slate-800 tracking-tighter">{totalStudents}</p>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-none shadow-sm rounded-[2.5rem] bg-white">
          <CardHeader className="border-b border-slate-50 pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-500" /> {isAdmin ? 'Institutional Variance' : 'Student Status Mapping'}
            </CardTitle>
            <div className="flex gap-4">
               <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-[#EF4444]" /><span className="text-[8px] font-black text-slate-400 uppercase tracking-tight">Critical</span></div>
               <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-[#10B981]" /><span className="text-[8px] font-black text-slate-400 uppercase tracking-tight">Normal</span></div>
            </div>
          </CardHeader>
          <CardContent className="pt-8 px-6">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#94A3B8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#CBD5E1', fontWeight: 'bold' }} />
                <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }} />
                <Bar dataKey="Critical" fill={CHART_COLORS.severelyUnderweight} radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="Warning" fill={CHART_COLORS.underweight} radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="Normal" fill={CHART_COLORS.normal} radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 5. RESTORED: PRIORITY INTERVENTION LIST */}
      <div className="grid grid-cols-1 gap-8">
        <PriorityList 
          className={isAdmin ? "" : "border-blue-100 bg-blue-50/10"} 
        />
      </div>

      <div className="text-center opacity-30 pt-10 pb-4">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">
          BAAL AAROGYA MANAGEMENT SYSTEM • 2026
        </p>
      </div>
    </div>
  );
}
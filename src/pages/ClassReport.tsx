import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { 
  getStudents, 
  getAvailableClasses, 
  getStudentTrend,
  getClassHealthScore,
  getClassImprovementRate
} from '@/lib/store';
import { statusLabel } from '@/lib/bmi';
import { 
  BarChart3, Users, Activity, TrendingUp, Medal, Star, 
  Check, PieChart as PieIcon, FileText, FileSpreadsheet, 
  Calendar, Award, Presentation, ChevronRight
} from 'lucide-react';
import { Quarter, BmiStatus } from '@/lib/types';
import { useAuth } from '@/lib/auth';
import { exportClassReportPDF, exportClassReportExcel } from '@/lib/export';
import { cn } from '@/lib/utils';

const PIE_COLORS: Record<string, string> = { 
  'Severely Underweight': '#DC2626', 
  'Underweight': '#F59E0B', 
  'Normal': '#10B981', 
  'Other': '#64748B' 
};

export default function ClassReport() {
  const { isAdmin, user, activeQuarter } = useAuth();
  const [selectedClass, setSelectedClass] = useState(isAdmin ? 'ALL' : (user?.assignedClass || ''));
  const [selectedQuarter, setSelectedQuarter] = useState<Quarter | 'Full Year'>(activeQuarter);
  
  const isSchoolView = selectedClass === 'ALL';
  const classes = getAvailableClasses();

  // 1. Data Logic
  const rawStudents = useMemo(() => 
    isSchoolView ? getStudents() : getStudents().filter(s => s.className === selectedClass),
  [selectedClass]);

  // UPDATE: Ensure 'Full Year' passes all students, specific quarter filters for presence
  const studentsWithData = useMemo(() => {
    if (selectedQuarter === 'Full Year') return rawStudents;
    return rawStudents.filter(s => s.history.some(h => h.quarter === selectedQuarter));
  }, [rawStudents, selectedQuarter]);

  const stats = useMemo(() => {
    const summary = { normal: 0, underweight: 0, severe: 0, other: 0 };
    studentsWithData.forEach(s => {
      // Logic for summary calculation
      const dataEntries = selectedQuarter === 'Full Year' 
        ? s.history 
        : s.history.filter(h => h.quarter === selectedQuarter);

      dataEntries.forEach(data => {
        if (data.bmiStatus === 'normal') summary.normal++;
        else if (data.bmiStatus === 'underweight') summary.underweight++;
        else if (data.bmiStatus === 'severely-underweight') summary.severe++;
        else if (['overweight', 'obese'].includes(data.bmiStatus)) summary.other++;
      });
    });
    return summary;
  }, [studentsWithData, selectedQuarter]);

  const improvementRate = useMemo(() => isSchoolView ? 0 : getClassImprovementRate(selectedClass), [selectedClass, rawStudents]);
  const healthStats = useMemo(() => !isSchoolView ? getClassHealthScore(selectedClass) : null, [selectedClass, rawStudents]);
  const hasNoData = studentsWithData.length === 0;

  const pieData = [
    { name: 'Severely Underweight', value: stats.severe },
    { name: 'Underweight', value: stats.underweight },
    { name: 'Normal', value: stats.normal },
    { name: 'Other', value: stats.other },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6 p-6 bg-slate-50/30 min-h-screen pb-20">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800 uppercase leading-none">
              {isSchoolView ? 'Institutional Reports' : `Class ${selectedClass} Analytics`}
            </h1>
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] mt-2">Analytical Insights</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* UPDATED: Calling the export function with the proper context */}
          <Button 
            disabled={hasNoData} 
            onClick={() => exportClassReportPDF(selectedClass, studentsWithData, selectedQuarter)} 
            className="bg-white border-slate-200 text-slate-600 font-bold h-11 rounded-xl shadow-sm hover:bg-rose-50 hover:text-rose-600 border"
          >
            <FileText className="w-4 h-4 mr-2" /> PDF
          </Button>

          {/* New Excel Button Trigger */}
          <Button 
            disabled={hasNoData} 
            onClick={() => exportClassReportExcel(selectedClass, studentsWithData, selectedQuarter)} 
            className="bg-white border-slate-200 text-slate-600 font-bold h-11 rounded-xl shadow-sm hover:bg-emerald-50 hover:text-emerald-600 border"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" /> EXCEL
          </Button>

          <div className="flex bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
            {(['Q1', 'Q2', 'Q3', 'Q4', 'Full Year'] as const).map(q => (
              <button key={q} onClick={() => setSelectedQuarter(q)} className={cn("px-4 py-1.5 text-[9px] font-black rounded-lg transition-all", selectedQuarter === q ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600')}>
                {q}
              </button>
            ))}
          </div>
          {isAdmin && (
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-[160px] bg-white border-slate-200 h-11 rounded-xl font-black text-slate-700">
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="ALL" className="font-black text-blue-600 italic">🏫 ALL CLASSES</SelectItem>
                {classes.map(c => <SelectItem key={c} value={c} className="font-bold">Class {c}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* 1. TEACHER APPRECIATION BANNER */}
      {!isSchoolView && healthStats && healthStats.score >= 70 && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-[2.5rem] p-10 text-white shadow-xl shadow-emerald-500/20 mb-6 flex items-center justify-between relative overflow-hidden border-none animate-in fade-in zoom-in duration-500">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
                <Medal className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-100">Performance Recognition</span>
            </div>
            <h2 className="text-4xl font-black tracking-tighter uppercase mb-2">
              {healthStats.status} Progress!
            </h2>
            <p className="text-sm font-bold opacity-90 max-w-md leading-relaxed">
              Kudos! Your class maintains a {healthStats.score}% Healthy Index. Your dedication to monitoring student nutrition is showing real results.
            </p>
          </div>
          <div className="h-32 w-32 bg-white/10 rounded-[2.5rem] flex items-center justify-center backdrop-blur-xl border border-white/20 relative z-10 shadow-2xl rotate-12">
             <Star className="w-16 h-16 fill-white text-white animate-pulse" />
          </div>
          <Award className="absolute -right-10 -bottom-10 w-64 h-64 opacity-10 -rotate-12" />
        </div>
      )}

      {/* 2. PROGRESS BANNER */}
      {!isSchoolView && improvementRate > 0 && healthStats?.score < 70 && (
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-[2.5rem] p-10 relative overflow-hidden border-none shadow-xl mb-6">
            <Star className="absolute -right-4 -top-4 w-40 h-40 opacity-10 rotate-12" />
            <h2 className="text-5xl font-black tracking-tighter">{improvementRate}% Health Recovery</h2>
            <p className="text-sm font-medium opacity-80 mt-4 max-w-lg">Positive nutritional shift detected in Class {selectedClass}.</p>
        </Card>
      )}

      {/* 3. ANALYTICS GRID */}
      {hasNoData ? (
        <div className="py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
          <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-xs font-black text-slate-300 uppercase tracking-[0.3em]">No Data Found for {selectedQuarter}</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <ReportStat label="Assessed" value={studentsWithData.length} color="bg-slate-900" icon={Users} />
            <ReportStat label="Healthy" value={stats.normal} color="bg-emerald-500" icon={Check} />
            <ReportStat label="Warning" value={stats.underweight} color="bg-amber-500" icon={Activity} />
            <ReportStat label="Critical" value={stats.severe} color="bg-rose-500" icon={TrendingUp} />
            <ReportStat label="Others" value={stats.other} color="bg-slate-500" icon={PieIcon} />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="rounded-[2.5rem] bg-white border-none shadow-sm p-10">
              <CardTitle className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-10 flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-blue-500" /> Nutritional Distribution
              </CardTitle>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={85} outerRadius={115} paddingAngle={10} dataKey="value" stroke="none" cornerRadius={8}>
                      {pieData.map((entry, i) => <Cell key={i} fill={PIE_COLORS[entry.name] || '#64748B'} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', fontWeight: 'black', textTransform: 'uppercase', fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="rounded-[2.5rem] bg-white border-none shadow-sm overflow-hidden flex flex-col">
              <CardHeader className="border-b border-slate-50 px-10 py-8">
                <CardTitle className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center justify-between">
                  Recovery Tracker <Badge variant="outline" className="text-[8px] font-black">{selectedQuarter}</Badge>
                </CardTitle>
              </CardHeader>
              <div className="flex-1 overflow-y-auto max-h-[400px]">
                <div className="divide-y divide-slate-50">
                  {studentsWithData.map(s => {
                    const trend = getStudentTrend(s);
                    return (
                      <div key={s.id} className="p-6 px-10 flex items-center justify-between hover:bg-slate-50/50 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-xs text-slate-500">{s.name.charAt(0)}</div>
                          <div>
                            <p className="text-sm font-black text-slate-700 leading-none uppercase">{s.name}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase mt-2">{statusLabel(s.bmiStatus as BmiStatus)}</p>
                          </div>
                        </div>
                        {trend === 'IMPROVED' && <Badge className="bg-emerald-50 text-emerald-600 border-none text-[8px] font-black px-3">RECOVERY ↑</Badge>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* 4. ADMIN LEADERBOARD */}
      {isSchoolView && isAdmin && (
        <Card className="rounded-[3rem] bg-white border-none shadow-sm p-10 mt-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] mb-2 flex items-center gap-2">
                <Presentation className="w-4 h-4 text-[#3B82F6]" /> Institutional Performance Leaderboard
              </h3>
              <p className="text-sm font-black text-slate-800 uppercase tracking-tighter">Class Health Rankings</p>
            </div>
            <Badge className="bg-blue-600 text-white border-none font-black text-[10px] uppercase px-4 py-1.5 rounded-xl">Global View</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((cls, index) => {
              const scoreData = getClassHealthScore(cls);
              return (
                <div key={cls} className="p-8 rounded-[2.5rem] border border-slate-50 bg-slate-50/50 hover:bg-white hover:shadow-2xl hover:shadow-blue-500/10 transition-all group relative overflow-hidden">
                  <div className="flex items-center justify-between mb-6 relative z-10">
                    <span className="h-10 w-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xs font-black shadow-lg">#{index + 1}</span>
                    <Badge className={cn("border-none font-black text-[8px] uppercase px-4 py-1 rounded-lg", scoreData.score >= 80 ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500")}>
                      {scoreData.status}
                    </Badge>
                  </div>
                  <h4 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-1">Class {cls}</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">{scoreData.total} Students Monitored</p>
                  
                  <div className="space-y-3 relative z-10">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                      <span className="text-slate-400">Health Index</span>
                      <span className="text-blue-600">{scoreData.score}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden p-0.5">
                      <div className={cn("h-full rounded-full transition-all duration-1000", scoreData.score >= 80 ? "bg-emerald-500" : "bg-blue-600")} style={{ width: `${scoreData.score}%` }} />
                    </div>
                  </div>
                  <Activity className="absolute -right-4 -bottom-4 w-24 h-24 opacity-5 text-blue-600 group-hover:scale-110 transition-transform" />
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

function ReportStat({ label, value, color, icon: Icon }: { label: string, value: number, color: string, icon: any }) {
  return (
    <Card className={`${color} text-white p-8 rounded-[2rem] text-center shadow-lg border-none relative overflow-hidden group`}>
      <Icon className="absolute -right-2 -top-2 w-16 h-16 opacity-10 group-hover:scale-110 transition-transform duration-500" />
      <p className="text-[10px] font-black uppercase opacity-60 mb-2 tracking-widest relative z-10">{label}</p>
      <p className="text-4xl font-black relative z-10 tracking-tighter">{value}</p>
    </Card>
  );
}
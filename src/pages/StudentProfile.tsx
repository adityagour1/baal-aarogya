import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// -- CORE LOGIC & AUTH --
import { getStudentById, getStudentTrend } from '../lib/store'; 
import { statusLabel, getRecommendations } from '../lib/bmi'; 
import { calculateAge, cn } from '../lib/utils'; 
import { useAuth } from '../lib/auth';

// -- ICONS --
import { 
  ArrowLeft, History, Activity, Lightbulb, Info, Calendar, Lock, 
  TrendingUp, Ruler, Weight, ShieldCheck, Minus
} from 'lucide-react';

// -- CHARTS --
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';

// -- COMPONENTS --
import QuarterlyEntry from "@/pages/QuarterlyEntry";

const COLORS = {
  primary: '#3B82F6',   
  success: '#10B981',   
  warning: '#F59E0B',   
  critical: '#DC2626',  
  slate: '#64748B'      
};

export default function StudentProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activeQuarter, isWindowOpen } = useAuth();
  
  // Logic: Memoized student fetch to prevent re-renders
  const student = useMemo(() => id ? getStudentById(id) : undefined, [id]);

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div className="bg-white p-12 rounded-[3rem] shadow-xl text-center space-y-6 border border-slate-100">
            <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                <Info className="w-10 h-10 text-slate-200" />
            </div>
            <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Record Not Found</p>
            <Button onClick={() => navigate('/students')} variant="ghost" className="font-black uppercase text-blue-600 tracking-widest text-[10px]">
                ← Return to Database
            </Button>
        </div>
      </div>
    );
  }

  const currentAge = calculateAge(student.birthDate);
  const recommendations = getRecommendations(student.bmiStatus, currentAge);
  const trend = getStudentTrend(student);

  const getThemeColor = () => {
    const status = student.bmiStatus.toLowerCase();
    if (status === 'normal') return COLORS.success;
    if (status === 'severely-underweight') return COLORS.critical;
    if (status.includes('underweight')) return COLORS.warning;
    return COLORS.slate;
  };

  return (
    <div className="max-w-[1200px] mx-auto p-6 space-y-8 bg-slate-50/30 min-h-screen pb-24 animate-in fade-in duration-700">
      
      {/* --- SECTION 1: THE HEALTH PASSPORT HEADER --- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
        <div className="flex items-center gap-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/students')} 
            className="p-4 h-14 w-14 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all group"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
          </Button>
          
          <div className="h-20 w-20 rounded-[2rem] bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white shadow-2xl shadow-blue-500/20 relative">
             <span className="text-2xl font-black">{student.name.charAt(0)}</span>
             <div className="absolute -bottom-1 -right-1 h-7 w-7 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-white" />
             </div>
          </div>

          <div>
            <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">{student.name}</h1>
                <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[9px] px-3 py-1 rounded-lg">CLASS {student.className}</Badge>
            </div>
            <div className="flex items-center gap-4 mt-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-md">ID: {student.id}</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{currentAge} YEARS • {student.gender}</span>
            </div>
          </div>
        </div>

        <div className="h-14 px-8 bg-slate-900 text-white rounded-2xl flex flex-col justify-center shadow-lg shadow-slate-200">
            <p className="text-[8px] font-black opacity-40 uppercase tracking-[0.2em] mb-0.5">Active Quarter</p>
            <p className="text-xs font-black uppercase tracking-tight">{activeQuarter}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- LEFT COLUMN: ASSESSMENT & TIMELINE --- */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Assessment Entry - Fixed to show only THIS student */}
          {isWindowOpen ? (
            <Card className="border-none shadow-xl shadow-blue-500/5 rounded-[3rem] bg-white overflow-hidden ring-4 ring-blue-50/50">
              <CardHeader className="bg-blue-600 px-10 py-6 text-white flex flex-row items-center justify-between">
                  <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Biometric Update Phase
                  </CardTitle>
                <Badge className="bg-white/20 text-white border-none text-[8px] font-black px-4 py-1">WINDOW OPEN</Badge>
              </CardHeader>
              <CardContent className="p-0">
                {/* FIX: studentId ensures QuarterlyEntry only displays this specific record */}
                <QuarterlyEntry studentId={student.id} /> 
              </CardContent>
            </Card>
          ) : (
            <div className="bg-slate-100/50 p-8 rounded-[3rem] border-2 border-dashed border-slate-200 flex items-center justify-center gap-4 text-slate-400">
               <Lock className="w-5 h-5" />
               <p className="text-[10px] font-black uppercase tracking-widest">Growth metrics are locked until the next assessment window</p>
            </div>
          )}

          {/* Medical Growth Timeline */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Q1', 'Q2', 'Q3', 'Q4'].map((q) => {
              const data = student.history?.find((h: any) => h.quarter === q);
              return (
                <div key={q} className={cn(
                    "p-8 rounded-[2.5rem] border-2 transition-all text-center space-y-4",
                    data ? "bg-white border-slate-50 shadow-sm" : "bg-slate-50/50 border-dashed border-slate-200 opacity-50"
                )}>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{q}</p>
                  {data ? (
                    <>
                      <p className="text-4xl font-black text-slate-800 tracking-tighter">{data.bmi}</p>
                      <Badge className={cn(
                          "border-none font-black text-[8px] uppercase px-3 py-1 rounded-lg",
                          data.bmiStatus === 'normal' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                      )}>
                        {statusLabel(data.bmiStatus)}
                      </Badge>
                    </>
                  ) : (
                    <div className="py-6 flex flex-col items-center justify-center text-slate-300">
                        <Minus className="w-8 h-8" />
                        <p className="text-[8px] font-black uppercase mt-2 tracking-widest">Pending</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Longitudinal Trend Area Chart */}
          <Card className="border-none shadow-sm rounded-[3rem] bg-white overflow-hidden p-10">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2 leading-none">
                        <History className="w-4 h-4 text-blue-500" /> Physiological Analytics
                    </h3>
                    <p className="text-sm font-black text-slate-800 mt-3 uppercase tracking-tighter">Growth Velocity Trend</p>
                </div>
                <div className="flex items-center gap-2 bg-emerald-50 px-5 py-2.5 rounded-2xl border border-emerald-100">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">{trend}</span>
                </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={student.history || []}>
                  <defs>
                    <linearGradient id="colorBmi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="quarter" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 900}} />
                  <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', fontWeight: 'black', textTransform: 'uppercase', fontSize: '10px'}} />
                  <Area type="monotone" dataKey="bmi" stroke="#3B82F6" strokeWidth={5} fillOpacity={1} fill="url(#colorBmi)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* --- RIGHT COLUMN: SNAPSHOT & RECS --- */}
        <div className="space-y-8">
          
          {/* Main Clinical Snapshot */}
          <Card className="border-none shadow-2xl shadow-blue-500/10 rounded-[3.5rem] bg-white overflow-hidden text-center p-12">
                <div className="relative inline-block mb-10">
                    <div className="h-44 w-44 rounded-[3.5rem] bg-slate-50 flex flex-col items-center justify-center border border-slate-100 shadow-inner">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Latest BMI</p>
                        <p className="text-7xl font-black tracking-tighter leading-none" style={{ color: getThemeColor() }}>{student.bmi}</p>
                    </div>
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-full px-4">
                        <Badge className="w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.1em] shadow-xl border-none" style={{ backgroundColor: getThemeColor(), color: 'white' }}>
                            {statusLabel(student.bmiStatus)}
                        </Badge>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="p-6 rounded-[2.5rem] bg-slate-50 border border-slate-100">
                        <Ruler className="w-4 h-4 text-slate-300 mx-auto mb-3" />
                        <p className="text-2xl font-black text-slate-800">{student.height}<span className="text-[10px] ml-0.5 text-slate-400">cm</span></p>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Stature</p>
                    </div>
                    <div className="p-6 rounded-[2.5rem] bg-slate-50 border border-slate-100">
                        <Weight className="w-4 h-4 text-slate-300 mx-auto mb-3" />
                        <p className="text-2xl font-black text-slate-800">{student.weight}<span className="text-[10px] ml-0.5 text-slate-400">kg</span></p>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Mass</p>
                    </div>
                </div>
          </Card>

          {/* Intervention Roadmap */}
          <Card className="border-none shadow-sm rounded-[3rem] bg-white overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-10 py-8">
              <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" /> Intervention Roadmap
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-5">
              {recommendations.slice(0, 5).map((rec, i) => (
                <div key={i} className="flex gap-5 group">
                  <div className="h-7 w-7 rounded-xl bg-slate-100 text-[10px] font-black text-slate-400 flex items-center justify-center shrink-0 transition-all group-hover:bg-blue-600 group-hover:text-white">
                    {i + 1}
                  </div>
                  <p className="text-xs font-bold text-slate-600 leading-relaxed pt-1">{rec}</p>
                </div>
              ))}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
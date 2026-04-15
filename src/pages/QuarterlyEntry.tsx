import { useState, useMemo, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { getStudents, recordQuarterlyMetrics, getAvailableClasses } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Save, 
  Scale, 
  Ruler, 
  Users, 
  Lock, 
  Search,
  Activity
} from 'lucide-react';
import { Quarter } from '@/lib/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface QuarterlyEntryProps {
  studentId?: string; 
}

export default function QuarterlyEntry({ studentId }: QuarterlyEntryProps) {
  const { user, activeQuarter, isWindowOpen, isAdmin, isTeacher } = useAuth();
  const allStudents = getStudents();
  
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const [selectedClass, setSelectedClass] = useState(isAdmin ? 'all' : (user?.assignedClass || ''));
  const [searchTerm, setSearchTerm] = useState('');
  const [entries, setEntries] = useState<Record<string, { height: string; weight: string }>>({});

  const availableClasses = useMemo(() => getAvailableClasses(), [allStudents]);

  const filteredStudents = useMemo(() => {
    if (studentId) return allStudents.filter(s => s.id === studentId);

    return allStudents.filter(s => {
      const matchesClass = isTeacher 
        ? s.className === user?.assignedClass 
        : (selectedClass === 'all' ? true : s.className === selectedClass);
      
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesClass && matchesSearch;
    });
  }, [allStudents, selectedClass, searchTerm, studentId, isTeacher, user]);

  const handleInputChange = (id: string, field: 'height' | 'weight', value: string) => {
    setEntries(prev => ({
      ...prev,
      [id]: { ...(prev[id] || { height: '', weight: '' }), [field]: value }
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent, sId: string, field: 'height' | 'weight', index: number) => {
    if (e.key === 'Enter') {
      if (field === 'height') {
        inputRefs.current[`${sId}-weight`]?.focus();
      } else {
        const nextStudent = filteredStudents[index + 1];
        if (nextStudent) {
          inputRefs.current[`${nextStudent.id}-height`]?.focus();
        }
      }
    }
  };

  const handleSaveAll = () => {
    const studentsToUpdate = Object.keys(entries);
    let count = 0;

    studentsToUpdate.forEach(id => {
      const entry = entries[id];
      if (entry.height && entry.weight) {
        recordQuarterlyMetrics(id, {
          height: parseFloat(entry.height),
          weight: parseFloat(entry.weight),
          quarter: activeQuarter as Quarter
        });
        count++;
      }
    });

    if (count > 0) {
      toast.success(`Sync Success: ${count} Biometrics Updated`);
      setEntries({}); 
      setTimeout(() => window.location.reload(), 500); 
    } else {
      toast.error("Please enter data to synchronize.");
    }
  };

  if (!isWindowOpen) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center opacity-60">
        <Lock className="w-10 h-10 text-slate-300 mb-4" />
        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Phase Locked</h2>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Active Quarter: {activeQuarter}</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6 animate-in fade-in duration-500", !studentId && "max-w-6xl mx-auto p-6")}>
      
      {!studentId && (
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex items-center gap-5">
            <div className="h-14 w-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
              <Activity className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-none">Aarogya Desk</h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[9px] uppercase tracking-widest px-3">
                  {activeQuarter} Phase
                </Badge>
                {isTeacher && (
                  <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[9px] uppercase tracking-widest px-3">
                    Class {user?.assignedClass}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
            {isAdmin && (
              <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-2xl border pr-4">
                <div className="p-2 bg-white rounded-xl shadow-sm text-slate-400"><Users className="w-4 h-4" /></div>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="w-[140px] border-none bg-transparent font-black uppercase text-[11px] focus:ring-0"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">All Classes</SelectItem>
                    {availableClasses.map(cls => <SelectItem key={cls} value={cls}>Class {cls}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* VIBRANT COMMIT BUTTON - NO HOVER BLACKOUT */}
            <Button 
              onClick={handleSaveAll} 
              disabled={Object.keys(entries).length === 0} 
              className="bg-blue-600 hover:bg-blue-700 text-white h-14 px-8 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-blue-200 transition-colors border-none"
            >
              <Save className="w-4 h-4 mr-2" /> Commit Records
            </Button>
          </div>
        </div>
      )}

      {!studentId && (
        <div className="relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
          <Input className="h-16 pl-16 bg-white border-none rounded-[1.5rem] font-bold shadow-sm" placeholder="QUICK SEARCH STUDENT..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      )}

      <Card className={cn("border-none shadow-sm bg-white overflow-hidden", !studentId ? "rounded-[2.5rem]" : "rounded-none")}>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-b border-slate-100 hover:bg-transparent">
                <TableHead className="pl-10 py-6 font-black text-[10px] uppercase text-slate-400">Student Identity</TableHead>
                <TableHead className="text-center font-black text-[10px] uppercase text-slate-400">Status</TableHead>
                <TableHead className="w-[180px] text-center font-black text-[10px] uppercase text-slate-400">Height (cm)</TableHead>
                <TableHead className="w-[180px] text-center font-black text-[10px] uppercase text-slate-400">Weight (kg)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((s, idx) => {
                const hasRecord = s.history?.some(h => h.quarter === activeQuarter);
                return (
                  <TableRow key={s.id} className={cn("border-b border-slate-50 transition-colors", hasRecord && "bg-emerald-50/20")}>
                    <TableCell className="pl-10 py-5">
                      <p className="font-black text-slate-700 text-sm leading-tight uppercase tracking-tight">{s.name}</p>
                      <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">ID: {s.id.split('-').pop()}</p>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={cn("border-none text-[8px] font-black uppercase px-2 py-1", hasRecord ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700 animate-pulse")}>
                        {hasRecord ? "Completed" : "Action Req."}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="relative px-4">
                        <Ruler className="absolute left-7 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                        <Input 
                          type="number" 
                          ref={el => inputRefs.current[`${s.id}-height`] = el}
                          className="pl-9 bg-slate-50 border-none font-black rounded-xl h-11 text-center focus-visible:ring-blue-500"
                          value={entries[s.id]?.height || ''}
                          onChange={(e) => handleInputChange(s.id, 'height', e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, s.id, 'height', idx)}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="relative px-4">
                        <Scale className="absolute left-7 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                        <Input 
                          type="number" 
                          ref={el => inputRefs.current[`${s.id}-weight`] = el}
                          className="pl-9 bg-slate-50 border-none font-black rounded-xl h-11 text-center focus-visible:ring-blue-500"
                          value={entries[s.id]?.weight || ''}
                          onChange={(e) => handleInputChange(s.id, 'weight', e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, s.id, 'weight', idx)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {studentId && (
            <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-end">
               <Button onClick={handleSaveAll} disabled={Object.keys(entries).length === 0} className="bg-blue-600 text-white font-black uppercase text-[10px] h-12 px-10 rounded-xl">
                  Update Biometrics
               </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {!studentId && (
        <div className="flex justify-between items-center px-8 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
            {isTeacher ? `Phase Entry: Class ${user?.assignedClass}` : "Institutional Entry Progress"}
          </p>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-emerald-600 uppercase">
              {Math.round((filteredStudents.filter(s => s.history?.some(h => h.quarter === activeQuarter)).length / (filteredStudents.length || 1)) * 100)}% Synchronized
            </span>
            <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
               <div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: `${(filteredStudents.filter(s => s.history?.some(h => h.quarter === activeQuarter)).length / (filteredStudents.length || 1)) * 100}%` }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
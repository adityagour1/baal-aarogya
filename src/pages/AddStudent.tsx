import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { addStudent, addStudentsBulk, getStudents } from '@/lib/store';
import { useAuth } from '@/lib/auth';
import { calculateAge, cn } from '@/lib/utils';
import { calculateBmi, getBmiStatus, statusLabel } from '@/lib/bmi';
import { toast } from 'sonner';
import Papa from 'papaparse';
import { 
  UserPlus, FileSpreadsheet, Sparkles, Save, 
  UploadCloud, Download, X, Lock, AlertCircle, CheckCircle2 
} from 'lucide-react';

export default function AddStudent() {
  const navigate = useNavigate();
  const { user, isTeacher, activeQuarter, isAdmin } = useAuth();

  const [form, setForm] = useState({ 
    admissionId: '', name: '', birthDate: '', gender: 'male' as 'male' | 'female', 
    height: '', weight: '', className: '' 
  });

  const [bulkRows, setBulkRows] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isTeacher && user?.assignedClass) {
      setForm(f => ({ ...f, className: user.assignedClass }));
    }
  }, [isTeacher, user]);

  const parseDateString = (dateStr: string) => {
    if (!dateStr) return '';
    const cleanStr = String(dateStr).trim();
    const parts = cleanStr.split(/[-/]/);
    if (parts.length === 3) {
      let d = parts[0].padStart(2, '0');
      let m = parts[1].padStart(2, '0');
      let y = parts[2];
      if (y.length === 2) y = `20${y}`;
      if (d.length === 4) return cleanStr.replace(/\//g, '-');
      return `${y}-${m}-${d}`;
    }
    return cleanStr;
  };

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.admissionId || !form.name || !form.birthDate || !form.className) {
      return toast.error('Required fields missing');
    }
    
    try {
      // Pass user's assigned class for strict validation
      addStudent({
        ...form,
        admissionId: form.admissionId.trim().toUpperCase(),
        name: form.name.trim().toUpperCase(),
        className: form.className.trim().toUpperCase(),
      }, activeQuarter, user?.assignedClass); 
      
      toast.success(`${form.name} Enrolled Successfully`);
      navigate('/students');
    } catch (err: any) {
      toast.error(err.message || "Enrollment Failed");
    }
  };

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.name.endsWith('.csv')) {
      return toast.error("Please upload a valid CSV file");
    }

    setIsProcessing(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const existingStudents = getStudents();
          const existingIds = new Set(existingStudents.map(s => s.id));

          const parsed = results.data.map((raw: any) => {
            const admissionId = (raw.AdmissionID || raw.admissionId || raw.RollNo || raw.id || '').trim().toUpperCase();
            const rawDate = raw.BirthDate || raw.birthDate || raw.DOB || raw.dob;
            const className = (raw.Class || raw.className || '').trim().toUpperCase();
            
            if (!rawDate || !admissionId) return null;

            const standardizedDate = parseDateString(rawDate);
            const age = calculateAge(standardizedDate);
            const height = parseFloat(raw.Height || 0);
            const weight = parseFloat(raw.Weight || 0);
            const gender = (raw.Gender || 'male').toLowerCase().trim() as any;
            const bmi = (height > 0 && weight > 0) ? calculateBmi(height, weight) : 0;

            // Check if student belongs to teacher's class
            const isWrongClass = isTeacher && user?.assignedClass && className !== user.assignedClass;
            const isDuplicate = existingIds.has(admissionId);

            return {
              admissionId,
              name: (raw.Name || "Unknown").toUpperCase(),
              birthDate: standardizedDate,
              age, gender, height, weight,
              className,
              bmi,
              bmiStatus: getBmiStatus(bmi, age, gender),
              isDuplicate,
              isWrongClass,
              isValid: !isDuplicate && !isWrongClass
            };
          }).filter(Boolean);

          setBulkRows(parsed);
          const validCount = parsed.filter(p => p.isValid).length;
          toast.info(`Found ${validCount} valid students to enroll.`);
        } catch (err) {
          toast.error("Format error in CSV.");
        } finally {
          setIsProcessing(false);
          e.target.value = ''; // Reset input
        }
      },
    });
  }, [isTeacher, user, getStudents]);

  const handleBulkSave = () => {
    const validRows = bulkRows.filter(r => r.isValid);
    
    if (validRows.length === 0) {
      return toast.error("No valid students to enroll. Check for duplicates or class errors.");
    }

    const result = addStudentsBulk(validRows, activeQuarter, user?.assignedClass);
    toast.success(`Successfully Enrolled ${result.added} Students`);
    navigate('/students');
  };

  const handleDownloadTemplate = () => {
    const csvContent = "AdmissionID,Name,BirthDate,Gender,Class,Height,Weight\nRBU-101,RAHUL SHARMA,20-05-2015,male,5A,142,35";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Baal_Aarogya_Template.csv';
    a.click();
  };

  const validCount = bulkRows.filter(r => r.isValid).length;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <UserPlus className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-none">Enrollment Center</h1>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.25em] mt-2">Registry Management & Mass Ingestion</p>
          </div>
        </div>
        <Button variant="outline" onClick={handleDownloadTemplate} className="h-12 text-[9px] font-black uppercase tracking-widest rounded-xl bg-white border-slate-100 text-slate-400 shadow-sm hover:text-blue-600">
          <Download className="w-4 h-4 mr-2" /> Download Template
        </Button>
      </div>

      <Tabs defaultValue="single" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-16 bg-slate-100 p-1.5 rounded-[1.5rem] mb-10">
          <TabsTrigger value="single" className="rounded-xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:text-blue-600 shadow-none">
            <Sparkles className="w-4 h-4 mr-2" /> Single Entry
          </TabsTrigger>
          <TabsTrigger value="bulk" className="rounded-xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:text-emerald-600 shadow-none">
            <FileSpreadsheet className="w-4 h-4 mr-2" /> Batch Upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="single">
          <Card className="border-none shadow-sm rounded-[2.5rem] bg-white">
            <CardContent className="p-10 md:p-16">
              <form onSubmit={handleSingleSubmit} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-1 space-y-3">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Admission ID / Roll No</Label>
                    <Input required className="bg-slate-50 border-none h-14 font-black rounded-2xl px-6 text-slate-700" placeholder="E.G. RBU-001" value={form.admissionId} onChange={e => setForm(f => ({ ...f, admissionId: e.target.value.toUpperCase() }))} />
                  </div>
                  <div className="md:col-span-1 space-y-3">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Class ID</Label>
                    <div className="relative">
                      <Input disabled={isTeacher} required className="bg-slate-50 border-none h-14 font-black rounded-2xl px-6 uppercase" placeholder="E.G. 5A" value={form.className} onChange={e => setForm(f => ({ ...f, className: e.target.value.toUpperCase() }))} />
                      {isTeacher && <Lock className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />}
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Identity (Name)</Label>
                    <Input required className="bg-slate-50 border-none h-14 font-black rounded-2xl px-6 text-slate-700" placeholder="E.G. RAHUL VERMA" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value.toUpperCase() }))} />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date of Birth</Label>
                    <Input required type="date" className="bg-slate-50 border-none h-14 font-black rounded-2xl px-6" value={form.birthDate} onChange={e => setForm(f => ({ ...f, birthDate: e.target.value }))} />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Biological Gender</Label>
                    <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl h-14">
                      {['male', 'female'].map((g) => (
                        <button key={g} type="button" onClick={() => setForm(f => ({ ...f, gender: g as any }))} 
                          className={cn("flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", form.gender === g ? "bg-white text-blue-600 shadow-sm" : "text-slate-400")}>
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <Button type="submit" className="w-full bg-slate-900 hover:bg-blue-600 text-white font-black h-16 rounded-2xl uppercase text-[11px] tracking-[0.2em] transition-all shadow-xl shadow-slate-200">
                  <Save className="w-4 h-4 mr-2" /> Confirm Enrollment
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-6">
          {bulkRows.length === 0 ? (
            <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden py-24">
              <div className="flex flex-col items-center space-y-8">
                <div className="h-24 w-24 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center text-emerald-500 border border-emerald-100 shadow-inner">
                  <UploadCloud className="w-10 h-10" />
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Mass Ingestion</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Upload CSV registry for automated enrollment</p>
                </div>
                <label className="w-full max-w-md px-10 cursor-pointer group">
                  <div className="h-56 border-2 border-dashed border-slate-200 rounded-[3rem] bg-slate-50 group-hover:bg-slate-100 group-hover:border-emerald-200 transition-all flex flex-col items-center justify-center gap-4">
                    <div className="p-4 bg-white rounded-2xl shadow-sm text-slate-300"><FileSpreadsheet className="w-8 h-8" /></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {isProcessing ? "Validating Data..." : "Select CSV File"}
                    </span>
                    <input type="file" className="hidden" accept=".csv" onChange={handleFile} disabled={isProcessing} />
                  </div>
                </label>
              </div>
            </Card>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-bottom-6 duration-700">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Found</p>
                  <p className="text-2xl font-black text-slate-800 tracking-tighter">{bulkRows.length} Total</p>
                </div>
                <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 shadow-sm">
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Eligible</p>
                  <p className="text-2xl font-black text-emerald-700 tracking-tighter">{validCount} Valid</p>
                </div>
                <div className="bg-rose-50 p-6 rounded-[2rem] border border-rose-100 shadow-sm">
                  <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Skipped</p>
                  <p className="text-2xl font-black text-rose-700 tracking-tighter">{bulkRows.length - validCount} Errors</p>
                </div>
                <Button onClick={() => setBulkRows([])} variant="ghost" className="h-full rounded-[2.5rem] border-2 border-dashed border-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all">
                  <X className="w-6 h-6 mr-2" /> Reset
                </Button>
              </div>

              <Card className="rounded-[2.5rem] overflow-hidden border-none shadow-sm bg-white">
                <div className="max-h-[500px] overflow-auto">
                  <Table>
                    <TableHeader className="bg-slate-50/80 backdrop-blur sticky top-0 z-10">
                      <TableRow className="border-none">
                        <TableHead className="px-10 py-6 font-black text-[10px] uppercase text-slate-400">Student Identity</TableHead>
                        <TableHead className="font-black text-[10px] uppercase text-center text-slate-400">ID (Parsed)</TableHead>
                        <TableHead className="font-black text-[10px] uppercase text-center text-slate-400">Status</TableHead>
                        <TableHead className="text-right pr-10 font-black text-[10px] uppercase text-slate-400">Eligibility</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bulkRows.map((r, i) => (
                        <TableRow key={i} className={cn("hover:bg-slate-50/50 border-b border-slate-50", !r.isValid && "opacity-60")}>
                          <TableCell className="px-10 py-6">
                            <p className="font-black text-slate-700 text-sm tracking-tight uppercase">{r.name}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase mt-1">Class {r.className} • {r.gender}</p>
                          </TableCell>
                          <TableCell className="text-center font-bold text-xs text-blue-600">{r.admissionId}</TableCell>
                          <TableCell className="text-center">
                              <Badge className={cn(
                                "px-3 py-1 rounded-lg font-black text-[9px] uppercase border-none",
                                r.bmiStatus === 'normal' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                              )}>
                                {statusLabel(r.bmiStatus)}
                              </Badge>
                          </TableCell>
                          <TableCell className="text-right pr-10">
                            {r.isDuplicate && (
                              <Badge className="bg-rose-500 text-white font-black text-[8px] uppercase border-none px-2">
                                <AlertCircle className="w-3 h-3 mr-1" /> Duplicate ID
                              </Badge>
                            )}
                            {r.isWrongClass && (
                              <Badge className="bg-amber-500 text-white font-black text-[8px] uppercase border-none px-2">
                                <Lock className="w-3 h-3 mr-1" /> Wrong Class
                              </Badge>
                            )}
                            {r.isValid && (
                              <Badge className="bg-emerald-500 text-white font-black text-[8px] uppercase border-none px-2">
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Ready
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>

              <Button 
                onClick={handleBulkSave} 
                disabled={validCount === 0}
                className="w-full h-20 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xl rounded-[2rem] uppercase tracking-widest shadow-2xl shadow-emerald-200 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                Enroll {validCount} Students
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <div className="text-center opacity-20 pt-10">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em]">Baal Aarogya Infrastructure • 2026</p>
      </div>
    </div>
  );
}
import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  getStudents, 
  getAvailableClasses, 
  updateStudent, 
  deleteStudent, 
  deleteStudentsBulk, 
  updateStudentsClassBulk 
} from '../lib/store';
import { statusLabel } from '../lib/bmi';
import { calculateAge, cn } from '../lib/utils';
import { 
  Search, Users, FileSpreadsheet, Eye, 
  Edit3, Trash2, X, MoveRight 
} from 'lucide-react'; 
import { useAuth } from '../lib/auth';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

const getStatusStyles = (status: string) => {
  switch (status) {
    case 'normal': return "bg-emerald-50 text-emerald-600 border-emerald-100";
    case 'underweight':
    case 'overweight': return "bg-amber-50 text-amber-600 border-amber-100";
    case 'severely-underweight':
    case 'obese': return "bg-rose-50 text-rose-600 border-rose-100";
    default: return "bg-slate-50 text-slate-400 border-slate-100";
  }
};

export default function StudentList() {
  const [searchParams] = useSearchParams();
  const { user, isTeacher } = useAuth(); 
  const [students, setStudents] = useState(() => getStudents());
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState(() => (isTeacher && user?.assignedClass ? user.assignedClass : searchParams.get('class') || 'all'));

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkNewClass, setBulkNewClass] = useState('');
  
  // MODAL STATES
  const [editStudent, setEditStudent] = useState<any>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const classes = getAvailableClasses();

  const filtered = useMemo(() => {
    return students.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
      const matchesClass = isTeacher ? s.className === user?.assignedClass : (classFilter === 'all' || s.className === classFilter);
      return matchesSearch && matchesClass;
    });
  }, [students, search, classFilter, isTeacher, user]);

  const reload = () => {
    setStudents(getStudents());
    setSelectedIds([]);
  };

  // --- CORE HANDLERS ---
  
  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editStudent) {
      // VALIDATION: Ensure numeric fields are actually numbers
      const finalData = {
        ...editStudent,
        className: editStudent.className.toUpperCase().trim()
      };

      if (!finalData.name || !finalData.birthDate) {
        toast.error("Name and Date of Birth are required");
        return;
      }

      updateStudent(editStudent.id, finalData);
      reload();
      setEditStudent(null);
      toast.success(`${finalData.name}'s profile and BMI recalculated`);
    }
  };

  const handleDelete = () => {
    if (deleteConfirmId) {
      deleteStudent(deleteConfirmId);
      reload();
      setDeleteConfirmId(null);
      toast.success("Student deleted");
    }
  };

  const handleBulkDelete = () => {
    deleteStudentsBulk(selectedIds);
    reload();
    toast.success(`${selectedIds.length} records deleted`);
  };

  const handleBulkMove = () => {
    if (!bulkNewClass) return toast.error("Enter a class name");
    updateStudentsClassBulk(selectedIds, bulkNewClass);
    setBulkNewClass('');
    reload();
    toast.success("Students moved successfully");
  };

  const handleRawExcelExport = () => {
    const exportData = filtered.map(s => ({
      "Student ID": s.id,
      "Full Name": s.name,
      "Date of Birth": s.birthDate || "N/A", 
      "Gender": (s.gender || "N/A").toUpperCase(),
      "Class": s.className,
      "Height (cm)": s.height || '0',
      "Weight (kg)": s.weight || '0',
      "Current BMI": s.bmi || '0',
      "Status": statusLabel(s.bmiStatus)
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, `BaalAarogya_Registry_${new Date().toLocaleDateString()}.xlsx`);
    toast.success("Excel exported successfully");
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map(s => s.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-6 p-6 bg-slate-50/30 min-h-screen pb-32">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800 uppercase flex items-center gap-3">
            <Users className="w-6 h-6 text-[#3B82F6]" /> 
            {isTeacher ? `Class ${user?.assignedClass} Registry` : 'Global Registry'}
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Total {filtered.length} Students</p>
        </div>
        <Button onClick={handleRawExcelExport} className="bg-emerald-600 hover:bg-emerald-700 text-white font-black h-12 rounded-xl shadow-lg uppercase text-[10px] tracking-widest px-8 transition-all active:scale-95">
          <FileSpreadsheet className="w-4 h-4 mr-2" /> Download Master Excel
        </Button>
      </div>

      {/* Filters section */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} className="pl-11 h-12 border-none bg-slate-50/50 font-bold rounded-xl focus-visible:ring-1 focus-visible:ring-blue-200" />
        </div>
        {!isTeacher && (
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-[180px] h-12 border-none bg-slate-50/50 text-slate-600 font-black rounded-xl uppercase"><SelectValue placeholder="Class" /></SelectTrigger>
            <SelectContent className="bg-white border-slate-200 shadow-xl rounded-xl">
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Main Table */}
      <Card className="border-none shadow-sm rounded-[2rem] bg-white overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50 border-b border-slate-100">
              <TableRow>
                <TableHead className="w-12 pl-8">
                  <Checkbox checked={selectedIds.length === filtered.length && filtered.length > 0} onCheckedChange={toggleSelectAll} className="data-[state=checked]:bg-blue-600" />
                </TableHead>
                <TableHead className="py-5 px-4 text-[10px] uppercase font-black text-slate-400">Student Identity</TableHead>
                {['Q1', 'Q2', 'Q3', 'Q4'].map(q => (
                  <TableHead key={q} className="text-center text-[10px] uppercase font-black text-slate-400">{q} Status</TableHead>
                ))}
                <TableHead className="text-right pr-8 text-[10px] uppercase font-black text-slate-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id} className={cn("border-b border-slate-50 transition-colors", selectedIds.includes(s.id) ? "bg-blue-50/30" : "hover:bg-slate-50/40")}>
                  <TableCell className="pl-8">
                    <Checkbox checked={selectedIds.includes(s.id)} onCheckedChange={() => toggleSelect(s.id)} className="data-[state=checked]:bg-blue-600" />
                  </TableCell>
                  <TableCell className="py-5 px-4">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-700 text-sm leading-tight">{s.name}</span>
                      <span className="text-[9px] text-slate-400 font-black uppercase mt-1 tracking-tighter">
                        UID: {s.id} • {calculateAge(s.birthDate)}Y
                      </span>
                    </div>
                  </TableCell>
                  
                  {['Q1', 'Q2', 'Q3', 'Q4'].map(q => {
                    const record = s.history?.find((h: any) => h.quarter === q);
                    return (
                      <TableCell key={q} className="text-center">
                        {record ? (
                          <div className="flex flex-col items-center gap-1">
                            <Badge className="bg-slate-900 text-white font-black text-[9px] px-2 h-5 rounded min-w-[30px] justify-center">{record.bmi}</Badge>
                            <Badge variant="outline" className={cn("font-black text-[7px] uppercase px-1.5 py-0 border rounded-lg", getStatusStyles(record.bmiStatus))}>{statusLabel(record.bmiStatus)}</Badge>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center opacity-30">
                            <div className="w-6 h-0.5 bg-slate-200 rounded-full mb-1" />
                            <span className="text-[7px] font-black uppercase tracking-widest text-slate-300">Empty</span>
                          </div>
                        )}
                      </TableCell>
                    );
                  })}

                  <TableCell className="text-right pr-8">
                    <div className="flex justify-end items-center gap-2 relative z-20">
                      <Link to={`/student/${s.id}`}>
                        <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-100 bg-white text-blue-500 shadow-sm hover:bg-blue-600 hover:text-white transition-all">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button onClick={() => setEditStudent(s)} variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-100 bg-white text-amber-500 shadow-sm hover:bg-amber-500 hover:text-white transition-all">
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button onClick={() => setDeleteConfirmId(s.id)} variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-100 bg-white text-rose-500 shadow-sm hover:bg-rose-500 hover:text-white transition-all">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* MODAL: COMPREHENSIVE EDIT */}
      <Dialog open={!!editStudent} onOpenChange={() => setEditStudent(null)}>
        <DialogContent className="rounded-[2.5rem] bg-white p-8 max-w-2xl border-none shadow-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-xs font-black uppercase text-slate-400 tracking-[0.3em]">Update Student Record</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="space-y-2 md:col-span-2">
              <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Full Name</Label>
              <Input 
                value={editStudent?.name || ''} 
                onChange={e => setEditStudent({...editStudent, name: e.target.value})} 
                className="h-14 bg-slate-50 border-none rounded-2xl font-bold px-6"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Date of Birth</Label>
              <Input 
                type="date"
                value={editStudent?.birthDate || ''} 
                onChange={e => setEditStudent({...editStudent, birthDate: e.target.value})} 
                className="h-14 bg-slate-50 border-none rounded-2xl font-bold px-6"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Class</Label>
              <Input 
                value={editStudent?.className || ''} 
                onChange={e => setEditStudent({...editStudent, className: e.target.value.toUpperCase()})} 
                className="h-14 bg-slate-50 border-none rounded-2xl font-bold px-6"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Gender</Label>
              <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl h-14">
                {['male', 'female'].map((g) => (
                  <button 
                    key={g} type="button" 
                    onClick={() => setEditStudent({...editStudent, gender: g})}
                    className={cn(
                      "flex-1 rounded-xl text-[10px] font-black uppercase transition-all",
                      editStudent?.gender === g ? "bg-white text-blue-600 shadow-sm" : "text-slate-400"
                    )}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 pt-4 flex gap-3">
              <Button type="button" variant="ghost" onClick={() => setEditStudent(null)} className="flex-1 h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-400">Cancel</Button>
              <Button type="submit" className="flex-[2] h-14 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest">Update Record & Re-validate</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL: DELETE CONFIRMATION */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="rounded-[2rem] bg-white p-10 max-w-sm text-center border-none shadow-2xl">
          <div className="flex flex-col items-center">
            <div className="h-16 w-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-4">
              <Trash2 className="w-8 h-8 text-rose-500" />
            </div>
            <h2 className="text-lg font-black text-slate-800 uppercase">Confirm Deletion</h2>
            <p className="text-xs text-slate-400 mt-2 font-medium">This will remove the student and all quarterly history permanently.</p>
            <div className="grid grid-cols-2 gap-3 w-full mt-8">
              <Button variant="outline" onClick={() => setDeleteConfirmId(null)} className="h-12 rounded-xl font-black uppercase text-[10px]">Back</Button>
              <Button onClick={handleDelete} className="h-12 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black uppercase text-[10px]">Delete</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-5 rounded-[2.5rem] shadow-2xl flex flex-wrap items-center gap-6 animate-in slide-in-from-bottom-10 z-[100] border border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-3 pr-6 border-r border-white/10">
            <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-sm">{selectedIds.length}</div>
            <p className="text-[10px] font-black uppercase tracking-widest">Selected</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10">
              <Input 
                placeholder="TARGET CLASS" 
                value={bulkNewClass}
                onChange={e => setBulkNewClass(e.target.value.toUpperCase())}
                className="h-10 w-28 bg-transparent border-none text-[10px] font-black uppercase placeholder:text-slate-600 focus-visible:ring-0" 
              />
              <Button onClick={handleBulkMove} size="sm" className="h-10 bg-blue-600 hover:bg-blue-700 rounded-xl font-black text-[10px] uppercase px-4">
                <MoveRight className="w-4 h-4 mr-2" /> Move
              </Button>
            </div>
            <Button variant="destructive" onClick={() => { if(window.confirm('Delete all selected?')) handleBulkDelete(); }} className="h-12 rounded-xl font-black text-[10px] uppercase px-6">
              Mass Delete
            </Button>
          </div>
          <button onClick={() => setSelectedIds([])} className="ml-2 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>
      )}
    </div>
  );
}
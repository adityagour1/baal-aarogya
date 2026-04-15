import { useState, useMemo } from 'react';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch'; 
import { 
  UserPlus, ShieldCheck, GraduationCap, Trash2, Globe, Search, 
  Check, X, Edit2, Activity, Lock, Settings2, UserCog 
} from 'lucide-react';
import { Quarter } from '@/lib/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function AdminUsers() {
  const { 
    allUsers, 
    registerUser, 
    deleteUser, 
    updateTeacherClass, 
    activeQuarter, 
    updateActiveQuarter,
    isWindowOpen,
    setWindowStatus 
  } = useAuth();
  
  const [staffSearch, setStaffSearch] = useState('');
  const [editingTeacher, setEditingTeacher] = useState<string | null>(null);
  const [tempClass, setTempClass] = useState('');
  
  const [formData, setFormData] = useState({ 
    username: '', 
    password: '', 
    confirmPassword: '', 
    role: 'teacher' as 'teacher' | 'admin', 
    assignedClass: '' 
  });

  const filteredStaff = useMemo(() => 
    allUsers.filter(u => u.username.toLowerCase().includes(staffSearch.toLowerCase())), 
  [allUsers, staffSearch]);

  const handleSaveClassUpdate = (username: string) => {
    if (!tempClass) return;
    updateTeacherClass(username, tempClass);
    setEditingTeacher(null);
    setTempClass('');
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    registerUser(formData);
    setFormData({ username: '', password: '', confirmPassword: '', role: 'teacher', assignedClass: '' });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* 1. HEADER & PHASE CONTROL */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3 uppercase tracking-tighter">
            <Settings2 className="text-blue-600 w-7 h-7" /> System Management
          </h1>
          <p className="text-[10px] text-slate-400 font-black uppercase mt-1 tracking-[0.2em]">
            Administrative Master Control
          </p>
        </div>

        <div className="bg-white border border-slate-100 p-1.5 rounded-2xl flex items-center gap-1 shadow-sm">
          {(['Q1', 'Q2', 'Q3', 'Q4'] as Quarter[]).map(q => (
            <button 
              key={q} 
              onClick={() => updateActiveQuarter(q)} 
              className={cn(
                "px-5 py-2 text-[10px] font-black rounded-xl transition-all",
                activeQuarter === q ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'
              )}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* 2. MASTER ASSESSMENT SWITCH */}
      <div className={cn(
        "p-8 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-700 border-none",
        isWindowOpen ? "bg-blue-600 shadow-xl shadow-blue-500/10" : "bg-slate-800 shadow-xl shadow-slate-900/10"
      )}>
        <div className="flex items-center gap-5 text-white">
          <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
            {isWindowOpen ? <Activity className="w-7 h-7 animate-pulse" /> : <Lock className="w-7 h-7" />}
          </div>
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight italic">
              {isWindowOpen ? "Assessment Window Active" : "Registry Mode Only"}
            </h2>
            <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest mt-1">
              Current Mode: {isWindowOpen ? "All height/weight inputs enabled" : "Biometric inputs disabled school-wide"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-white/10 p-3 px-5 rounded-2xl border border-white/10">
          <span className="text-[9px] font-black text-white uppercase tracking-widest">Master Toggle</span>
          <Switch 
            checked={isWindowOpen} 
            onCheckedChange={setWindowStatus}
            className="data-[state=checked]:bg-emerald-400"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* 3. REGISTRATION FORM */}
        <Card className="lg:col-span-2 rounded-[2.5rem] bg-white border-none shadow-sm h-fit">
          <CardHeader className="pb-4">
            <CardTitle className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2 tracking-[0.2em]">
              <UserPlus className="w-4 h-4 text-blue-500" /> New Faculty Enrollment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUser} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase ml-1 text-slate-400 tracking-widest">Username</Label>
                <Input placeholder="e.g. r.verma" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="h-12 bg-slate-50 border-none rounded-xl font-bold px-5" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase ml-1 text-slate-400 tracking-widest">Password</Label>
                  <Input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="h-12 bg-slate-50 border-none rounded-xl px-5" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase ml-1 text-slate-400 tracking-widest">Confirm</Label>
                  <Input type="password" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} className="h-12 bg-slate-50 border-none rounded-xl px-5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase ml-1 text-slate-400 tracking-widest">System Role</Label>
                  <Select value={formData.role} onValueChange={(v: any) => setFormData({...formData, role: v})}>
                    <SelectTrigger className="h-12 bg-slate-50 border-none font-bold rounded-xl px-5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white rounded-xl border-slate-100">
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="teacher">Class Teacher</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.role === 'teacher' && (
                  <div className="space-y-2 animate-in slide-in-from-left-2">
                    <Label className="text-[10px] font-black uppercase ml-1 text-slate-400 tracking-widest">Class ID</Label>
                    <Input placeholder="E.G. 5A" value={formData.assignedClass} onChange={e => setFormData({...formData, assignedClass: e.target.value.toUpperCase()})} className="h-12 bg-slate-50 border-none rounded-xl font-black px-5" />
                  </div>
                )}
              </div>
              
              <Button type="submit" className="w-full bg-slate-900 hover:bg-blue-600 text-white font-black h-14 rounded-xl mt-4 transition-all uppercase text-[10px] tracking-widest shadow-lg active:scale-95">
                Create Account
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 4. STAFF DIRECTORY */}
        <Card className="lg:col-span-3 rounded-[2.5rem] bg-white overflow-hidden border-none shadow-sm flex flex-col">
          <div className="p-6 px-8 bg-slate-50 border-b border-slate-100 flex items-center">
            <Search className="w-4 h-4 text-slate-400 mr-4" />
            <input 
              placeholder="SEARCH FACULTY BY USERNAME..." 
              className="bg-transparent border-none text-[10px] font-black w-full outline-none placeholder:text-slate-300 uppercase tracking-widest" 
              value={staffSearch} 
              onChange={e => setStaffSearch(e.target.value)} 
            />
            <UserCog className="w-4 h-4 text-slate-300" />
          </div>
          
          <div className="divide-y divide-slate-50 max-h-[500px] overflow-auto scrollbar-hide">
            {filteredStaff.length > 0 ? filteredStaff.map(u => (
              <div key={u.username} className="group p-5 px-8 flex justify-between items-center hover:bg-slate-50/50 transition-all">
                <div className="flex items-center gap-5">
                  <div className={cn(
                    "h-11 w-11 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110",
                    u.role === 'admin' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                  )}>
                    {u.role === 'admin' ? <ShieldCheck className="w-5 h-5" /> : <GraduationCap className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-black text-sm text-slate-800 uppercase tracking-tight">{u.username}</p>
                    <div className="mt-1 flex items-center gap-2">
                      {editingTeacher === u.username ? (
                        <div className="flex items-center gap-1.5 animate-in zoom-in">
                          <input 
                            autoFocus 
                            className="w-20 h-7 text-[10px] font-black uppercase border border-blue-200 rounded-lg px-2 outline-none focus:ring-2 focus:ring-blue-100" 
                            value={tempClass} 
                            onChange={(e) => setTempClass(e.target.value)} 
                          />
                          <button onClick={() => handleSaveClassUpdate(u.username)} className="bg-emerald-500 text-white p-1 rounded-md shadow-sm"><Check className="w-3 h-3" /></button>
                          <button onClick={() => setEditingTeacher(null)} className="bg-slate-200 text-slate-500 p-1 rounded-md shadow-sm"><X className="w-3 h-3" /></button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">
                            {u.role} • {u.role === 'admin' ? 'Superuser' : `Class ${u.assignedClass}`}
                          </p>
                          {u.role !== 'admin' && (
                            <button onClick={() => { setEditingTeacher(u.username); setTempClass(u.assignedClass || ''); }} className="opacity-0 group-hover:opacity-100 text-blue-500 hover:text-blue-700 transition-opacity p-1">
                              <Edit2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  onClick={() => deleteUser(u.username)} 
                  disabled={u.username === 'admin'} 
                  className="h-10 w-10 p-0 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )) : (
              <div className="p-20 text-center opacity-30">
                <Globe className="w-10 h-10 mx-auto mb-3" />
                <p className="text-[10px] font-black uppercase tracking-widest">No matching records found</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
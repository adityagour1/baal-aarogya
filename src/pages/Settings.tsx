import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Lock, User, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const { user, registerUser, userDb } = useAuth();
  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });

  const updateMyPassword = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Get the current full user object from our DB state
    const currentEntry = userDb[user?.username || ''];

    // 2. Validation Checks
    if (!currentEntry) {
      toast.error("User session expired. Please login again.");
      return;
    }
    if (currentEntry.password !== passwords.old) {
      toast.error("The current password entered is incorrect.");
      return;
    }
    if (passwords.new.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }
    if (passwords.new !== passwords.confirm) {
      toast.error("New password confirmation does not match.");
      return;
    }

    // 3. Update the DB: Reuse registerUser to overwrite the existing entry
    registerUser({
      ...currentEntry,
      password: passwords.new
    });

    toast.success("Security credentials updated successfully!");
    setPasswords({ old: '', new: '', confirm: '' });
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 bg-slate-50/30 min-h-screen">
      <div className="px-2">
        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Account Settings</h1>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
          Secure and manage your personal access credentials
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Summary Card */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden">
            <CardContent className="p-10 text-center space-y-6">
              <div className="h-24 w-24 rounded-[2rem] bg-blue-50 flex items-center justify-center text-blue-600 mx-auto shadow-inner border border-blue-100">
                <User className="w-12 h-12 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{user?.username}</h3>
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mt-2 bg-blue-50 inline-block px-4 py-1.5 rounded-full">
                  {user?.role === 'admin' ? 'Administrator' : `Class ${user?.assignedClass} Teacher`}
                </p>
              </div>
              <div className="pt-4 border-t border-slate-50 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-slate-400 uppercase">System Status</span>
                  <span className="text-[9px] font-black text-emerald-500 uppercase">Active Now</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-slate-400 uppercase">Access Level</span>
                  <span className="text-[9px] font-black text-slate-600 uppercase">{user?.role}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Password Update Form Card */}
        <Card className="lg:col-span-2 border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden">
          <CardHeader className="border-b border-slate-50 px-10 py-8 bg-slate-50/30">
            <CardTitle className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-500" /> Security & Authentication
            </CardTitle>
          </CardHeader>
          <CardContent className="p-10">
            <form onSubmit={updateMyPassword} className="space-y-8">
              
              <div className="space-y-3">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Current Password</Label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <Input 
                    type="password"
                    required
                    value={passwords.old}
                    onChange={(e) => setPasswords({...passwords, old: e.target.value})}
                    className="h-14 bg-slate-50 border-none rounded-2xl pl-14 font-bold text-slate-700 placeholder:text-slate-300"
                    placeholder="Enter current password"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">New Password</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <Input 
                      type="password"
                      required
                      value={passwords.new}
                      onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                      className="h-14 bg-slate-50 border-none rounded-2xl pl-14 font-bold text-slate-700 placeholder:text-slate-300"
                      placeholder="Min. 6 characters"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Confirm Password</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <Input 
                      type="password"
                      required
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                      className="h-14 bg-slate-50 border-none rounded-2xl pl-14 font-bold text-slate-700 placeholder:text-slate-300"
                      placeholder="Repeat new password"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-[0.15em] rounded-2xl shadow-xl shadow-blue-500/20 border-none transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  Update Security Credentials
                </Button>
                <p className="text-center text-[9px] text-slate-400 font-bold uppercase mt-6 tracking-widest italic">
                  Note: Updating your password will immediately secure your account database record
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight, Lock, User, ShieldCheck } from 'lucide-react';
import Logo from '@/components/Logo'; 

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = login(username, password);
    if (err) setError(err);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-6 lg:p-12">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Branding */}
        <div className="hidden lg:flex flex-col space-y-8">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2.5 rounded-2xl shadow-lg shadow-blue-100 border border-slate-100">
              <Logo className="w-12 h-12" />
            </div>
            <h1 className="text-4xl font-black text-[#1E293B] tracking-tight">
              Baal <span className="text-[#3B82F6]">Aarogya</span>
            </h1>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-5xl font-bold text-[#1E293B] leading-tight">
              Monitoring <br /> 
              <span className="text-slate-400">Student Nutrition.</span>
            </h2>
            <p className="text-lg text-slate-500 max-w-md leading-relaxed font-medium">
              A centralized platform for schools to manage, track, and optimize nutritional intake for students across all grades.
            </p>
          </div>

          <div className="flex gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex-1 text-center">
              <p className="text-2xl font-bold text-[#10B981]">100%</p>
              <p className="text-xs text-slate-400 font-black uppercase tracking-widest mt-1 italic">Digitally Accurate</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex-1 text-center">
              <div className="flex items-center justify-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#3B82F6]" />
                <p className="text-2xl font-bold text-[#3B82F6]">WHO</p>
              </div>
              <p className="text-xs text-slate-400 font-black uppercase tracking-widest mt-1">Certified Standards</p>
            </div>
          </div>
        </div>

        {/* Right Side: Secure Login Form */}
        <div className="space-y-6">
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex bg-white p-3 rounded-xl mb-4 shadow-sm border border-slate-100">
              <Logo className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-black text-[#1E293B]">Baal Aarogya</h1>
          </div>

          <Card className="border-none shadow-2xl shadow-slate-200/60 rounded-[2.5rem] overflow-hidden bg-white">
            <CardContent className="p-8 lg:p-12">
              <div className="mb-10 text-center lg:text-left">
                <h3 className="text-2xl font-black text-[#1E293B] uppercase tracking-tight">Portal Access</h3>
                <p className="text-slate-400 font-medium mt-1">Authorized personnel login only.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Username</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <Input 
                      className="h-14 bg-slate-50 border-none rounded-2xl text-base font-bold text-slate-700 pl-12 focus-visible:ring-[#3B82F6]" 
                      value={username} 
                      onChange={e => setUsername(e.target.value)} 
                      placeholder="e.g. admin_rbu" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px) font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <Input 
                      type="password" 
                      className="h-14 bg-slate-50 border-none rounded-2xl text-base font-bold text-slate-700 pl-12 focus-visible:ring-[#3B82F6]" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      placeholder="••••••••" 
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-500 text-xs font-bold flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                    {error}
                  </div>
                )}
                
                <Button type="submit" className="w-full h-16 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:shadow-blue-500/20 text-white text-sm font-black uppercase tracking-widest rounded-2xl shadow-xl mt-4 flex gap-3 border-none transition-all active:scale-95">
                  Sign In <ArrowRight className="w-5 h-5" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
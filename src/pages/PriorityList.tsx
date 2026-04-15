import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getStudents, getStudentTrend } from '@/lib/store';
import { useAuth } from '@/lib/auth';
import { AlertCircle, ArrowDownZa, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PriorityListProps {
  className?: string;
}

export default function PriorityList({ className }: PriorityListProps) {
  const { user, isAdmin } = useAuth();
  const allStudents = getStudents();

  const priorityStudents = useMemo(() => {
    // 1. PRIVACY FILTER: Admin sees all, Teacher sees assigned class only
    const scope = isAdmin 
      ? allStudents 
      : allStudents.filter(s => s.className === user?.assignedClass);

    // 2. UPDATED URGENCY FILTER:
    // Now checks CURRENT BMI status as the primary trigger
    return scope
      .filter(s => {
        // Status check: Catch immediate critical cases (like BMI 9.0)
        const isCritical = s.bmiStatus === 'severely-underweight';
        const isWarning = s.bmiStatus === 'underweight';
        
        // Trend check: Catch declining health even if status isn't critical yet
        const trend = getStudentTrend(s);
        const isDeclining = trend === 'DECLINED' || trend === 'RAPID_DECLINE';

        // SHOW IF: Either the current status is bad OR the health is getting worse
        return isCritical || isWarning || isDeclining;
      })
      // Sort by severity: Severely Underweight always at the top
      .sort((a, b) => {
        if (a.bmiStatus === 'severely-underweight' && b.bmiStatus !== 'severely-underweight') return -1;
        if (a.bmiStatus !== 'severely-underweight' && b.bmiStatus === 'severely-underweight') return 1;
        return (a.bmi || 0) - (b.bmi || 0);
      })
      .slice(0, 5); 
  }, [allStudents, user, isAdmin]);

  // If there are no students matching the risk criteria, hide the component
  if (priorityStudents.length === 0) return null;

  return (
    <Card className={cn("border-none shadow-xl shadow-rose-500/5 rounded-[2.5rem] bg-white overflow-hidden", className)}>
      <CardHeader className="bg-rose-50/50 px-8 py-6 border-b border-rose-100/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500 rounded-xl text-white shadow-lg shadow-rose-500/20">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-sm font-black uppercase tracking-widest text-rose-900 leading-none">
                Priority Interventions
              </CardTitle>
              <p className="text-[9px] font-bold text-rose-500 uppercase mt-2 tracking-wider">
                Immediate nutritional attention required
              </p>
            </div>
          </div>
          <Badge className="bg-rose-100 text-rose-600 border-none font-black text-[10px] px-3">
            {priorityStudents.length} ALERTS
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y divide-slate-50">
          {priorityStudents.map((s) => {
            const trend = getStudentTrend(s);
            const isSevere = s.bmiStatus === 'severely-underweight';

            return (
              <div key={s.id} className="group p-6 px-8 flex items-center justify-between hover:bg-rose-50/20 transition-all">
                <div className="flex items-center gap-5">
                  <div className={cn(
                    "h-12 w-12 rounded-2xl flex items-center justify-center font-black text-sm transition-all duration-300",
                    isSevere ? "bg-rose-500 text-white shadow-md" : "bg-amber-100 text-amber-600"
                  )}>
                    {s.name.charAt(0)}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black text-slate-800 uppercase tracking-tight leading-none pt-1">
                        {s.name}
                      </p>
                      {isSevere && (
                        <span className="bg-rose-100 text-rose-600 text-[8px] font-black h-4 px-2 flex items-center rounded-md">
                          CRITICAL
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 tracking-tighter">
                      Class {s.className} • {s.bmi?.toFixed(1)} BMI • {s.bmiStatus?.replace('-', ' ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    {(trend === 'DECLINED' || trend === 'RAPID_DECLINE') && (
                      <div className="flex items-center gap-1 text-rose-500 font-black text-[9px] uppercase">
                        <ArrowDownZa className="w-3 h-3" /> Rapid Decline
                      </div>
                    )}
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-tighter mt-1">
                      Ref: {s.id.split('-').pop()}
                    </p>
                  </div>

                  <Link to={`/student/${s.id}`}>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-rose-500 hover:text-white transition-all">
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
        
        <Link to="/students">
          <Button variant="ghost" className="w-full h-14 rounded-none text-[9px] font-black uppercase text-slate-400 hover:text-rose-600 tracking-[0.2em] border-t border-slate-50 transition-colors">
            View All Health Records
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
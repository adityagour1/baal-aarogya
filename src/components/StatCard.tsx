import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'primary' | 'success' | 'warning' | 'critical';
}

const variantStyles = {
  // Deep Royal Blue
  primary: 'from-[#3B82F6] to-[#1D4ED8] shadow-blue-500/20',
  // Professional Teal-Green
  success: 'from-[#10B981] to-[#047857] shadow-emerald-500/20',
  // Muted Golden Amber
  warning: 'from-[#F59E0B] to-[#B45309] shadow-amber-500/20',
  // Deep Crimson Red
  critical: 'from-[#DC2626] to-[#991B1B] shadow-rose-500/20',
};

export default function StatCard({ title, value, subtitle, icon: Icon, variant = 'primary' }: StatCardProps) {
  return (
    <Card className={cn(
      "relative bg-gradient-to-br border-none rounded-[2rem] transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 shadow-xl group overflow-hidden",
      variantStyles[variant]
    )}>
      <CardContent className="p-8 relative z-10">
        {/* Subtle vignette for depth */}
        <div className="absolute inset-0 bg-black/5 pointer-events-none" />
        
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em]">
              {title}
            </p>
            <p className="text-4xl font-black text-white tracking-tighter leading-none">
              {value}
            </p>
            {subtitle && (
              <p className="text-[11px] font-bold text-white/60 italic mt-2 flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-white/40" /> {subtitle}
              </p>
            )}
          </div>

          {/* Frosted Glass Icon Bubble */}
          <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/20 shadow-lg transition-transform duration-500 group-hover:rotate-12">
            <Icon className="w-6 h-6 text-white stroke-[2.5px]" />
          </div>
        </div>
      </CardContent>

      {/* DECORATIVE BACKGROUND ICON - The "Elite" Touch */}
      <Icon className="absolute -right-6 -bottom-6 w-32 h-32 text-white/10 -rotate-12 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-0" />
    </Card>
  );
}
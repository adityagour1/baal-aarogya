import { cn } from "@/lib/utils";
import { Activity } from "lucide-react";

interface LogoProps {
  className?: string; // Overall size (e.g., "w-10 h-10")
  iconClassName?: string; // Size of the icon specifically (e.g., "w-6 h-6")
}

/**
 * Baal Aarogya Original Logo
 * A minimalist design with a solid blue background and a bold white Activity icon.
 */
export default function Logo({ 
  className = "w-12 h-12", 
  iconClassName = "w-7 h-7" 
}: LogoProps) {
  return (
    <div className={cn(
      "bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 transition-all",
      className
    )}>
      {/* The stroke is set to 2.5 for that bold, professional look. 
        It scales perfectly within the blue container.
      */}
      <Activity className={cn("stroke-[2.5]", iconClassName)} />
    </div>
  );
}
import { cn } from "@/lib/utils"; 

export function Card({ children, className }) {
  return (
    <div className={cn("bg-white rounded-xl shadow-md p-4", className)}>
      {children}
    </div>
  );
}

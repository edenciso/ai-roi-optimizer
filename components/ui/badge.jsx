import React from "react";
import { cn } from "@/lib/utils";
export function Badge({ className, variant = "default", ...props }) {
  const base = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors";
  const variants = {
    default: "bg-slate-100 text-slate-900 border-transparent",
    secondary: "bg-slate-50 text-slate-700 border-slate-200",
    outline: "text-slate-700 border-slate-200",
  };
  return <div className={cn(base, variants[variant], className)} {...props} />;
}

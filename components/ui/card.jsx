import * as React from "react";
import { cn } from "@/lib/utils";

function Card({ className, ...props }) {
  return <div className={cn("rounded-2xl border bg-white text-slate-900", className)} {...props} />;
}
function CardHeader({ className, ...props }) {
  return <div className={cn("p-4 md:p-5", className)} {...props} />;
}
function CardTitle({ className, ...props }) {
  return <h3 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />;
}
function CardContent({ className, ...props }) {
  return <div className={cn("p-4 md:p-5 pt-0", className)} {...props} />;
}

export { Card, CardHeader, CardTitle, CardContent };

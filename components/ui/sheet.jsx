import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

function Sheet({ children, ...props }) {
  return <DialogPrimitive.Root {...props}>{children}</DialogPrimitive.Root>;
}
const SheetTrigger = DialogPrimitive.Trigger;

const SheetContent = React.forwardRef(({ className, side = "left", ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/30 data-[state=open]:animate-in data-[state=closed]:animate-out" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-50 bg-white p-4 shadow-lg outline-none",
        side === "left" && "inset-y-0 left-0 w-80 animate-in slide-in-from-left",
        side === "right" && "inset-y-0 right-0 w-80 animate-in slide-in-from-right",
        className
      )}
      {...props}
    />
  </DialogPrimitive.Portal>
));
SheetContent.displayName = "SheetContent";

export { Sheet, SheetTrigger, SheetContent };

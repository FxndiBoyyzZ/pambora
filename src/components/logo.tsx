import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("inline-block", className)}>
      <div className="flex items-center justify-center gap-1.5">
        <span className="text-3xl font-bold tracking-tighter text-foreground font-headline">
          FIT
        </span>
        <span className="text-3xl font-semibold tracking-tighter text-primary font-headline">
          By Pam
        </span>
      </div>
    </div>
  );
}

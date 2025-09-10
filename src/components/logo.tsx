import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("inline-block", className)}>
      <div className="flex items-center justify-center gap-1.5">
        <span className="text-3xl font-bold tracking-tighter text-foreground font-headline">
          Pam
        </span>
        <span className="text-3xl font-semibold tracking-tighter text-primary font-headline">
          360
        </span>
      </div>
    </div>
  );
}

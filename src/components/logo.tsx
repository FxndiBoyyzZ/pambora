import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("inline-block", className)}>
      <div className="flex items-center justify-center">
        <span className="text-4xl font-bold tracking-wider text-foreground font-headline uppercase">
          Pam360
        </span>
      </div>
    </div>
  );
}

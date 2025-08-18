import { Logo } from "@/components/logo";
import { QuizProvider } from "@/services/quiz-service";

export default function QuizLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QuizProvider>
        <div className="min-h-screen flex flex-col bg-background">
            <header className="p-4 border-b border-border">
                <Logo />
            </header>
            <main className="flex-grow flex items-center justify-center p-4">
                {children}
            </main>
        </div>
    </QuizProvider>
  );
}

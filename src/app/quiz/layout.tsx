
import { QuizProvider } from "@/services/quiz-service";

export default function QuizLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QuizProvider>
        <div className="min-h-screen flex flex-col bg-black">
            <main className="flex-grow flex items-center justify-center p-0 sm:p-4">
                {children}
            </main>
        </div>
    </QuizProvider>
  );
}

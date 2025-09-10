
import { QuizProvider } from "@/services/quiz-service";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QuizProvider>
        {children}
    </QuizProvider>
  );
}

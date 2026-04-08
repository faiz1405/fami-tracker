"use client";

import {
  type ChangeEvent,
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  askFinancialConsultant,
  type FinancialConsultantState,
} from "@/app/actions/financial-consultant";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cheerfulCard } from "@/lib/cheerful-card";
import { cn } from "@/lib/utils";

type ChatItem = {
  id: string;
  role: "user" | "assistant";
  text: string;
  highlights?: string[];
  recommendations?: string[];
};

const initialState: FinancialConsultantState = {};

export function ConsultantChat() {
  const [state, formAction, pending] = useActionState(
    askFinancialConsultant,
    initialState,
  );
  const [items, setItems] = useState<ChatItem[]>([]);
  const [question, setQuestion] = useState("");
  const [lastSent, setLastSent] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!lastSent) {
      return;
    }
    if (state.success && state.answer) {
      const answer = state.answer;
      setItems((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "user", text: lastSent },
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: answer,
          highlights: state.highlights ?? [],
          recommendations: state.recommendations ?? [],
        },
      ]);
      setLastSent("");
      setQuestion("");
    }
  }, [lastSent, state]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) {
      return;
    }
    el.scrollTop = el.scrollHeight;
  }, []);

  const emptyHint = useMemo(
    () =>
      "Contoh: Kenapa pengeluaran makan bulan ini naik? dan apa langkah hemat yang paling realistis buat kami?",
    [],
  );

  return (
    <div className="flex h-[calc(100dvh-8.5rem)] flex-col gap-3">
      <Card className={cn("flex-1", cheerfulCard.violet)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Riwayat diskusi
          </CardTitle>
        </CardHeader>
        <CardContent className="h-full overflow-hidden">
          <div
            ref={listRef}
            className="flex h-full flex-col gap-3 overflow-y-auto pr-1"
          >
            {items.length === 0 ? (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {emptyHint}
              </p>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className={
                    item.role === "user"
                      ? "ml-10 rounded-xl bg-primary/15 px-3 py-2 text-sm"
                      : "mr-4 rounded-xl bg-muted px-3 py-2 text-sm"
                  }
                >
                  <p className="leading-relaxed">{item.text}</p>
                  {item.role === "assistant" &&
                  (item.highlights?.length || item.recommendations?.length) ? (
                    <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                      {item.highlights?.length ? (
                        <p>Highlight: {item.highlights.join(" • ")}</p>
                      ) : null}
                      {item.recommendations?.length ? (
                        <p>Saran: {item.recommendations.join(" • ")}</p>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ))
            )}
            {pending ? (
              <div className="mr-4 rounded-xl bg-muted px-3 py-2 text-sm text-muted-foreground">
                AI sedang menganalisis data...
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <form
        action={(fd) => {
          const q = String(fd.get("question") ?? "").trim();
          setLastSent(q);
          formAction(fd);
        }}
        className="sticky bottom-16 z-10 rounded-2xl border border-foreground/10 bg-gradient-to-br from-card to-violet-500/[0.05] p-2 shadow-lg ring-1 ring-violet-500/25 backdrop-blur-sm dark:to-violet-400/10"
      >
        <div className="flex items-center gap-2">
          <Input
            name="question"
            type="text"
            placeholder="Tanya kondisi keuangan keluarga..."
            value={question}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setQuestion(e.target.value)
            }
            disabled={pending}
            className="h-10"
          />
          <Button
            type="submit"
            disabled={pending || question.trim().length < 5}
            className=""
          >
            Tanya
          </Button>
        </div>
        {state.error ? (
          <p className="mt-2 text-xs text-destructive">{state.error}</p>
        ) : null}
      </form>
    </div>
  );
}

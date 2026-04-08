import { AlertTriangle, Info } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SmartAlert } from "@/lib/queries/forecast";

type Props = {
  alerts: SmartAlert[];
};

export function SmartAlertCards({ alerts }: Props) {
  if (!alerts.length) {
    return null;
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const warning = alert.tone === "warning";
        const Icon = warning ? AlertTriangle : Info;
        return (
          <Card
            key={alert.id}
            className={
              warning
                ? "border-0 bg-gradient-to-br from-amber-500/10 via-card to-card shadow-md ring-1 ring-amber-500/35 transition-shadow duration-200 hover:shadow-lg dark:from-amber-500/15 dark:ring-amber-400/30"
                : "border-0 bg-gradient-to-br from-sky-500/[0.06] via-card to-card shadow-md ring-1 ring-sky-500/20 transition-shadow duration-200 hover:shadow-lg dark:from-sky-400/10 dark:ring-sky-400/25"
            }
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Icon className="size-4" />
                {alert.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {alert.message}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

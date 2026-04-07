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
                ? "border-amber-500/40 bg-amber-500/5"
                : "border-border bg-card"
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

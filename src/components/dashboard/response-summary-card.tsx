import { StarIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { QuestionType } from "@/generated/prisma/enums"
import type { QuestionSummary } from "@/lib/response-summary"

export function ResponseSummaryCard({ summary }: { summary: QuestionSummary }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">{summary.label}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {summary.totalAnswered} resposta{summary.totalAnswered === 1 ? "" : "s"}
        </p>
      </CardHeader>
      <CardContent>
        {summary.type === QuestionType.RATING ? (
          <div className="flex items-center gap-2">
            <StarIcon className="size-5 fill-primary text-primary" />
            <span className="text-lg font-semibold">
              {summary.average !== undefined ? summary.average.toFixed(1) : "—"}
            </span>
            <span className="text-sm text-muted-foreground">de 5</span>
          </div>
        ) : summary.counts.length > 0 ? (
          <div className="flex flex-col gap-2">
            {summary.counts.map((c) => (
              <div key={c.label} className="flex flex-col gap-1">
                <div className="flex justify-between text-sm">
                  <span>{c.label}</span>
                  <span className="text-muted-foreground">
                    {c.count} ({c.percentage}%)
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${c.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Respostas em texto livre — veja a aba de respostas individuais.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

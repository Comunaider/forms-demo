"use client"

import { XIcon } from "lucide-react"

import { QuestionType } from "@/generated/prisma/enums"
import {
  CHOICE_TYPES,
  OPERATOR_LABELS,
  OPERATOR_OPTIONS,
} from "@/lib/question-types"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import type { ConditionDraft, QuestionDraft } from "@/components/builder/types"

type Props = {
  condition: ConditionDraft
  availableSourceQuestions: QuestionDraft[]
  onChange: (patch: Partial<ConditionDraft>) => void
  onRemove: () => void
}

export function ConditionEditor({
  condition,
  availableSourceQuestions,
  onChange,
  onRemove,
}: Props) {
  const sourceQuestion = availableSourceQuestions.find(
    (q) => q.id === condition.sourceQuestionId
  )

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border bg-muted/30 p-2">
      <span className="text-sm text-muted-foreground shrink-0">Se</span>
      <Select
        items={Object.fromEntries(
          availableSourceQuestions.map((q) => [
            q.id,
            q.label || "Pergunta sem título",
          ])
        )}
        value={condition.sourceQuestionId}
        onValueChange={(value) =>
          value && onChange({ sourceQuestionId: value, value: "" })
        }
      >
        <SelectTrigger className="h-8 w-auto min-w-[140px]">
          <SelectValue placeholder="Pergunta" />
        </SelectTrigger>
        <SelectContent>
          {availableSourceQuestions.map((q) => (
            <SelectItem key={q.id} value={q.id}>
              {q.label || "Pergunta sem título"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        items={OPERATOR_LABELS}
        value={condition.operator}
        onValueChange={(value) => value && onChange({ operator: value })}
      >
        <SelectTrigger className="h-8 w-auto min-w-[130px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {OPERATOR_OPTIONS.map((op) => (
            <SelectItem key={op.value} value={op.value}>
              {op.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {sourceQuestion?.type === QuestionType.BOOLEAN ? (
        <Select
          items={{ true: "Sim", false: "Não" }}
          value={condition.value}
          onValueChange={(value) => value && onChange({ value })}
        >
          <SelectTrigger className="h-8 w-auto min-w-[100px]">
            <SelectValue placeholder="Valor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Sim</SelectItem>
            <SelectItem value="false">Não</SelectItem>
          </SelectContent>
        </Select>
      ) : sourceQuestion && CHOICE_TYPES.has(sourceQuestion.type) ? (
        <Select
          items={Object.fromEntries(sourceQuestion.options.map((o) => [o, o]))}
          value={condition.value}
          onValueChange={(value) => value && onChange({ value })}
        >
          <SelectTrigger className="h-8 w-auto min-w-[130px]">
            <SelectValue placeholder="Opção" />
          </SelectTrigger>
          <SelectContent>
            {sourceQuestion.options.map((opt, i) => (
              <SelectItem key={`${opt}-${i}`} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          className="h-8 w-auto min-w-[130px] flex-1"
          placeholder="valor"
          value={condition.value}
          onChange={(e) => onChange({ value: e.target.value })}
        />
      )}

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 ml-auto"
        onClick={onRemove}
        aria-label="Remover condição"
      >
        <XIcon className="size-4" />
      </Button>
    </div>
  )
}

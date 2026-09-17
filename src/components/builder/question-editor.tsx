"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVerticalIcon, PlusIcon, Trash2Icon, XIcon } from "lucide-react"

import {
  CHOICE_TYPES,
  QUESTION_TYPE_LABELS,
  QUESTION_TYPE_OPTIONS,
} from "@/lib/question-types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ConditionEditor } from "@/components/builder/condition-editor"
import {
  createEmptyCondition,
  type QuestionDraft,
} from "@/components/builder/types"

type Props = {
  question: QuestionDraft
  index: number
  availableSourceQuestions: QuestionDraft[]
  onChange: (patch: Partial<QuestionDraft>) => void
  onRemove: () => void
}

export function QuestionEditor({
  question,
  index,
  availableSourceQuestions,
  onChange,
  onRemove,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: question.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const isChoice = CHOICE_TYPES.has(question.type)

  function updateOption(i: number, value: string) {
    const options = [...question.options]
    options[i] = value
    onChange({ options })
  }

  function addOption() {
    onChange({
      options: [...question.options, `Opção ${question.options.length + 1}`],
    })
  }

  function removeOption(i: number) {
    onChange({ options: question.options.filter((_, oi) => oi !== i) })
  }

  function addCondition() {
    const firstAvailable = availableSourceQuestions[0]
    if (!firstAvailable) return
    onChange({
      conditions: [
        ...question.conditions,
        createEmptyCondition(firstAvailable.id),
      ],
    })
  }

  function updateCondition(conditionId: string, patch: Record<string, string>) {
    onChange({
      conditions: question.conditions.map((c) =>
        c.id === conditionId ? { ...c, ...patch } : c
      ),
    })
  }

  function removeCondition(conditionId: string) {
    onChange({
      conditions: question.conditions.filter((c) => c.id !== conditionId),
    })
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border bg-card p-4 flex flex-col gap-4 ${isDragging ? "opacity-50" : ""}`}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          className="mt-2 text-muted-foreground cursor-grab active:cursor-grabbing touch-none"
          aria-label="Reordenar pergunta"
          {...attributes}
          {...listeners}
        >
          <GripVerticalIcon className="size-5" />
        </button>

        <div className="flex-1 flex flex-col gap-3">
          <div className="flex items-start gap-2">
            <span className="mt-2 text-sm text-muted-foreground shrink-0">
              {index + 1}.
            </span>
            <Input
              value={question.label}
              onChange={(e) => onChange({ label: e.target.value })}
              placeholder="Texto da pergunta"
              className="font-medium"
            />
          </div>

          <Textarea
            value={question.description}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Descrição ou ajuda (opcional)"
            rows={1}
            className="resize-none"
          />

          <div className="flex flex-wrap items-center gap-4">
            <Select
              items={QUESTION_TYPE_LABELS}
              value={question.type}
              onValueChange={(value) => {
                if (!value) return
                onChange({
                  type: value,
                  options:
                    CHOICE_TYPES.has(value) && question.options.length === 0
                      ? ["Opção 1"]
                      : question.options,
                })
              }}
            >
              <SelectTrigger className="w-auto min-w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUESTION_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Label className="flex items-center gap-2 text-sm">
              <Switch
                checked={question.required}
                onCheckedChange={(checked) => onChange({ required: checked })}
              />
              Obrigatória
            </Label>
          </div>

          {isChoice ? (
            <div className="flex flex-col gap-2 pl-1">
              {question.options.map((option, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={option}
                    onChange={(e) => updateOption(i, e.target.value)}
                    placeholder={`Opção ${i + 1}`}
                    className="h-8"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => removeOption(i)}
                    disabled={question.options.length <= 1}
                    aria-label="Remover opção"
                  >
                    <XIcon className="size-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit"
                onClick={addOption}
              >
                <PlusIcon className="size-4" />
                Adicionar opção
              </Button>
            </div>
          ) : null}

          <div className="flex flex-col gap-2 border-t pt-3">
            <span className="text-sm font-medium text-muted-foreground">
              Lógica condicional
            </span>
            {question.conditions.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Esta pergunta é sempre exibida.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {question.conditions.map((condition) => (
                  <ConditionEditor
                    key={condition.id}
                    condition={condition}
                    availableSourceQuestions={availableSourceQuestions}
                    onChange={(patch) => updateCondition(condition.id, patch as Record<string, string>)}
                    onRemove={() => removeCondition(condition.id)}
                  />
                ))}
              </div>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-fit"
              onClick={addCondition}
              disabled={availableSourceQuestions.length === 0}
            >
              <PlusIcon className="size-4" />
              Mostrar apenas se...
            </Button>
            {availableSourceQuestions.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Adicione uma condição só é possível a partir da segunda pergunta.
              </p>
            ) : null}
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          aria-label="Excluir pergunta"
        >
          <Trash2Icon className="size-4" />
        </Button>
      </div>
    </div>
  )
}

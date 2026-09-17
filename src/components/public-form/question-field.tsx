"use client"

import { StarIcon } from "lucide-react"

import { QuestionType } from "@/generated/prisma/enums"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "cn"
import type { AnswerValue } from "@/lib/conditions"
import type { PublicQuestion } from "@/components/public-form/types"

type Props = {
  question: PublicQuestion
  value: AnswerValue
  onChange: (value: AnswerValue) => void
}

export function QuestionField({ question, value, onChange }: Props) {
  switch (question.type) {
    case QuestionType.SHORT_TEXT:
      return (
        <Input
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )

    case QuestionType.LONG_TEXT:
      return (
        <Textarea
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
        />
      )

    case QuestionType.EMAIL:
      return (
        <Input
          type="email"
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )

    case QuestionType.NUMBER:
      return (
        <Input
          type="number"
          value={typeof value === "string" || typeof value === "number" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )

    case QuestionType.DATE:
      return (
        <Input
          type="date"
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )

    case QuestionType.BOOLEAN:
      return (
        <RadioGroup
          value={value === true ? "true" : value === false ? "false" : ""}
          onValueChange={(v) => onChange(v === "true")}
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="true" id={`${question.id}-yes`} />
            <Label htmlFor={`${question.id}-yes`}>Sim</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="false" id={`${question.id}-no`} />
            <Label htmlFor={`${question.id}-no`}>Não</Label>
          </div>
        </RadioGroup>
      )

    case QuestionType.SINGLE_CHOICE:
      return (
        <RadioGroup
          value={typeof value === "string" ? value : ""}
          onValueChange={onChange}
        >
          {question.options.map((option, i) => (
            <div key={`${option}-${i}`} className="flex items-center gap-2">
              <RadioGroupItem value={option} id={`${question.id}-${i}`} />
              <Label htmlFor={`${question.id}-${i}`}>{option}</Label>
            </div>
          ))}
        </RadioGroup>
      )

    case QuestionType.DROPDOWN:
      return (
        <Select
          value={typeof value === "string" ? value : ""}
          onValueChange={onChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent>
            {question.options.map((option, i) => (
              <SelectItem key={`${option}-${i}`} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )

    case QuestionType.MULTIPLE_CHOICE: {
      const selected = Array.isArray(value) ? value : []
      return (
        <div className="flex flex-col gap-2">
          {question.options.map((option, i) => (
            <div key={`${option}-${i}`} className="flex items-center gap-2">
              <Checkbox
                id={`${question.id}-${i}`}
                checked={selected.includes(option)}
                onCheckedChange={(checked) =>
                  onChange(
                    checked
                      ? [...selected, option]
                      : selected.filter((v) => v !== option)
                  )
                }
              />
              <Label htmlFor={`${question.id}-${i}`}>{option}</Label>
            </div>
          ))}
        </div>
      )
    }

    case QuestionType.RATING: {
      const current = typeof value === "string" ? Number(value) : 0
      return (
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(String(n))}
              aria-label={`${n} de 5`}
              className="p-1"
            >
              <StarIcon
                className={cn(
                  "size-6",
                  n <= current
                    ? "fill-primary text-primary"
                    : "text-muted-foreground"
                )}
              />
            </button>
          ))}
        </div>
      )
    }

    default:
      return null
  }
}

"use client"

import { useState, useTransition } from "react"
import { CheckCircle2Icon } from "lucide-react"

import { getVisibleQuestionIds, type AnswerValue } from "@/lib/conditions"
import { submitResponseAction } from "@/lib/actions/responses"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { QuestionField } from "@/components/public-form/question-field"
import type { PublicQuestion } from "@/components/public-form/types"

type Props = {
  formId: string
  title: string
  description: string | null
  questions: PublicQuestion[]
}

function isEmpty(value: AnswerValue) {
  if (value === null || value === undefined) return true
  if (typeof value === "string") return value.trim() === ""
  if (Array.isArray(value)) return value.length === 0
  return false
}

export function FormFiller({ formId, title, description, questions }: Props) {
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({})
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [isPending, startTransition] = useTransition()

  const visibleIds = getVisibleQuestionIds(questions, answers)
  const visibleQuestions = questions.filter((q) => visibleIds.has(q.id))

  function setAnswer(questionId: string, value: AnswerValue) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    for (const question of visibleQuestions) {
      if (question.required && isEmpty(answers[question.id])) {
        setError(`A pergunta "${question.label}" é obrigatória.`)
        return
      }
    }

    startTransition(async () => {
      const result = await submitResponseAction({ formId, answers })
      if (result.error) {
        setError(result.error)
      } else {
        setSubmitted(true)
      }
    })
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <CheckCircle2Icon className="size-12 text-primary" />
        <h1 className="text-xl font-semibold">Respostas enviadas!</h1>
        <p className="text-muted-foreground">Obrigado por responder.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">{title}</h1>
        {description ? (
          <p className="text-muted-foreground">{description}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-6">
        {visibleQuestions.map((question) => (
          <div key={question.id} className="flex flex-col gap-2">
            <Label>
              {question.label}
              {question.required ? (
                <span className="text-destructive"> *</span>
              ) : null}
            </Label>
            {question.description ? (
              <p className="text-sm text-muted-foreground">
                {question.description}
              </p>
            ) : null}
            <QuestionField
              question={question}
              value={answers[question.id]}
              onChange={(value) => setAnswer(question.id, value)}
            />
          </div>
        ))}
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button type="submit" disabled={isPending} size="lg" className="w-fit">
        {isPending ? "Enviando..." : "Enviar respostas"}
      </Button>
    </form>
  )
}

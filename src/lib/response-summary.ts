import { CHOICE_TYPES } from "@/lib/question-types"
import { QuestionType } from "@/generated/prisma/enums"

export type QuestionSummary = {
  questionId: string
  label: string
  type: string
  totalAnswered: number
  counts: { label: string; count: number; percentage: number }[]
  average?: number
}

type QuestionLike = { id: string; label: string; type: string; options: string[] }
type AnswerLike = { questionId: string; value: unknown }
type ResponseLike = { answers: AnswerLike[] }

function pct(count: number, total: number) {
  if (total === 0) return 0
  return Math.round((count / total) * 100)
}

export function computeSummary(
  questions: QuestionLike[],
  responses: ResponseLike[]
): QuestionSummary[] {
  return questions.map((question) => {
    const values: unknown[] = []
    for (const response of responses) {
      const answer = response.answers.find((a) => a.questionId === question.id)
      if (answer) values.push(answer.value)
    }

    const totalAnswered = values.length

    if (question.type === QuestionType.BOOLEAN) {
      const yes = values.filter((v) => v === true).length
      const no = values.filter((v) => v === false).length
      return {
        questionId: question.id,
        label: question.label,
        type: question.type,
        totalAnswered,
        counts: [
          { label: "Sim", count: yes, percentage: pct(yes, totalAnswered) },
          { label: "Não", count: no, percentage: pct(no, totalAnswered) },
        ],
      }
    }

    if (CHOICE_TYPES.has(question.type)) {
      const counter = new Map<string, number>()
      for (const value of values) {
        const list = Array.isArray(value) ? value : [value]
        for (const item of list) {
          if (typeof item !== "string") continue
          counter.set(item, (counter.get(item) ?? 0) + 1)
        }
      }
      const counts = question.options.map((option) => ({
        label: option,
        count: counter.get(option) ?? 0,
        percentage: pct(counter.get(option) ?? 0, totalAnswered),
      }))
      return {
        questionId: question.id,
        label: question.label,
        type: question.type,
        totalAnswered,
        counts,
      }
    }

    if (question.type === QuestionType.RATING) {
      const nums = values
        .map((v) => Number(v))
        .filter((n) => !Number.isNaN(n))
      const average = nums.length
        ? nums.reduce((a, b) => a + b, 0) / nums.length
        : undefined
      return {
        questionId: question.id,
        label: question.label,
        type: question.type,
        totalAnswered,
        counts: [],
        average,
      }
    }

    return {
      questionId: question.id,
      label: question.label,
      type: question.type,
      totalAnswered,
      counts: [],
    }
  })
}

export function formatAnswerValue(value: unknown): string {
  if (value === null || value === undefined) return "—"
  if (Array.isArray(value)) return value.join(", ")
  if (typeof value === "boolean") return value ? "Sim" : "Não"
  return String(value)
}

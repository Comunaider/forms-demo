"use server"

import { revalidatePath } from "next/cache"

import { prisma } from "@/lib/prisma"
import { getVisibleQuestionIds, type AnswerValue } from "@/lib/conditions"
import { submitResponseSchema } from "@/lib/validations/responses"
import type { Prisma } from "@/generated/prisma/client"

export type SubmitResponseState = {
  error?: string
  success?: boolean
}

function isEmptyAnswer(value: AnswerValue): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === "string") return value.trim() === ""
  if (Array.isArray(value)) return value.length === 0
  return false
}

export async function submitResponseAction(
  input: unknown
): Promise<SubmitResponseState> {
  const parsed = submitResponseSchema.safeParse(input)
  if (!parsed.success) {
    return { error: "Não foi possível enviar suas respostas." }
  }

  const { formId, respondentEmail, answers } = parsed.data

  const form = await prisma.form.findUnique({
    where: { id: formId },
    include: {
      questions: { include: { conditions: true }, orderBy: { order: "asc" } },
    },
  })

  if (!form || form.status !== "PUBLISHED") {
    return { error: "Este formulário não está disponível para respostas." }
  }

  const questionsForEval = form.questions.map((q) => ({
    id: q.id,
    conditions: q.conditions.map((c) => ({
      sourceQuestionId: c.sourceQuestionId,
      operator: c.operator,
      action: c.action,
      value: String(c.value),
    })),
  }))

  const visibleIds = getVisibleQuestionIds(questionsForEval, answers)

  for (const question of form.questions) {
    if (!visibleIds.has(question.id)) continue
    if (question.required && isEmptyAnswer(answers[question.id])) {
      return { error: `A pergunta "${question.label}" é obrigatória.` }
    }
  }

  const answersToCreate = form.questions
    .filter((q) => visibleIds.has(q.id) && !isEmptyAnswer(answers[q.id]))
    .map((q) => ({
      questionId: q.id,
      value: answers[q.id] as Prisma.InputJsonValue,
    }))

  await prisma.formResponse.create({
    data: {
      formId,
      respondentEmail: respondentEmail || null,
      answers: { create: answersToCreate },
    },
  })

  revalidatePath(`/dashboard/forms/${formId}/responses`)
  return { success: true }
}

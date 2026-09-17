"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

import { prisma } from "@/lib/prisma"
import { requireActiveUser } from "@/lib/auth-helpers"
import { CHOICE_TYPES } from "@/lib/question-types"
import { createFormSchema, saveFormSchema } from "@/lib/validations/forms"
import type {
  ConditionAction,
  ConditionOperator,
  QuestionType,
} from "@/generated/prisma/enums"
import { FormStatus } from "@/generated/prisma/enums"

export type FormActionState = {
  error?: string
}

export async function createFormAction(
  _prevState: FormActionState,
  formData: FormData
): Promise<FormActionState> {
  const session = await requireActiveUser()

  const parsed = createFormSchema.safeParse({ title: formData.get("title") })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" }
  }

  const form = await prisma.form.create({
    data: {
      title: parsed.data.title,
      userId: session.user.id,
    },
  })

  redirect(`/dashboard/forms/${form.id}/edit`)
}

export async function deleteFormAction(formId: string) {
  const session = await requireActiveUser()

  const form = await prisma.form.findUnique({ where: { id: formId } })
  if (!form || form.userId !== session.user.id) {
    throw new Error("Formulário não encontrado")
  }

  await prisma.form.delete({ where: { id: formId } })
  revalidatePath("/dashboard")
}

export async function setFormStatusAction(
  formId: string,
  status: (typeof FormStatus)[keyof typeof FormStatus]
) {
  const session = await requireActiveUser()

  const form = await prisma.form.findUnique({ where: { id: formId } })
  if (!form || form.userId !== session.user.id) {
    throw new Error("Formulário não encontrado")
  }

  await prisma.form.update({ where: { id: formId }, data: { status } })
  revalidatePath("/dashboard")
  revalidatePath(`/dashboard/forms/${formId}/edit`)
}

export async function saveFormAction(input: unknown): Promise<FormActionState> {
  const session = await requireActiveUser()

  const parsed = saveFormSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" }
  }

  const { formId, title, description, questions } = parsed.data

  const form = await prisma.form.findUnique({ where: { id: formId } })
  if (!form || form.userId !== session.user.id) {
    return { error: "Formulário não encontrado" }
  }

  await prisma.$transaction(async (tx) => {
    await tx.form.update({
      where: { id: formId },
      data: { title, description: description || null },
    })

    const existingQuestions = await tx.question.findMany({
      where: { formId },
      select: { id: true },
    })
    const existingIds = new Set(existingQuestions.map((q) => q.id))
    const incomingExistingIds = new Set(
      questions.filter((q) => existingIds.has(q.id)).map((q) => q.id)
    )

    const toDelete = [...existingIds].filter(
      (id) => !incomingExistingIds.has(id)
    )
    if (toDelete.length > 0) {
      await tx.question.deleteMany({ where: { id: { in: toDelete } } })
    }

    const idMap = new Map<string, string>()
    for (let index = 0; index < questions.length; index++) {
      const q = questions[index]
      const data = {
        formId,
        order: index,
        type: q.type as QuestionType,
        label: q.label,
        description: q.description || null,
        required: q.required,
        options: CHOICE_TYPES.has(q.type) ? q.options : [],
      }

      if (existingIds.has(q.id)) {
        await tx.question.update({ where: { id: q.id }, data })
        idMap.set(q.id, q.id)
      } else {
        const created = await tx.question.create({ data })
        idMap.set(q.id, created.id)
      }
    }

    const questionIds = [...idMap.values()]
    await tx.conditionalRule.deleteMany({
      where: { questionId: { in: questionIds } },
    })

    for (const q of questions) {
      const targetId = idMap.get(q.id)
      if (!targetId) continue

      for (const c of q.conditions) {
        const sourceId = idMap.get(c.sourceQuestionId)
        if (!sourceId || sourceId === targetId) continue

        await tx.conditionalRule.create({
          data: {
            questionId: targetId,
            sourceQuestionId: sourceId,
            operator: c.operator as ConditionOperator,
            action: c.action as ConditionAction,
            value: c.value,
          },
        })
      }
    }
  })

  revalidatePath(`/dashboard/forms/${formId}/edit`)
  revalidatePath("/dashboard")
  return {}
}

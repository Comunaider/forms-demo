import { z } from "zod"

import { ConditionAction, ConditionOperator, QuestionType } from "@/generated/prisma/enums"

const questionTypeValues = Object.values(QuestionType) as [string, ...string[]]
const operatorValues = Object.values(ConditionOperator) as [string, ...string[]]
const actionValues = Object.values(ConditionAction) as [string, ...string[]]

export const conditionDraftSchema = z.object({
  id: z.string(),
  sourceQuestionId: z.string().min(1),
  operator: z.enum(operatorValues),
  action: z.enum(actionValues),
  value: z.string().min(1, "Informe um valor para a condição"),
})

export const questionDraftSchema = z.object({
  id: z.string(),
  type: z.enum(questionTypeValues),
  label: z.string().min(1, "Informe o texto da pergunta"),
  description: z.string().optional().default(""),
  required: z.boolean().default(false),
  options: z.array(z.string().min(1)).default([]),
  conditions: z.array(conditionDraftSchema).default([]),
})

export const saveFormSchema = z.object({
  formId: z.string(),
  title: z.string().min(1, "Informe um título"),
  description: z.string().optional().default(""),
  questions: z.array(questionDraftSchema),
})

export type QuestionDraft = z.infer<typeof questionDraftSchema>
export type ConditionDraft = z.infer<typeof conditionDraftSchema>
export type SaveFormInput = z.infer<typeof saveFormSchema>

export const createFormSchema = z.object({
  title: z.string().min(1, "Informe um título"),
})

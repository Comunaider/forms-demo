import { QuestionType } from "@/generated/prisma/enums"

export type ConditionDraft = {
  id: string
  sourceQuestionId: string
  operator: string
  action: string
  value: string
}

export type QuestionDraft = {
  id: string
  type: string
  label: string
  description: string
  required: boolean
  options: string[]
  conditions: ConditionDraft[]
}

let counter = 0
function tempId(prefix: string) {
  counter += 1
  return `${prefix}-${Date.now()}-${counter}`
}

export function createEmptyQuestion(type: string = QuestionType.SHORT_TEXT): QuestionDraft {
  return {
    id: tempId("new-question"),
    type,
    label: "",
    description: "",
    required: false,
    options: type === QuestionType.SINGLE_CHOICE ||
      type === QuestionType.MULTIPLE_CHOICE ||
      type === QuestionType.DROPDOWN
      ? ["Opção 1"]
      : [],
    conditions: [],
  }
}

export function createEmptyCondition(sourceQuestionId: string): ConditionDraft {
  return {
    id: tempId("new-condition"),
    sourceQuestionId,
    operator: "EQUALS",
    action: "SHOW",
    value: "",
  }
}

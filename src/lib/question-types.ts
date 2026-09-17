import { ConditionOperator, QuestionType } from "@/generated/prisma/enums"

export const CHOICE_TYPES: ReadonlySet<string> = new Set([
  QuestionType.SINGLE_CHOICE,
  QuestionType.MULTIPLE_CHOICE,
  QuestionType.DROPDOWN,
])

export const QUESTION_TYPE_LABELS: Record<string, string> = {
  [QuestionType.SHORT_TEXT]: "Texto curto",
  [QuestionType.LONG_TEXT]: "Texto longo",
  [QuestionType.BOOLEAN]: "Sim/Não",
  [QuestionType.SINGLE_CHOICE]: "Múltipla escolha (uma opção)",
  [QuestionType.MULTIPLE_CHOICE]: "Múltipla escolha (várias opções)",
  [QuestionType.DROPDOWN]: "Lista suspensa",
  [QuestionType.EMAIL]: "Email",
  [QuestionType.NUMBER]: "Número",
  [QuestionType.DATE]: "Data",
  [QuestionType.RATING]: "Avaliação (1 a 5)",
}

export const QUESTION_TYPE_OPTIONS = Object.entries(QUESTION_TYPE_LABELS).map(
  ([value, label]) => ({ value, label })
)

export const OPERATOR_LABELS: Record<string, string> = {
  [ConditionOperator.EQUALS]: "é igual a",
  [ConditionOperator.NOT_EQUALS]: "é diferente de",
  [ConditionOperator.CONTAINS]: "contém",
  [ConditionOperator.GREATER_THAN]: "é maior que",
  [ConditionOperator.LESS_THAN]: "é menor que",
}

export const OPERATOR_OPTIONS = Object.entries(OPERATOR_LABELS).map(
  ([value, label]) => ({ value, label })
)

export const ACTION_LABELS: Record<string, string> = {
  SHOW: "mostrar esta pergunta",
  HIDE: "esconder esta pergunta",
}

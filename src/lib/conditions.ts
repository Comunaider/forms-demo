export type AnswerValue = string | string[] | boolean | number | null | undefined

export type ConditionForEval = {
  sourceQuestionId: string
  operator: string
  action: string
  value: string
}

export type QuestionForEval = {
  id: string
  conditions: ConditionForEval[]
}

function matchesOperator(
  operator: string,
  answer: AnswerValue,
  ruleValue: string
): boolean {
  if (answer === undefined || answer === null || answer === "") {
    return false
  }

  switch (operator) {
    case "EQUALS":
      if (Array.isArray(answer)) return answer.includes(ruleValue)
      return String(answer) === ruleValue
    case "NOT_EQUALS":
      if (Array.isArray(answer)) return !answer.includes(ruleValue)
      return String(answer) !== ruleValue
    case "CONTAINS":
      if (Array.isArray(answer)) return answer.includes(ruleValue)
      return String(answer).toLowerCase().includes(ruleValue.toLowerCase())
    case "GREATER_THAN": {
      const n = Number(answer)
      const r = Number(ruleValue)
      return !Number.isNaN(n) && !Number.isNaN(r) && n > r
    }
    case "LESS_THAN": {
      const n = Number(answer)
      const r = Number(ruleValue)
      return !Number.isNaN(n) && !Number.isNaN(r) && n < r
    }
    default:
      return false
  }
}

/**
 * A question with rules is visible only when every rule passes: a SHOW rule
 * passes when the source answer matches, a HIDE rule passes when it doesn't.
 */
export function isQuestionVisible(
  question: QuestionForEval,
  answers: Record<string, AnswerValue>
): boolean {
  if (question.conditions.length === 0) {
    return true
  }

  return question.conditions.every((rule) => {
    const matches = matchesOperator(
      rule.operator,
      answers[rule.sourceQuestionId],
      rule.value
    )
    return rule.action === "SHOW" ? matches : !matches
  })
}

export function getVisibleQuestionIds<T extends QuestionForEval>(
  questions: T[],
  answers: Record<string, AnswerValue>
): Set<string> {
  return new Set(
    questions.filter((q) => isQuestionVisible(q, answers)).map((q) => q.id)
  )
}

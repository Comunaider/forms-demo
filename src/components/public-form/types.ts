import type { ConditionForEval } from "@/lib/conditions"

export type PublicQuestion = {
  id: string
  type: string
  label: string
  description: string | null
  required: boolean
  options: string[]
  conditions: ConditionForEval[]
}

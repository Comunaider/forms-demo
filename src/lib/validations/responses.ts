import { z } from "zod"

const answerValueSchema = z.union([
  z.string(),
  z.array(z.string()),
  z.boolean(),
  z.number(),
  z.null(),
])

export const submitResponseSchema = z.object({
  formId: z.string().min(1),
  respondentEmail: z.string().optional(),
  answers: z.record(z.string(), answerValueSchema),
})

export type SubmitResponsePayload = z.infer<typeof submitResponseSchema>

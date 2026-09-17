import { prisma } from "@/lib/prisma"
import { FormFiller } from "@/components/public-form/form-filler"
import type { PublicQuestion } from "@/components/public-form/types"

export default async function PublicFormPage({
  params,
}: {
  params: Promise<{ formId: string }>
}) {
  const { formId } = await params

  const form = await prisma.form.findUnique({
    where: { id: formId },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: { conditions: true },
      },
    },
  })

  if (!form || form.status !== "PUBLISHED") {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-center">
        <p className="text-muted-foreground">
          Este formulário não está disponível no momento.
        </p>
      </div>
    )
  }

  const questions: PublicQuestion[] = form.questions.map((q) => ({
    id: q.id,
    type: q.type,
    label: q.label,
    description: q.description,
    required: q.required,
    options: Array.isArray(q.options) ? (q.options as string[]) : [],
    conditions: q.conditions.map((c) => ({
      sourceQuestionId: c.sourceQuestionId,
      operator: c.operator,
      action: c.action,
      value: String(c.value),
    })),
  }))

  return (
    <div className="flex flex-1 justify-center p-6">
      <div className="w-full max-w-xl py-8">
        <FormFiller
          formId={form.id}
          title={form.title}
          description={form.description}
          questions={questions}
        />
      </div>
    </div>
  )
}

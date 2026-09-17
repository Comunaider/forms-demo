import { notFound } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { LinkButton } from "@/components/link-button"
import { FormBuilder } from "@/components/builder/form-builder"
import { PublishToggle } from "@/components/builder/publish-toggle"
import { CopyLinkButton } from "@/components/copy-link-button"
import type { QuestionDraft } from "@/components/builder/types"
import { FormStatus } from "@/generated/prisma/enums"

export default async function EditFormPage({
  params,
}: {
  params: Promise<{ formId: string }>
}) {
  const { formId } = await params
  const session = await auth()

  const form = await prisma.form.findUnique({
    where: { id: formId },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: { conditions: true },
      },
    },
  })

  if (!form || form.userId !== session?.user.id) {
    notFound()
  }

  const initialQuestions: QuestionDraft[] = form.questions.map((q) => ({
    id: q.id,
    type: q.type,
    label: q.label,
    description: q.description ?? "",
    required: q.required,
    options: Array.isArray(q.options) ? (q.options as string[]) : [],
    conditions: q.conditions.map((c) => ({
      id: c.id,
      sourceQuestionId: c.sourceQuestionId,
      operator: c.operator,
      action: c.action,
      value: String(c.value),
    })),
  }))

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const publicUrl = `${appUrl}/f/${form.id}`

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <LinkButton
          href="/dashboard"
          variant="ghost"
          size="sm"
          className="w-fit -ml-2"
        >
          <ArrowLeftIcon className="size-4" />
          Voltar
        </LinkButton>
        <div className="flex items-center gap-2">
          {form.status === FormStatus.PUBLISHED ? (
            <CopyLinkButton url={publicUrl} />
          ) : null}
          <PublishToggle formId={form.id} status={form.status} />
        </div>
      </div>

      <FormBuilder
        formId={form.id}
        initialTitle={form.title}
        initialDescription={form.description ?? ""}
        initialQuestions={initialQuestions}
      />
    </div>
  )
}

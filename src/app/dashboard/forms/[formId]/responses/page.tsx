import { notFound } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { computeSummary, formatAnswerValue } from "@/lib/response-summary"
import { LinkButton } from "@/components/link-button"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ResponseSummaryCard } from "@/components/dashboard/response-summary-card"

export default async function FormResponsesPage({
  params,
}: {
  params: Promise<{ formId: string }>
}) {
  const { formId } = await params
  const session = await auth()

  const form = await prisma.form.findUnique({
    where: { id: formId },
    include: {
      questions: { orderBy: { order: "asc" } },
      responses: {
        orderBy: { submittedAt: "desc" },
        include: { answers: true },
      },
    },
  })

  if (!form || form.userId !== session?.user.id) {
    notFound()
  }

  const questions = form.questions.map((q) => ({
    id: q.id,
    label: q.label,
    type: q.type,
    options: Array.isArray(q.options) ? (q.options as string[]) : [],
  }))

  const summaries = computeSummary(questions, form.responses)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <LinkButton
          href="/dashboard"
          variant="ghost"
          size="sm"
          className="w-fit -ml-2"
        >
          <ArrowLeftIcon className="size-4" />
          Voltar
        </LinkButton>
      </div>

      <div>
        <h1 className="text-2xl font-semibold">{form.title}</h1>
        <p className="text-sm text-muted-foreground">
          {form.responses.length} resposta
          {form.responses.length === 1 ? "" : "s"}
        </p>
      </div>

      {form.responses.length === 0 ? (
        <p className="text-muted-foreground">
          Este formulário ainda não recebeu respostas.
        </p>
      ) : (
        <Tabs defaultValue="summary">
          <TabsList>
            <TabsTrigger value="summary">Resumo</TabsTrigger>
            <TabsTrigger value="table">Respostas individuais</TabsTrigger>
          </TabsList>
          <TabsContent value="summary" className="flex flex-col gap-4 pt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {summaries.map((summary) => (
                <ResponseSummaryCard key={summary.questionId} summary={summary} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="table" className="pt-4">
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    {form.questions.map((q) => (
                      <TableHead key={q.id}>{q.label}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {form.responses.map((response) => (
                    <TableRow key={response.id}>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {response.submittedAt.toLocaleString("pt-BR")}
                      </TableCell>
                      {form.questions.map((q) => {
                        const answer = response.answers.find(
                          (a) => a.questionId === q.id
                        )
                        return (
                          <TableCell key={q.id}>
                            {formatAnswerValue(answer?.value)}
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

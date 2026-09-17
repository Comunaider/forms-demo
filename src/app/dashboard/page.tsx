import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { LinkButton } from "@/components/link-button"
import { NewFormDialog } from "@/components/dashboard/new-form-dialog"
import { DeleteFormButton } from "@/components/dashboard/delete-form-button"

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Rascunho",
  PUBLISHED: "Publicado",
  CLOSED: "Encerrado",
}

const STATUS_VARIANTS: Record<string, "secondary" | "default" | "outline"> = {
  DRAFT: "secondary",
  PUBLISHED: "default",
  CLOSED: "outline",
}

export default async function DashboardPage() {
  const session = await auth()

  const forms = await prisma.form.findMany({
    where: { userId: session!.user.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { questions: true, responses: true } } },
  })

  const totalResponses = forms.reduce((sum, f) => sum + f._count.responses, 0)

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Seus formulários</h1>
          <p className="text-sm text-muted-foreground">
            {forms.length} formulário{forms.length === 1 ? "" : "s"} ·{" "}
            {totalResponses} resposta{totalResponses === 1 ? "" : "s"} no total
          </p>
        </div>
        <NewFormDialog />
      </div>

      {forms.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <p className="text-muted-foreground">
              Você ainda não criou nenhum formulário.
            </p>
            <NewFormDialog />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {forms.map((form) => (
            <Card key={form.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <CardTitle className="line-clamp-1">{form.title}</CardTitle>
                <Badge variant={STATUS_VARIANTS[form.status]}>
                  {STATUS_LABELS[form.status]}
                </Badge>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {form._count.questions} pergunta
                {form._count.questions === 1 ? "" : "s"} ·{" "}
                {form._count.responses} resposta
                {form._count.responses === 1 ? "" : "s"}
              </CardContent>
              <CardFooter className="flex items-center justify-between">
                <div className="flex gap-2">
                  <LinkButton
                    href={`/dashboard/forms/${form.id}/edit`}
                    variant="outline"
                    size="sm"
                  >
                    Editar
                  </LinkButton>
                  <LinkButton
                    href={`/dashboard/forms/${form.id}/responses`}
                    variant="outline"
                    size="sm"
                  >
                    Respostas
                  </LinkButton>
                </div>
                <DeleteFormButton formId={form.id} title={form.title} />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

import { CheckIcon } from "lucide-react"

import { auth } from "@/auth"
import { createCheckoutSessionAction } from "@/lib/actions/billing"
import { SubmitButton } from "@/components/submit-button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const features = [
  "Formulários ilimitados",
  "Perguntas com lógica condicional",
  "Dashboard com respostas em tempo real",
]

export default async function SubscribePage() {
  const session = await auth()

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Assine para continuar</CardTitle>
          <CardDescription>
            {session?.user.subscriptionStatus === "PAST_DUE"
              ? "Seu pagamento está pendente. Atualize sua assinatura para voltar a criar formulários."
              : session?.user.subscriptionStatus === "CANCELED"
                ? "Sua assinatura foi cancelada. Assine novamente para voltar a usar a plataforma."
                : "Você precisa de uma assinatura ativa para criar e gerenciar formulários."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-2">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm">
                <CheckIcon className="size-4 text-primary" />
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <form action={createCheckoutSessionAction} className="w-full">
            <SubmitButton className="w-full" pendingText="Redirecionando...">
              Assinar agora
            </SubmitButton>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}

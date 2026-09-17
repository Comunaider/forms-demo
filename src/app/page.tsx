import { auth } from "@/auth"
import { LinkButton } from "@/components/link-button"

export default async function Home() {
  const session = await auth()

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto w-full">
        <span className="font-semibold text-lg">Formulários</span>
        <nav className="flex items-center gap-3">
          {session ? (
            <LinkButton href="/dashboard">Ir para o dashboard</LinkButton>
          ) : (
            <>
              <LinkButton href="/login" variant="ghost">
                Entrar
              </LinkButton>
              <LinkButton href="/register">Criar conta</LinkButton>
            </>
          )}
        </nav>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center text-center px-6 gap-6 max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Crie formulários e acompanhe as respostas em um só lugar
        </h1>
        <p className="text-muted-foreground text-lg">
          Monte formulários com texto curto, texto longo, múltipla escolha e
          lógica condicional. Envie para quem quiser e veja tudo em um
          dashboard.
        </p>
        <LinkButton href="/register" size="lg">
          Começar agora
        </LinkButton>
      </main>

      <footer className="px-6 py-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Formulários
      </footer>
    </div>
  )
}

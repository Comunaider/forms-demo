"use client"

import { useTransition } from "react"
import { Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { deleteFormAction } from "@/lib/actions/forms"
import { Button } from "@/components/ui/button"

export function DeleteFormButton({
  formId,
  title,
}: {
  formId: string
  title: string
}) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (
      !window.confirm(
        `Excluir o formulário "${title}"? Essa ação não pode ser desfeita.`
      )
    ) {
      return
    }

    startTransition(async () => {
      try {
        await deleteFormAction(formId)
        toast.success("Formulário excluído")
      } catch {
        toast.error("Não foi possível excluir o formulário")
      }
    })
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={isPending}
      aria-label="Excluir formulário"
    >
      <Trash2Icon className="size-4" />
    </Button>
  )
}

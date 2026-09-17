"use client"

import { useTransition } from "react"
import { toast } from "sonner"

import { setFormStatusAction } from "@/lib/actions/forms"
import { Button } from "@/components/ui/button"
import { FormStatus } from "@/generated/prisma/enums"

type Props = {
  formId: string
  status: string
}

export function PublishToggle({ formId, status }: Props) {
  const [isPending, startTransition] = useTransition()
  const isPublished = status === FormStatus.PUBLISHED

  function toggle() {
    const next = isPublished ? FormStatus.DRAFT : FormStatus.PUBLISHED
    startTransition(async () => {
      try {
        await setFormStatusAction(formId, next)
        toast.success(isPublished ? "Formulário despublicado" : "Formulário publicado")
      } catch {
        toast.error("Não foi possível atualizar o status")
      }
    })
  }

  return (
    <Button
      type="button"
      variant={isPublished ? "outline" : "default"}
      onClick={toggle}
      disabled={isPending}
    >
      {isPublished ? "Despublicar" : "Publicar"}
    </Button>
  )
}

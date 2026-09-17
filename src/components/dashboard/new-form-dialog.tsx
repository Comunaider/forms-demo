"use client"

import { useActionState, useState } from "react"
import { PlusIcon } from "lucide-react"

import { createFormAction, type FormActionState } from "@/lib/actions/forms"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { SubmitButton } from "@/components/submit-button"

const initialState: FormActionState = {}

export function NewFormDialog() {
  const [open, setOpen] = useState(false)
  const [state, formAction] = useActionState(createFormAction, initialState)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <PlusIcon className="size-4" />
        Novo formulário
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo formulário</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              name="title"
              placeholder="Pesquisa de satisfação"
              required
              autoFocus
            />
          </div>
          {state.error ? (
            <p className="text-sm text-destructive">{state.error}</p>
          ) : null}
          <DialogFooter>
            <SubmitButton pendingText="Criando...">Criar</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

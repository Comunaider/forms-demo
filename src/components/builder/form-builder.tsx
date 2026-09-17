"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { PlusIcon } from "lucide-react"

import { saveFormAction } from "@/lib/actions/forms"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { QuestionEditor } from "@/components/builder/question-editor"
import { createEmptyQuestion, type QuestionDraft } from "@/components/builder/types"

type Props = {
  formId: string
  initialTitle: string
  initialDescription: string
  initialQuestions: QuestionDraft[]
}

export function FormBuilder({
  formId,
  initialTitle,
  initialDescription,
  initialQuestions,
}: Props) {
  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState(initialDescription)
  const [questions, setQuestions] = useState<QuestionDraft[]>(initialQuestions)
  const [isPending, startTransition] = useTransition()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  function updateQuestion(id: string, patch: Partial<QuestionDraft>) {
    setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, ...patch } : q)))
  }

  function removeQuestion(id: string) {
    setQuestions((qs) =>
      qs
        .filter((q) => q.id !== id)
        .map((q) => ({
          ...q,
          conditions: q.conditions.filter((c) => c.sourceQuestionId !== id),
        }))
    )
  }

  function addQuestion() {
    setQuestions((qs) => [...qs, createEmptyQuestion()])
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setQuestions((qs) => {
      const oldIndex = qs.findIndex((q) => q.id === active.id)
      const newIndex = qs.findIndex((q) => q.id === over.id)
      return arrayMove(qs, oldIndex, newIndex)
    })
  }

  function handleSave() {
    if (!title.trim()) {
      toast.error("Informe um título para o formulário")
      return
    }
    for (const q of questions) {
      if (!q.label.trim()) {
        toast.error("Todas as perguntas precisam de um texto")
        return
      }
    }

    startTransition(async () => {
      const result = await saveFormAction({
        formId,
        title,
        description,
        questions,
      })
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Alterações salvas")
      }
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border bg-card p-4 flex flex-col gap-3">
        <div className="grid gap-2">
          <Label htmlFor="form-title">Título do formulário</Label>
          <Input
            id="form-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Pesquisa de satisfação"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="form-description">Descrição (opcional)</Label>
          <Textarea
            id="form-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={questions.map((q) => q.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-4">
            {questions.map((question, index) => (
              <QuestionEditor
                key={question.id}
                question={question}
                index={index}
                availableSourceQuestions={questions.slice(0, index)}
                onChange={(patch) => updateQuestion(question.id, patch)}
                onRemove={() => removeQuestion(question.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {questions.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Nenhuma pergunta ainda. Adicione a primeira abaixo.
        </div>
      ) : null}

      <Button type="button" variant="outline" onClick={addQuestion} className="w-fit">
        <PlusIcon className="size-4" />
        Adicionar pergunta
      </Button>

      <div className="sticky bottom-4 flex justify-end">
        <Button onClick={handleSave} disabled={isPending} size="lg">
          {isPending ? "Salvando..." : "Salvar alterações"}
        </Button>
      </div>
    </div>
  )
}

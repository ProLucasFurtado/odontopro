"use client"

import { Button } from "@/components/ui/button";
import { useReminderForm, ReminderFormdata } from "./reminder-form";
import { Controller, useWatch } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { createReminder } from "../../_actions/create-reminder";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ReminderContentProps {
  closeDialog: () => void;
}

export function ReminderContent({ closeDialog }: ReminderContentProps) {

  const form = useReminderForm();
  const router = useRouter();

  // Observa a descrição em tempo real
  const description = useWatch({
    control: form.control,
    name: "description",
    defaultValue: "",
  });

  async function onSubmit(formData: ReminderFormdata) {

    const response = await createReminder({ description: formData.description })

    if (response.error) {
      toast.error(response.error)
      return;
    }

    toast.success(response.data)
    router.refresh();
    closeDialog();
  }


  return (
    <div className="grid gap-4 py-4">
      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        {/* Descrição */}
        <Controller
          control={form.control}
          name="description"
          render={({ field }) => (
            <Field>
              <FieldLabel className="font-semibold">
                Descreva o lembrete:
              </FieldLabel>

              <Textarea
                {...field}
                value={field.value ?? ""}
                placeholder="Digite o nome do lembrete..."
                className="max-h-52"
              />

              <FieldError />
            </Field>
          )}
        />

        <Button
          type="submit"
          disabled={!description?.trim()}
        >
          Cadastrar lembrete
        </Button>
      </form>
    </div>
  )
}
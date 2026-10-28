"use client"

import { Controller } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { useState } from 'react';
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DialogServiceFormData, useDialogServiceForm } from "./dialog-service-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { convertRealToCents } from "@/utils/convertCurrency";
import { createNewService } from '../_actions/create-service';
import { updateService } from '../_actions/update-service';
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface DialogServiceProps {
  closeModal: () => void;
  serviceId?: string;
  initialValues?: {
    name: string;
    price: string;
    hours: string;
    minutes: string;
  }
}

export function DialogService({ closeModal, initialValues, serviceId }: DialogServiceProps) {

  const form = useDialogServiceForm({ initialValues: initialValues })
  const [loading, setLoading] = useState(false);
  const router = useRouter();


  async function onSubmit(values: DialogServiceFormData) {
    setLoading(true);
    const priceInCents = convertRealToCents(values.price)
    const hours = parseInt(values.hours) || 0;
    const minutes = parseInt(values.minutes) || 0;

    // Converter as horas e minutos para duração total em minutos;
    const duration = (hours * 60) + minutes;

    if (serviceId) {
      await editServiceById({
        serviceId: serviceId,
        name: values.name,
        priceInCents: priceInCents,
        duration: duration
      })

      return;
    }

    const response = await createNewService({
      name: values.name,
      price: priceInCents,
      duration: duration
    })

    setLoading(false);


    if (response.error) {
      toast.error(response.error)
      return;
    }

    toast.success("Serviço cadastrado com sucesso")
    handleCloseModal();
    router.refresh();

  }


  async function editServiceById({
    serviceId,
    name,
    priceInCents,
    duration }: {
      serviceId: string,
      name: string,
      priceInCents: number,
      duration: number
    }) {

    const response = await updateService({
      serviceId: serviceId,
      name: name,
      price: priceInCents,
      duration: duration
    })

    setLoading(false);


    if (response.error) {
      toast(response.error)
      return;
    }

    toast(response.data)
    handleCloseModal();

  }


  function handleCloseModal() {
    form.reset();
    closeModal();
  }


  function changeCurrency(event: React.ChangeEvent<HTMLInputElement>) {
    let { value } = event.target;
    value = value.replace(/\D/g, '');

    if (value) {
      value = (parseInt(value, 10) / 100).toFixed(2);
      value = value.replace('.', ',');
      value = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    }

    event.target.value = value;
    form.setValue("price", value)

  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Novo Serviço</DialogTitle>
        <DialogDescription>
          Adicione um novo serviço
        </DialogDescription>
      </DialogHeader>

      <form className="space-y-2" onSubmit={form.handleSubmit(onSubmit)}>

        <div className="flex flex-col">
          {/* Nome do serviço */}
          <Controller
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <Field className="my-2" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name} className="font-semibold">
                  Nome do serviço
                </FieldLabel>

                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="Digite o nome do serviço..."
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
                <FieldError />
              </Field>
            )}
          />

          {/* Preço */}
          <Controller
            control={form.control}
            name="price"
            render={({ field, fieldState }) => (
              <Field className="my-2" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name} className="font-semibold">
                  Valor do serviço
                </FieldLabel>

                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="Ex: 120,00"
                  onChange={changeCurrency}
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
                <FieldError />
              </Field>
            )}
          />
        </div>

        <p className="font-semibold">Tempo de duração do serviço:</p>
        <div className="grid grid-cols-2 gap-3">

          {/* Horas */}
          <Controller
            control={form.control}
            name="hours"
            render={({ field, fieldState }) => (
              <Field className="my-2" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name} className="font-semibold">
                  Horas
                </FieldLabel>

                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="1"
                  min="0"
                  type="number"
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
                <FieldError />
              </Field>
            )}
          />

          {/* Minutos */}
          <Controller
            control={form.control}
            name="minutes"
            render={({ field, fieldState }) => (
              <Field className="my-2" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name} className="font-semibold">
                  Minutos
                </FieldLabel>

                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="0"
                  min="0"
                  type="number"
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
                <FieldError />
              </Field>
            )}
          />

        </div>

        <Button
          type="submit"
          className="w-full font-semibold text-white"
          disabled={loading}
        >
          {loading ? "Carregando..." : `${serviceId ? "Atualizar serviço" : "Cadastrar serviço"}`}
        </Button>


      </form>
    </>
  )
}
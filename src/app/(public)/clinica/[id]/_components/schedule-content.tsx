"use client"

import { useCallback, useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import Image from "next/image";
import { MapPin } from "lucide-react";
import imgTest from "../../../../../../public/foto1.png";
import { Prisma } from "@/generated/prisma/client";
import { useAppointmentForm, AppointmentFormData } from "./schedule-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { formatPhone } from "@/utils/formatPhone";
import { DateTimePicker } from "./date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScheduleTimeList } from "./schedule-time-list";
import { createNewAppointment } from "../_actions/create-appointment";
import { toast } from "sonner";

type UserWithServiceAndSubscription = Prisma.UserGetPayload<{
  include: {
    subscription: true;
    services: true;
  }
}>

interface ScheduleContentProps {
  clinic: UserWithServiceAndSubscription;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export function ScheduleContent({ clinic }: ScheduleContentProps) {

  const form = useAppointmentForm();
  const { watch } = form;

  const selectedDate = watch("date");
  const selectedServiceId = watch("serviceId");

  const [selectedTime, setSelectedTime] = useState("");
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Quais os horários bloqueados 01/02/2025 > ["15:00", "18:00"]
  const [blockedTimes, setBlockedTimes] = useState<string[]>([]);

  // Função que busca os horários bloqueados (via Fetch HTTP)
  const fetchBlockedTimes = useCallback(
    async (date: Date): Promise<string[]> => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      // Mantém a data selecionada no calendário,
      // sem convertê-la para UTC usando toISOString().
      const dateString = `${year}-${month}-${day}`;

      const params = new URLSearchParams({
        userId: clinic.id,
        date: dateString,
      });

      const response = await fetch(
        `/api/schedule/get-appointments?${params.toString()}`,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          `Erro ao consultar horários: HTTP ${response.status}`
        );
      }

      const result: unknown = await response.json();

      // A API precisa devolver um array de strings.
      if (
        !Array.isArray(result) ||
        !result.every((item: unknown) => typeof item === "string")
      ) {
        throw new Error(
          "A API não retornou um array válido de horários bloqueados."
        );
      }

      return result as string[];
    },
    [clinic.id]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadAvailableSlots() {
      setLoadingSlots(true);

      try {
        const blocked = await fetchBlockedTimes(selectedDate);

        if (cancelled) return;

        const times = Array.isArray(clinic.times)
          ? [...clinic.times].sort((a, b) => a.localeCompare(b))
          : [];

        const finalSlots = times.map((time) => ({
          time,
          available: !blocked.includes(time),
        }));

        setBlockedTimes(blocked);
        setAvailableTimeSlots(finalSlots);

        // Mantém o horário selecionado somente se continuar disponível.
        setSelectedTime((currentTime) =>
          finalSlots.some(
            (slot) =>
              slot.time === currentTime && slot.available
          )
            ? currentTime
            : ""
        );
      } catch (error) {
        console.error("Erro ao carregar horários:", error);

        if (cancelled) return;

        // Não libera horários quando a consulta à API falha.
        setBlockedTimes([]);
        setAvailableTimeSlots([]);
        setSelectedTime("");

        toast.error(
          "Não foi possível carregar os horários. Tente novamente."
        );
      } finally {
        if (!cancelled) {
          setLoadingSlots(false);
        }
      }
    }

    void loadAvailableSlots();

    return () => {
      cancelled = true;
    };
  }, [selectedDate, clinic.times, fetchBlockedTimes]);

  async function handleRegisterAppointmnent(formData: AppointmentFormData) {
    if (!selectedTime) {
      return;
    }

    const response = await createNewAppointment({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      time: selectedTime,
      date: formData.date,
      serviceId: formData.serviceId,
      clinicId: clinic.id
    })

    if (response.error) {
      toast.error(response.error)
      return;
    }

    toast.success("Consulta agendada com sucesso!")
    form.reset();
    setSelectedTime("")

  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="h-32 bg-emerald-500" />

      <section className="contianer mx-auto px-4 -mt-16">

        <div className="max-w-2xl mx-auto">
          <article className="flex flex-col items-center">
            <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-white mb-8">
              <Image
                src={clinic.image ? clinic.image : imgTest}
                alt="Foto da clinica"
                className="object-cover"
                fill
              />
            </div>

            <h1 className="text-2xl font-bold mb-2">
              {clinic.name}
            </h1>

            <div className="flex items-center gap-1">

              <MapPin className="w-5 h-5" />

              <span>
                {clinic.address ? clinic.address : "Endereço não informado"}
              </span>

            </div>
          </article>

        </div>
      </section>

      <section className="max-w-2xl mx-auto w-full mt-6">

        {/* Formulário de agendamento */}
        <form
          onSubmit={form.handleSubmit(handleRegisterAppointmnent)}
          className="mx-2 space-y-6 bg-white p-6 border rounded-md shadow-sm"
        >

          {/* Nome completo */}
          <Controller
            control={form.control}
            name="name"
            render={({ field }) => (
              <Field className="my-2">
                <FieldLabel className="font-semibold">
                  Nome completo
                </FieldLabel>

                <Input
                  {...field}
                  id={field.name}
                  placeholder="Digite seu nome completo..."
                />
                <FieldError />
              </Field>
            )}
          />

          {/* Email */}
          <Controller
            control={form.control}
            name="email"
            render={({ field }) => (
              <Field className="my-2">
                <FieldLabel className="font-semibold">
                  Email
                </FieldLabel>

                <Input
                  {...field}
                  id={field.name}
                  placeholder="Digite seu email..."
                />
                <FieldError />
              </Field>
            )}
          />

          {/* Telefone */}
          <Controller
            control={form.control}
            name="phone"
            render={({ field }) => (
              <Field className="my-2">
                <FieldLabel className="font-semibold">
                  Telefone
                </FieldLabel>

                <Input
                  {...field}
                  id={field.name}
                  placeholder="(XX) XXXXX-XXXX"
                  onChange={(e) => {
                    const formattedValue = formatPhone(e.target.value)
                    field.onChange(formattedValue)
                  }}
                />
                <FieldError />
              </Field>
            )}
          />

          {/* Data do agendamento */}
          <Controller
            control={form.control}
            name="date"
            render={({ field }) => (
              <Field className="flex items-center gap-2 space-y-1">
                <FieldLabel className="font-semibold">
                  Data do agendamento
                </FieldLabel>

                <DateTimePicker
                  initialDate={new Date()}
                  className="w-full rounded border p-2"
                  onChange={(date) => {
                    if (date) {
                      field.onChange(date);
                      setSelectedTime("");
                    }
                  }}
                />
                <FieldError />
              </Field>
            )}
          />

          {/* Serviços */}
          <Controller
            control={form.control}
            name="serviceId"
            render={({ field }) => (
              <Field className="">
                <FieldLabel className="font-semibold">
                  Selecione o serviço
                </FieldLabel>

                <Select
                  value={field.value ?? ""}
                  onValueChange={(value) => {
                    field.onChange(value);
                    setSelectedTime("");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um serviço" />
                  </SelectTrigger>

                  <SelectContent>
                    {clinic.services.map((service) => (
                      <SelectItem
                        key={service.id}
                        value={service.id}
                      >
                        {service.name} -{" "}
                        {Math.floor(service.duration / 60)}h{" "}
                        {service.duration % 60}min
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError />
              </Field>
            )}
          />

          {selectedServiceId && (
            <div className='space-y-2'>
              <Label className="font-semibold">Horários disponíveis:</Label>
              <div className='bg-gray-100 p-4 rounded-lg'>
                {loadingSlots ? (
                  <p>Carregando horários...</p>
                ) : availableTimeSlots.length === 0 ? (
                  <p>Nenhum horário disponível</p>
                ) : (
                  <ScheduleTimeList
                    onSelectTime={(time) => setSelectedTime(time)}
                    clinicTimes={clinic.times}
                    blockedTimes={blockedTimes}
                    availableTimeSlots={availableTimeSlots}
                    selectedTime={selectedTime}
                    selectedDate={selectedDate}
                    requiredSlots={
                      clinic.services.find(service => service.id === selectedServiceId) ? Math.ceil(clinic.services.find(service => service.id === selectedServiceId)!.duration / 30) : 1
                    }
                  />
                )}
              </div>
            </div>
          )}

          {clinic.status ? (
            <Button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-400"
              disabled={
                !watch("name") ||
                !watch("email") ||
                !watch("phone") ||
                !watch("date") ||
                !selectedServiceId ||
                !selectedTime ||
                loadingSlots
              }
            >
              Realizar agendamento
            </Button>
          ) : (
            <p className="bg-red-500 text-white text-center px-4 py-2 rounded-md">
              A clínica está fechada neste momento.
            </p>
          )}

        </form>
      </section>
    </div>
  )
}
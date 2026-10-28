"use client"

import { useState } from "react";
import { Controller } from "react-hook-form";
import { ProfileFormData, useProfileForm } from "./profile-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import imgTest from "../../../../../../public/foto1.png";
import { cn } from "@/lib/utils";
import { Prisma } from "@/generated/prisma/client";
import { updateProfile } from "../_actions/update-profile";
import { toast } from 'sonner';
import { formatPhone } from '@/utils/formatPhone';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AvatarProfile } from './profile-avatar';

type UserWithSubscription = Prisma.UserGetPayload<{
    include: {
        subscription: true
    }
}>

interface ProfileContentProps {
    user: UserWithSubscription;
}

export function ProfileContent({ user }: ProfileContentProps) {

    const router = useRouter();

    const [selectedHours, setSelectedHours] = useState<string[]>(user.times ?? []);

    const [dialogIsOpen, setDialogIsOpen] = useState(false);

    const { update } = useSession();

    const form = useProfileForm({
        name: user.name,
        address: user.address,
        phone: user.phone,
        status: user.status,
        timeZone: user.timeZone
    });

    function generateTimeSlots(): string[] {
        const hours: string[] = [];

        for (let i = 8; i <= 24; i++) {
            for (let j = 0; j < 2; j++) {
                const hour = i.toString().padStart(2, "0")
                const minute = (j * 30).toString().padStart(2, "0")
                hours.push(`${hour}:${minute}`)
            }
        }

        return hours;

    }

    const hours = generateTimeSlots();

    function toggleHour(hour: string) {
        setSelectedHours((prev) => prev.includes(hour) ? prev.filter(h => h !== hour) : [...prev, hour].sort())
    }

    const timeZones = Intl.supportedValuesOf("timeZone").filter((zone) =>
        zone.startsWith("America/Noronha") ||
        zone.startsWith("America/Sao_Paulo") ||
        zone.startsWith("America/Fortaleza") ||
        zone.startsWith("America/Recife") ||
        zone.startsWith("America/Bahia") ||
        zone.startsWith("America/Belem") ||
        zone.startsWith("America/Maceio") ||
        zone.startsWith("America/Araguaina") ||
        zone.startsWith("America/Manaus") ||
        zone.startsWith("America/Cuiaba") ||
        zone.startsWith("America/Santarem") ||
        zone.startsWith("America/Porto_Velho") ||
        zone.startsWith("America/Boa_Vista") ||
        zone.startsWith("America/Rio_Branco") ||
        zone.startsWith("America/Eirunepe")
    );

    async function onSubmit(values: ProfileFormData) {
        const response = await updateProfile({
            name: values.name,
            address: values.address,
            status: values.status === 'active' ? true : false,
            phone: values.phone,
            timeZone: values.timeZone,
            times: selectedHours || []
        })

        if (response.error) {
            toast.error(response.error)
            return;
        }

        toast.success(response.data)
    }

    async function handleLogout() {
        await signOut();
        await update();
        router.replace("/")
    }

    return (
        <div className="mx-auto">
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <Card>
                    <CardHeader>
                        <CardTitle>Meu Perfil</CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <div className="flex justify-center">
                            <AvatarProfile
                                avatarUrl={user.image}
                                userId={user.id}
                            />
                        </div>

                        <div className="space-y-4">
                            {/* Nome completo */}
                            <Controller
                                control={form.control}
                                name="name"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={field.name} className="font-semibold">
                                            Nome completo
                                        </FieldLabel>

                                        <Input
                                            {...field}
                                            id={field.name}
                                            aria-invalid={fieldState.invalid}
                                            placeholder="Digite o nome da clínica..."
                                        />

                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                        <FieldError />
                                    </Field>
                                )}
                            />

                            {/* Endereço */}
                            <Controller
                                control={form.control}
                                name="address"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={field.name} className="font-semibold">
                                            Endereço completo
                                        </FieldLabel>

                                        <Input
                                            {...field}
                                            id={field.name}
                                            aria-invalid={fieldState.invalid}
                                            placeholder="Digite o endereço da clínica..."
                                        />

                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                        <FieldError />
                                    </Field>
                                )}
                            />

                            {/* Telefone */}
                            <Controller
                                control={form.control}
                                name="phone"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={field.name} className="font-semibold">
                                            Telefone
                                        </FieldLabel>

                                        <Input
                                            {...field}
                                            id={field.name}
                                            aria-invalid={fieldState.invalid}
                                            placeholder="(91) 99912-3456"
                                            onChange={(e) => {
                                                const formattedValue = formatPhone(e.target.value)
                                                field.onChange(formattedValue)
                                            }}

                                        />

                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                        <FieldError />
                                    </Field>
                                )}
                            />

                            {/* Status da clínica */}
                            <Controller
                                control={form.control}
                                name="status"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="clinic-status" className="font-semibold">
                                            Status da clínica
                                        </FieldLabel>

                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value ? "active" : "inactive"}
                                        >
                                            <SelectTrigger
                                                id="clinic-status"
                                                aria-invalid={fieldState.invalid}
                                            >
                                                <SelectValue placeholder="Selecione o status da clínica" />
                                            </SelectTrigger>

                                            <SelectContent>
                                                <SelectItem value="active">
                                                    ATIVO (clínica aberta)
                                                </SelectItem>

                                                <SelectItem value="inactive">
                                                    INATIVO (clínica fechada)
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FieldError />
                                    </Field>
                                )}
                            />

                            <div className='space-y-2'>
                                <Label className='font-semibold'>
                                    Configurar horários da clínica
                                </Label>

                                <Dialog open={dialogIsOpen} onOpenChange={setDialogIsOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className='w-full justify-between'>
                                            Clique aqui para selecionar horários
                                            <ArrowRight className='w-5 h-5' />
                                        </Button>
                                    </DialogTrigger>

                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Horários da clínica</DialogTitle>
                                            <DialogDescription>
                                                Selecione abaixo os horários de funcionamento da clínica:
                                            </DialogDescription>
                                        </DialogHeader>

                                        <section className='py-4'>
                                            <p className='text-sm text-muted-foreground mb-2'>
                                                Clique nos horários abaixo para marcar ou desmarcar:
                                            </p>

                                            <div className='grid grid-cols-5 gap-2'>
                                                {hours.map((hour) => (
                                                    <Button
                                                        key={hour}
                                                        variant="outline"
                                                        className={cn('h-10', selectedHours.includes(hour) && 'border-2 border-emerald-500 text-primary')}
                                                        onClick={() => toggleHour(hour)}
                                                    >
                                                        {hour}
                                                    </Button>
                                                ))}
                                            </div>

                                        </section >

                                        <Button className="w-full" onClick={() => setDialogIsOpen(false)}>
                                            Fechar
                                        </Button>

                                    </DialogContent>
                                </Dialog>
                            </div>

                            {/* timezone */}
                            <Controller
                                control={form.control}
                                name="timeZone"
                                render={({ field }) => (
                                    <Field>
                                        <FieldLabel className="font-semibold">
                                            Selecione o fuso horário
                                        </FieldLabel>

                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <SelectTrigger id="clinic-status">
                                                <SelectValue placeholder="Selecione o seu fuso horário" />
                                            </SelectTrigger>

                                            <SelectContent>
                                                {timeZones.map((zone) => (
                                                    <SelectItem key={zone} value={zone}>
                                                        {zone}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FieldError />
                                    </Field>
                                )}
                            />

                            <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400">
                                Salvar alterações
                            </Button>

                        </div>
                    </CardContent>
                </Card>
            </form>

            <section className='mt-4'>
                <Button
                    variant="destructive"
                    onClick={handleLogout}
                >
                    Sair da conta
                </Button>
            </section>
        </div>
    )
}
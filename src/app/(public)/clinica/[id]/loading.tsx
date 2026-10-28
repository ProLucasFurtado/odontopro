
export default function Loading() {
    return (
        <main className="flex min-h-[50vh] flex-col items-center justify-center gap-3 p-6">
            <div
                className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"
                aria-hidden="true"
            />

            <p
                className="text-center text-sm text-gray-600"
                role="status"
                aria-live="polite"
            >
                Carregando os horários e informações da clínica...
            </p>
        </main>
    );
}

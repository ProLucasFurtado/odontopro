import { Suspense } from "react";

import { Footer } from "./_components/footer";
import { Header } from "./_components/header";
import { Hero } from "./_components/hero";
import { Professionals } from "./_components/professionals";
import { getProfessionals } from "./_data-access/get-professionals";

async function ProfessionalsSection() {
  const professionals = await getProfessionals();

  return (
    <Professionals professionals={professionals || []} />
  );
}

function ProfessionalsFallback() {
  return (
    <div
      className="flex min-h-40 items-center justify-center"
      role="status"
    >
      Carregando profissionais...
    </div>
  );
}

export default function Home() {

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <div>
        <Hero />

        <Suspense fallback={<ProfessionalsFallback />}>
          <ProfessionalsSection />
        </Suspense>

        <Footer />
      </div>
    </div>
  )
}
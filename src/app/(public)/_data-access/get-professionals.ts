"use server"

import { cacheLife } from "next/cache";
import prisma from "@/lib/prisma";

export async function getProfessionals() {
  "use cache";

  cacheLife({
    stale: 60,
    revalidate: 120,
    expire: 300,
  });

  try {
    const professionals = await prisma.user.findMany({
      where: {
        status: true,
      },
      include: {
        subscription: true,
      }
    })

    return professionals;

  } catch (err) {
    return []
  }

}
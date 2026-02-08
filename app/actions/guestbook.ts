"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function createGuestbookEntry(formData: FormData) {
  const message = formData.get("message") as string;
  const name = (formData.get("name") as string) || "Anónimo";

  if (!message || message.trim().length === 0) {
    return { error: "El mensaje no puede estar vacío" };
  }

  try {
    await prisma.guestbookEntry.create({
      data: {
        message,
        name,
      },
    });

    revalidatePath("/guestbook");
    return { success: true };
  } catch (error) {
    console.error("Error creating guestbook entry:", error);
    return { error: "Error al guardar el mensaje" };
  }
}

export async function getGuestbookEntries() {
  try {
    const entries = await prisma.guestbookEntry.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });
    return entries;
  } catch (error) {
    console.error("Error fetching guestbook entries:", error);
    return [];
  }
}

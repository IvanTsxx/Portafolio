"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function createGuestbookEntry(formData: FormData) {
  const message = formData.get("message") as string;
  const name = (formData.get("name") as string) || "Anónimo";
  const styleRaw = formData.get("style");
  const style = styleRaw ? JSON.parse(styleRaw as string) : null;

  if (!message || message.trim().length === 0) {
    return { error: "El mensaje no puede estar vacío" };
  }

  // Get IP and hash it for privacy/rate limiting
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") || "unknown";
  const ipHash = crypto.createHash("sha256").update(ip).digest("hex");

  // Rate Limiting: Check if IP has posted in the last 24 hours
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const existingEntry = await prisma.guestbookEntry.findFirst({
    where: {
      ipHash,
      createdAt: {
        gte: oneDayAgo,
      },
    },
  });

  if (existingEntry) {
    return {
      error: "Solo puedes firmar una vez cada 24 horas. ¡Vuelve mañana!",
    };
  }

  try {
    await prisma.guestbookEntry.create({
      data: {
        message,
        name,
        ipHash,
        style: style || {}, // Store style JSON
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
      take: 100, // Increased limit for the wall
    });
    return entries;
  } catch (error) {
    console.error("Error fetching guestbook entries:", error);
    return [];
  }
}

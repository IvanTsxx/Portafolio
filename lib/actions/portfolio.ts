"use server";

import { Pool } from "pg";
import { generateEmbeddings } from "@/lib/ai/embedding";
import { prisma } from "@/lib/prisma";

/**
 * Helper Functions para generar embeddings automáticamente
 * Siguiendo el patrón de la documentación oficial del AI SDK
 *
 * Úsalos en tus Server Actions existentes así:
 *
 * const project = await prisma.project.create({...})
 * await generateProjectEmbeddings(project.id)
 */

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Genera embeddings para un proyecto existente
 */
export async function generateProjectEmbeddings(projectId: string) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { content: true, published: true },
    });

    if (!project || !project.published || !project.content) {
      return { success: false, message: "Project not found or not published" };
    }

    // Generar embeddings
    const embeddings = await generateEmbeddings(project.content);

    // Guardar embeddings
    for (const emb of embeddings) {
      await pool.query(
        `
        INSERT INTO embeddings (id, content, embedding, project_id, created_at, updated_at)
        VALUES (
          gen_random_uuid()::text,
          $1,
          $2::vector,
          $3,
          NOW(),
          NOW()
        )
      `,
        [emb.content, `[${emb.embedding.join(",")}]`, projectId],
      );
    }

    return { success: true, count: embeddings.length };
  } catch (error) {
    console.error("Error generating project embeddings:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Genera embeddings para una experiencia existente
 */
export async function generateExperienceEmbeddings(experienceId: string) {
  try {
    const experience = await prisma.experience.findUnique({
      where: { id: experienceId },
      select: { content: true, published: true },
    });

    if (!experience || !experience.published || !experience.content) {
      return {
        success: false,
        message: "Experience not found or not published",
      };
    }

    // Generar embeddings
    const embeddings = await generateEmbeddings(experience.content);

    // Guardar embeddings
    for (const emb of embeddings) {
      await pool.query(
        `
        INSERT INTO embeddings (id, content, embedding, experience_id, created_at, updated_at)
        VALUES (
          gen_random_uuid()::text,
          $1,
          $2::vector,
          $3,
          NOW(),
          NOW()
        )
      `,
        [emb.content, `[${emb.embedding.join(",")}]`, experienceId],
      );
    }

    return { success: true, count: embeddings.length };
  } catch (error) {
    console.error("Error generating experience embeddings:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Genera embeddings para un post existente
 */
export async function generatePostEmbeddings(postId: string) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { content: true, published: true },
    });

    if (!post || !post.published || !post.content) {
      return { success: false, message: "Post not found or not published" };
    }

    // Generar embeddings
    const embeddings = await generateEmbeddings(post.content);

    // Guardar embeddings
    for (const emb of embeddings) {
      await pool.query(
        `
        INSERT INTO embeddings (id, content, embedding, post_id, created_at, updated_at)
        VALUES (
          gen_random_uuid()::text,
          $1,
          $2::vector,
          $3,
          NOW(),
          NOW()
        )
      `,
        [emb.content, `[${emb.embedding.join(",")}]`, postId],
      );
    }

    return { success: true, count: embeddings.length };
  } catch (error) {
    console.error("Error generating post embeddings:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Regenera embeddings (elimina viejos y crea nuevos)
 */
export async function regenerateProjectEmbeddings(projectId: string) {
  try {
    // Eliminar viejos
    await pool.query(`DELETE FROM embeddings WHERE project_id = $1`, [
      projectId,
    ]);

    // Generar nuevos
    return await generateProjectEmbeddings(projectId);
  } catch (error) {
    console.error("Error regenerating project embeddings:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Regenera embeddings para una experiencia (elimina viejos y crea nuevos)
 */
export async function regenerateExperienceEmbeddings(experienceId: string) {
  try {
    // Eliminar viejos
    await pool.query(`DELETE FROM embeddings WHERE experience_id = $1`, [
      experienceId,
    ]);

    // Generar nuevos
    return await generateExperienceEmbeddings(experienceId);
  } catch (error) {
    console.error("Error regenerating experience embeddings:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Regenera embeddings para un post (elimina viejos y crea nuevos)
 */
export async function regeneratePostEmbeddings(postId: string) {
  try {
    // Eliminar viejos
    await pool.query(`DELETE FROM embeddings WHERE post_id = $1`, [postId]);

    // Generar nuevos
    return await generatePostEmbeddings(postId);
  } catch (error) {
    console.error("Error regenerating post embeddings:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

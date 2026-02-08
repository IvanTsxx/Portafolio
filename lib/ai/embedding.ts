import { google } from "@ai-sdk/google";
import { embed, embedMany } from "ai";
import { prisma } from "@/lib/prisma";

// Modelo de embeddings según documentación oficial
const embeddingModel = google.embedding("gemini-embedding-001");

/**
 * Genera chunks de un texto siguiendo el patrón de la documentación oficial
 * Divide por oraciones (puntos) y filtra vacíos
 */
const generateChunks = (input: string): string[] => {
  return input
    .trim()
    .split(".")
    .filter((i) => i !== "");
};

/**
 * Genera embeddings para múltiples chunks
 * Patrón oficial del AI SDK
 */
export const generateEmbeddings = async (
  value: string,
): Promise<Array<{ embedding: number[]; content: string }>> => {
  const chunks = generateChunks(value);
  const { embeddings: embeddingsResult } = await embedMany({
    model: embeddingModel,
    values: chunks,
  });
  return embeddingsResult.map((e, i) => ({ content: chunks[i], embedding: e }));
};

/**
 * Genera un embedding individual para queries
 * Usado en búsquedas semánticas
 */
export const generateEmbedding = async (value: string): Promise<number[]> => {
  const input = value.replaceAll("\\n", " ");
  const { embedding } = await embed({
    model: embeddingModel,
    value: input,
  });
  return embedding;
};

/**
 * Busca contenido relevante usando similitud coseno
 * Retorna chunks con similarity > 0.5
 */
export const findRelevantContent = async (userQuery: string) => {
  const userQueryEmbedded = await generateEmbedding(userQuery);

  // Convierte el array a string en formato PostgreSQL
  const vectorString = `[${userQueryEmbedded.join(",")}]`;

  // Query SQL con pgvector para encontrar los embeddings más similares
  const results = await prisma.$queryRaw<
    Array<{
      content: string;
      similarity: number;
    }>
  >`
    SELECT 
      e.content AS name,
      1 - (e.embedding <=> ${vectorString}::vector) as similarity
    FROM embeddings e
    WHERE 1 - (e.embedding <=> ${vectorString}::vector) > 0.4
    ORDER BY e.embedding <=> ${vectorString}::vector
    LIMIT 4
  `;

  return results;
};

import type {
  Category,
  Experience,
  Post,
  Project,
  Tag,
  Technology,
} from "@/app/generated/prisma/client";

export type PostWithRelations = Post & {
  tags: Tag[];
  category: Category | null;
};

export type ProjectWithRelations = Project & {
  technologies: Technology[];
};

export type ExperienceWithRelations = Experience & {
  technologies: Technology[];
};

export type ContentType = "post" | "project" | "experience";

export interface SearchResult {
  id: string;
  type: ContentType;
  title: string;
  description: string | null;
  slug: string;
  tags?: string[];
  category?: string;
  technologies?: string[];
  matchType: "title" | "description" | "tag" | "category" | "technology";
}

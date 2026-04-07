export type TechCategory =
  | "framework"
  | "language"
  | "styling"
  | "ui"
  | "animation"
  | "platform"
  | "database"
  | "auth"
  | "utility"
  | "validation";

export interface TechStack {
  id: string;
  name: string;
  category: TechCategory;
  url: string;
}

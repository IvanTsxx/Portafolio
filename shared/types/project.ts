export interface Project {
  id: string;
  name: string;
  description: string;
  url?: string;
  github?: string;
  tags: string[];
  featured: boolean;
  year: number;
}

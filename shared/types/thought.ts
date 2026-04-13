export interface ThoughtMeta {
  slug: string;
  lang: string;
  availableLangs: string[];
  title: string;
  date: string;
  description: string;
  tags: string[];
  published: boolean;
  readingTime: number;
}

export interface Thought extends ThoughtMeta {
  content: string;
}

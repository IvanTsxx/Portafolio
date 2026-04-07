export interface Bookmark {
  id: string;
  title: string;
  description: string;
  url: string;
  tags: string[];
  /** ISO date string */
  createdAt: string;
}

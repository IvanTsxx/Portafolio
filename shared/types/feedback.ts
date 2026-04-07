export interface Feedback {
  id: string;
  author: string;
  handle: string;
  avatar: string | null;
  content: string;
  /** ISO date string */
  date: string;
}

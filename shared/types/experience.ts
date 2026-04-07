export interface Experience {
  id: string;
  company: string;
  role: string;
  /** ISO date string, e.g. "2022-01" */
  startDate: string;
  /** ISO date string or null if current */
  endDate: string | null;
  description: string;
  url?: string;
  location: string;
}

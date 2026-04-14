export interface ProcessedContribution {
  title: string;
  description: string;
  repository: string;
  link: string;
  date: string;
  type: "feature" | "fix" | "perf" | "docs" | "refactor" | "test" | "chore";
  state: "open" | "closed" | "merged";
  kind: "pr" | "issue";
}

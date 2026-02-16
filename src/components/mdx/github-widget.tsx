import { GitCommit } from "lucide-react";
import { getRecentActivity } from "@/lib/github";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (minutes < 60) {
    return `hace ${minutes}m`;
  }
  if (hours < 24) {
    return `hace ${hours}h`;
  }
  if (days < 7) {
    return `hace ${days}d`;
  }
  return new Date(dateStr).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
  });
}

export async function GithubWidget() {
  const activity = await getRecentActivity();

  return (
    <a
      className="not-prose group flex items-center gap-3.5 rounded-xl border border-fd-border bg-fd-card p-4 no-underline transition-all duration-300 hover:border-brand/40 hover:shadow-brand/5 hover:shadow-lg"
      href={activity?.url ?? "https://github.com/IvanTsxx"}
      rel="noopener noreferrer"
      target="_blank"
    >
      {/* Icon */}
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-muted">
        <GitCommit className="h-5 w-5 text-brand" />
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex items-center gap-1.5">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand" />
          </span>
          <span className="font-medium text-[11px] text-fd-muted-foreground uppercase tracking-wider">
            Último commit
          </span>
          {activity?.date && (
            <span className="text-[10px] text-fd-muted-foreground/60">
              · {timeAgo(activity.date)}
            </span>
          )}
        </div>
        <p className="truncate font-semibold text-fd-foreground text-sm leading-tight">
          {activity?.message ?? "Sin actividad reciente"}
        </p>
        <p className="truncate text-fd-muted-foreground text-xs">
          {activity?.repo ?? "—"}
        </p>
      </div>
    </a>
  );
}

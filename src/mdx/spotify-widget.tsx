import { Music } from "lucide-react";
import { getNowPlaying } from "@/lib/spotify";

export async function SpotifyWidget() {
  const track = await getNowPlaying();

  return (
    <a
      className="not-prose group flex items-center gap-3.5 rounded-xl border border-fd-border bg-fd-card p-4 no-underline transition-all duration-300 hover:border-brand/40 hover:shadow-brand/5 hover:shadow-lg"
      href={
        track.isPlaying && "songUrl" in track
          ? track.songUrl
          : "https://www.last.fm/user/ivanTsx"
      }
      rel="noopener noreferrer"
      target="_blank"
    >
      {/* Album Art */}
      {track.isPlaying && "albumImageUrl" in track && track.albumImageUrl ? (
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
          <img
            alt={`${track.album} cover`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            height={48}
            src={track.albumImageUrl}
            width={48}
          />
          <div className="absolute inset-0 rounded-lg ring-1 ring-black/10 ring-inset" />
        </div>
      ) : (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-muted">
          <Music className="h-5 w-5 text-brand" />
        </div>
      )}

      {/* Track Info */}
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex items-center gap-1.5">
          {track.isPlaying ? (
            <div className="flex items-end gap-[2px]">
              <span
                className="w-[3px] rounded-full bg-[#1DB954]"
                style={{ animation: "eq-bar-1 0.8s ease-in-out infinite" }}
              />
              <span
                className="w-[3px] rounded-full bg-[#1DB954]"
                style={{ animation: "eq-bar-2 0.6s ease-in-out infinite 0.2s" }}
              />
              <span
                className="w-[3px] rounded-full bg-[#1DB954]"
                style={{ animation: "eq-bar-3 0.7s ease-in-out infinite 0.1s" }}
              />
            </div>
          ) : (
            <span className="h-1.5 w-1.5 rounded-full bg-fd-muted-foreground/50" />
          )}
          <span className="font-medium text-[11px] text-fd-muted-foreground uppercase tracking-wider">
            {track.isPlaying ? "Escuchando" : "Última escuchada"}
          </span>
        </div>
        <p className="truncate font-semibold text-fd-foreground text-sm leading-tight">
          {"title" in track ? track.title : "Sin actividad"}
        </p>
        <p className="truncate text-fd-muted-foreground text-xs">
          {"artist" in track ? track.artist : "—"}
        </p>
      </div>
    </a>
  );
}

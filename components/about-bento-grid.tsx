"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  GitCommit,
  GitPullRequest,
  Globe,
  MapPin,
  Music,
} from "lucide-react";
import Link from "next/link";
import { GitIcon, SpotifyIcon } from "./icons";

interface AboutBentoGridProps {
  nowPlaying: {
    isPlaying: boolean;
    title?: string;
    artist?: string;
    album?: string;
    albumImageUrl?: string;
    songUrl?: string;
  };
  githubActivity: {
    type: string;
    repo: string;
    message: string;
    date: string;
    url: string;
  } | null;
}

export function AboutBentoGrid({
  nowPlaying,
  githubActivity,
}: AboutBentoGridProps) {
  return (
    <section id="about" className="relative overflow-hidden py-20 lg:py-32">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-full right-0 h-[200px] w-[200px] -translate-y-1/2 rounded-full bg-linear-to-tr from-primary/60 via-primary/40 to-transparent blur-3xl md:top-2/3 md:right-[10%] md:h-[300px] md:w-[300px]" />
      </div>
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 text-center">
          <h2 className="font-bold text-3xl text-foreground tracking-tight sm:text-4xl">
            Sobre mí
          </h2>
          <p className="mt-4 text-muted-foreground">
            Más allá del código: un vistazo a quién soy.
          </p>
        </div>

        <div className="mx-auto grid h-auto max-w-5xl grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          {/* Bio Card - Large Left */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/50 bg-card/50 p-8 transition-colors hover:border-primary/20 md:col-span-2 md:row-span-2"
          >
            <div className="relative z-10">
              <div className="mb-4 flex items-center gap-3">
                <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-primary/20">
                  <div className="flex h-full w-full items-center justify-center bg-primary/10 font-bold text-primary">
                    <img
                      src="https://avatars.githubusercontent.com/ivantsxx?s=256"
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-xl">Iván Bongiovanni</h3>
                  <p className="text-primary text-sm">Full-Stack Developer</p>
                </div>
              </div>

              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Diseño y desarrollo experiencias digitales modernas con un
                  enfoque obsesivo en el{" "}
                  <span className="font-medium text-foreground">
                    rendimiento
                  </span>{" "}
                  y la{" "}
                  <span className="font-medium text-foreground">
                    calidad visual
                  </span>
                  .
                </p>
                <p>
                  Especializado en el ecosistema{" "}
                  <span className="font-medium text-foreground">Next.js</span> y{" "}
                  <span className="font-medium text-foreground">React</span>,
                  construyo aplicaciones escalables que priorizan la experiencia
                  de usuario.
                </p>
              </div>
            </div>

            <div className="mt-8">
              <Link
                href="mailto:ivanjara2208@gmail.com"
                className="inline-flex items-center gap-2 font-medium text-primary text-sm transition-colors hover:text-primary/80"
              >
                Hablemos de tu proyecto <ArrowRight className="size-4" />
              </Link>
            </div>

            <div className="absolute top-0 right-0 -m-16 h-64 w-64 rounded-full bg-primary/5 blur-3xl transition-colors duration-500 group-hover:bg-primary/10" />
          </motion.div>

          {/* Location Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="group relative flex items-center gap-4 overflow-hidden rounded-3xl border border-border/50 bg-card/50 p-4 transition-colors hover:border-primary/20"
          >
            <div className="rounded-full bg-green-500/10 p-3 text-primary">
              <MapPin className="size-6" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Ubicación</p>
              <p className="font-bold text-foreground text-lg">Argentina</p>
              <p className="text-nowrap font-medium text-primary/80 text-xs">
                Remoto Global
              </p>
            </div>
            <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-20 transition-opacity group-hover:opacity-40">
              <Globe className="size-16" />
            </div>
          </motion.div>

          {/* Spotify Card - Now Playing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="group relative flex flex-col justify-center overflow-hidden rounded-3xl border border-border/50 bg-card/50 p-4 transition-colors hover:border-primary/20"
          >
            <div className="mb-2 flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider">
              <SpotifyIcon className="size-6" />
              {nowPlaying.isPlaying ? "Escuchando ahora" : "Última escuchada"}
            </div>
            {nowPlaying.isPlaying || nowPlaying.artist ? (
              <div className="flex gap-3">
                {nowPlaying.albumImageUrl && (
                  <img
                    src={nowPlaying.albumImageUrl}
                    alt={nowPlaying.album || "Album Art"}
                    className="size-12 animate-spin-slow rounded-md object-cover"
                    style={{
                      animationPlayState: nowPlaying.isPlaying
                        ? "running"
                        : "paused",
                    }}
                  />
                )}
                <div className="flex flex-col justify-center overflow-hidden">
                  <Link
                    href={nowPlaying.songUrl || "#"}
                    target="_blank"
                    className="truncate font-medium text-foreground text-sm transition-colors hover:text-primary hover:underline"
                  >
                    {nowPlaying.title}
                  </Link>
                  <p className="truncate text-muted-foreground text-xs">
                    {nowPlaying.artist}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <span className="relative flex h-2 w-2">
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-gray-500"></span>
                </span>
                Offline
              </div>
            )}
            {nowPlaying.isPlaying && (
              <div className="absolute right-4 bottom-4 flex gap-1">
                <motion.div
                  animate={{ height: [10, 20, 10] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-1 rounded-full bg-primary/50"
                />
                <motion.div
                  animate={{ height: [15, 25, 15] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                  className="w-1 rounded-full bg-primary/50"
                />
                <motion.div
                  animate={{ height: [8, 18, 8] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="w-1 rounded-full bg-primary/50"
                />
              </div>
            )}
          </motion.div>

          {/* GitHub Activity Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/50 bg-card/50 p-4 transition-colors hover:border-primary/20 md:col-span-3 lg:col-span-1"
          >
            <div className="mb-2 flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider">
              <GitIcon className="size-6" />
              Actividad Reciente
            </div>

            {githubActivity ? (
              <div className="space-y-2">
                <Link
                  href={githubActivity.url}
                  target="_blank"
                  className="line-clamp-1 block font-medium text-foreground text-sm transition-colors hover:text-primary"
                >
                  {githubActivity.repo}
                </Link>
                <p className="line-clamp-2 text-muted-foreground text-xs">
                  {githubActivity.message}
                </p>
                <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground/60">
                  {githubActivity.type === "PushEvent" ? (
                    <GitCommit className="size-3" />
                  ) : (
                    <GitPullRequest className="size-3" />
                  )}
                  {new Date(githubActivity.date).toLocaleDateString()}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-xs">
                Sin actividad reciente pública.
              </p>
            )}
            {/* pelotita redonda parpadeando verde a la derecha del todo */}
            <div className="absolute top-5 right-4 -translate-y-1/2 opacity-20 transition-opacity group-hover:opacity-40">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="size-4 rounded-full bg-primary/80"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

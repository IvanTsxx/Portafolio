"use client";

import { motion } from "framer-motion";
import { ArrowRight, Globe, MapPin } from "lucide-react";
import Link from "next/link";
import { NextjsIcon, ReactIcon } from "./icons";

export function AboutBento() {
  return (
    <section id="about" className="relative overflow-hidden py-20 lg:py-32">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-2/3 right-[10%] h-[300px] w-[300px] -translate-y-1/2 rounded-full bg-linear-to-tr from-primary/60 via-primary/40 to-transparent blur-3xl" />
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

        <div className="mx-auto grid h-auto max-w-5xl grid-cols-1 gap-4 md:h-[500px] md:grid-cols-3 md:gap-6">
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
                  {/* Placeholder for avatar if available, or Initials */}
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
                <p>
                  Siempre buscando la intersección perfecta entre diseño
                  funcional e ingeniería robusta.
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

            {/* Decoration background */}
            <div className="absolute top-0 right-0 -m-16 h-64 w-64 rounded-full bg-primary/5 blur-3xl transition-colors duration-500 group-hover:bg-primary/10" />
          </motion.div>

          {/* Stack Focus Card - Top Right */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="group relative flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-border/50 bg-card/50 p-6 text-center transition-colors hover:border-primary/20"
          >
            <h4 className="mb-4 font-medium text-muted-foreground text-sm uppercase tracking-wider">
              Stack Principal
            </h4>
            <div className="flex gap-4">
              <div className="flex flex-col items-center gap-2">
                <div className="bg-black/5 p-3 transition-transform duration-300 group-hover:scale-110 dark:bg-white/5">
                  <NextjsIcon className="size-6 text-foreground" />
                </div>
                <span className="font-medium text-xs">Next.js</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="bg-blue-500/10 p-3 transition-transform duration-300 group-hover:scale-110">
                  <ReactIcon className="size-6 text-blue-500" />
                </div>
                <span className="font-medium text-xs">React</span>
              </div>
            </div>
          </motion.div>

          {/* Location Card - Middle Right */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="group relative flex items-center gap-4 overflow-hidden rounded-3xl border border-border/50 bg-card/50 p-6 transition-colors hover:border-primary/20"
          >
            <div className="rounded-full bg-green-500/10 p-3 text-green-600">
              <MapPin className="size-6" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Ubicación</p>
              <p className="font-bold text-foreground text-lg">Argentina</p>
              <p className="font-medium text-green-600/80 text-xs">
                Remoto Global
              </p>
            </div>
            <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-20 transition-opacity group-hover:opacity-40">
              <Globe className="size-16" />
            </div>
          </motion.div>

          {/* Status Card - Bottom Right */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="group relative flex items-center justify-between overflow-hidden rounded-3xl border border-border/50 bg-card/50 p-6 transition-colors hover:border-primary/20"
          >
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
              </span>
              <span className="font-medium text-foreground">Disponible</span>
            </div>
            <div className="text-right text-muted-foreground text-xs">
              Nuevos
              <br />
              Proyectos
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

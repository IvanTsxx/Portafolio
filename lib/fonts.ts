import { Archivo, Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const archivo = Archivo({
  axes: ["wdth"],
  subsets: ["latin"],
  variable: "--font-display",
});

export const fontClassNames = [
  geistSans.variable,
  geistMono.variable,
  archivo.variable,
].join(" ");

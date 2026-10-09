import {
  Geist_Mono,
  Instrument_Serif,
  Noto_Sans_JP,
  Zen_Kaku_Gothic_New,
} from "next/font/google";

const zenKaku = Zen_Kaku_Gothic_New({
  subsets: ["latin"],
  variable: "--font-zen-kaku",
  weight: ["300", "400", "500", "700"],
});

const notoJp = Noto_Sans_JP({
  preload: false,
  variable: "--font-noto-jp",
  weight: ["300", "400", "500"],
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const instrumentSerif = Instrument_Serif({
  style: ["italic"],
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  weight: "400",
});

export const fontClassNames = [
  zenKaku.variable,
  notoJp.variable,
  geistMono.variable,
  instrumentSerif.variable,
].join(" ");

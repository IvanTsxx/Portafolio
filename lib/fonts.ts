import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { Herr_Von_Muellerhoff, Instrument_Serif } from "next/font/google";

const instrumentSerif = Instrument_Serif({
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  weight: "400",
});

const signature = Herr_Von_Muellerhoff({
  subsets: ["latin"],
  variable: "--font-signature-script",
  weight: "400",
});

export const fontClassNames = [
  signature.variable,
  GeistSans.variable,
  GeistMono.variable,
  instrumentSerif.variable,
].join(" ");

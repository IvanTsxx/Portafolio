import {
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
} from "three";

import {
  createGlyphTexture,
  createKnitBumpTexture,
  createPlaidTexture,
  createTweedTexture,
} from "./textures";

const knitBump = createKnitBumpTexture();
const glyphs = createGlyphTexture();

const matte = (color: string, roughness = 0.85) =>
  new MeshStandardMaterial({ color, roughness });

const plastic = (color: string, roughness = 0.4) =>
  new MeshPhysicalMaterial({
    clearcoat: 0.6,
    clearcoatRoughness: 0.35,
    color,
    roughness,
  });

const metal = (color: string, roughness = 0.3) =>
  new MeshStandardMaterial({ color, metalness: 1, roughness });

const knit = (color: string) =>
  new MeshStandardMaterial({
    bumpMap: knitBump,
    bumpScale: 1.6,
    color,
    roughness: 0.95,
  });

const glow = (color: string) =>
  new MeshStandardMaterial({
    color: "#0b0d0c",
    emissive: color,
    emissiveIntensity: 1.4,
    emissiveMap: glyphs,
    roughness: 0.3,
  });

export const agentMaterials = {
  aluminum: plastic("#a3a8ae", 0.5),
  blueprint: matte("#2f5c98", 0.75),
  bookCover: matte("#9c3a2e", 0.7),
  brass: metal("#d9a946", 0.26),
  clay: new MeshStandardMaterial({ color: "#f48d58", roughness: 0.66 }),
  codeGlow: glow("#4fe08a"),
  darkPlastic: plastic("#26272a", 0.45),
  eye: new MeshPhysicalMaterial({
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    color: "#08080a",
    roughness: 0.2,
  }),
  glass: new MeshPhysicalMaterial({
    color: "#e6f1ff",
    depthWrite: false,
    opacity: 0.22,
    roughness: 0.05,
    transparent: true,
  }),
  hardHatWhite: plastic("#efece4", 0.38),
  hardHatYellow: plastic("#f2b42e", 0.38),
  helmetSteel: plastic("#7d93ab", 0.34),
  hiVis: matte("#c3cc4a", 0.85),
  highlight: new MeshBasicMaterial({ color: "#ffffff" }),
  ink: plastic("#16171a", 0.35),
  knitBlue: knit("#4867a6"),
  knitWhite: knit("#ece7dc"),
  leather: matte("#5a3a24", 0.6),
  mortarboard: matte("#5c5e63", 0.8),
  paper: matte("#efe7d3", 0.9),
  penBlue: plastic("#2e5fd0"),
  penRed: plastic("#d33a35"),
  plaid: new MeshStandardMaterial({
    bumpMap: knitBump,
    bumpScale: 0.6,
    map: createPlaidTexture(3),
    roughness: 0.92,
  }),
  reflective: new MeshStandardMaterial({
    color: "#c9ccd0",
    metalness: 0.6,
    roughness: 0.25,
  }),
  screenGlow: glow("#8fb4e0"),
  steel: metal("#b8bfc7", 0.32),
  teal: plastic("#2f9e95", 0.35),
  tieRed: matte("#d6463a", 0.7),
  trim: matte("#6a4a30", 0.75),
  tweed: new MeshStandardMaterial({
    bumpMap: knitBump,
    bumpScale: 0.8,
    map: createTweedTexture(),
    roughness: 0.95,
  }),
  wire: metal("#1a1a1c", 0.35),
  wood: matte("#a27346", 0.7),
} as const;

export type AgentMaterialName = keyof typeof agentMaterials;

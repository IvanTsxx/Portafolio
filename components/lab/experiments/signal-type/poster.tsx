import { letterStyle, rampInfluence } from "./axes";

const letters = [..."SIGNAL"];

export const SignalTypePoster = () => (
  <div className="blueprint-grid flex size-full items-center justify-center [--grid-size:24px]">
    <p
      aria-hidden
      className="font-display text-foreground flex text-6xl leading-none"
    >
      {letters.map((letter, letterIndex) => (
        <span
          className="inline-block"
          key={letter + letterIndex.toString()}
          style={letterStyle(rampInfluence(letterIndex, letters.length) ** 2)}
        >
          {letter}
        </span>
      ))}
    </p>
  </div>
);

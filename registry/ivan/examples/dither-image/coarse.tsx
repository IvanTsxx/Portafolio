import { DitherImage } from "@/registry/ivan/ui/dither-image";

export const Example = () => (
  <div className="grid w-full max-w-md grid-cols-2 gap-4 p-6">
    <DitherImage
      alt="Portrait of Ivo, fine dither"
      pixelSize={1}
      src="/profile/portrait.jpg"
    />
    <DitherImage
      alt="Portrait of Ivo, coarse dither without drift"
      contrast={30}
      drift={0}
      pixelSize={4}
      src="/profile/portrait.jpg"
    />
  </div>
);

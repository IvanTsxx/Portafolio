import Image from "next/image";

export const CapturedPoster = ({
  alt,
  slug,
}: {
  alt: string;
  slug: string;
}) => (
  <>
    <Image
      alt={alt}
      className="object-cover dark:hidden"
      fill
      sizes="(min-width: 1024px) 40vw, 90vw"
      src={`/lab/posters/${slug}-light.webp`}
    />
    <Image
      alt={alt}
      className="hidden object-cover dark:block"
      fill
      sizes="(min-width: 1024px) 40vw, 90vw"
      src={`/lab/posters/${slug}-dark.webp`}
    />
  </>
);

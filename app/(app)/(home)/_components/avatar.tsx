import Image from "next/image";

export function Avatar() {
  return (
    <div className="shrink-0">
      <div className="relative w-fit">
        {/* Shimmer border layer */}
        <div className="absolute rounded-full blur-sm -inset-[2px] z-0" />
        <div className="relative z-10  h-16 w-16 lg:h-24 lg:w-24 p-[2px]">
          <Image
            src="/images/avatar.webp"
            alt="Iván Bongiovanni"
            width={100}
            height={100}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="block object-cover rounded-full"
            priority
          />
        </div>
      </div>
    </div>
  );
}

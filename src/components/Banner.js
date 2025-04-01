
import Image from "next/image";
import { Cinzel } from "next/font/google";

const cinzel = Cinzel({ subsets: ["latin"], weight: "700" });

export default function Banner() {
  return (
    <div className="relative w-full h-32 sm:h-48 overflow-hidden">
      <Image
        src="/banner.png"
        alt="Rethis Tools Banner"
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-start p-3">
        <h1 className={`${cinzel.className} text-white text-2xl sm:text-4xl font-bold drop-shadow-lg`}>
          Rethis Tools
        </h1>
      </div>
    </div>
  );
}

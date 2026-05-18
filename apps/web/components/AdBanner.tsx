import Image from "next/image";
import Link from "next/link";
import { Advertisement } from "@/lib/types";

export default function AdBanner({ ad }: { ad: Advertisement }) {
  if (!ad) return null;

  return (
    <div className="w-full my-4 rounded-xl overflow-hidden shadow-sm relative group bg-slate-100">
      <Link href={ad.link_url} target="_blank" rel="noopener noreferrer" className="block w-full h-[120px] md:h-[160px] relative">
        <Image
          src={ad.image_url}
          alt={ad.advertiser_name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
        <div className="absolute top-2 left-2 bg-black/40 text-white/90 text-[10px] px-2 py-0.5 rounded backdrop-blur-sm z-10">
          إعلان
        </div>
      </Link>
    </div>
  );
}

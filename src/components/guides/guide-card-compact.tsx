import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { Guide } from "@/types/guide";

interface GuideCardCompactProps {
  guide: Guide;
}

export default function GuideCardCompact({ guide }: GuideCardCompactProps) {
  return (
    <Link
      href={`/guides/${guide.slug}`}
      className="group relative block overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        {guide.coverImage ? (
          <Image
            src={guide.coverImage}
            alt={guide.alt || guide.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 bg-muted/80" />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Category badge */}
        {guide.categories && guide.categories[0] && (
          <div className="absolute top-3 left-3 z-20">
            <Badge
              variant="secondary"
              className="backdrop-blur-sm bg-background/80 shadow-sm text-xs"
            >
              {guide.categories[0]}
            </Badge>
          </div>
        )}

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
          <div className="flex items-center gap-1 text-white/90 text-xs mb-2">
            <Clock className="h-3 w-3" />
            <span>{guide.readingTime}</span>
          </div>
          <h3 className="text-white font-semibold text-base line-clamp-2 mb-1">
            {guide.title}
          </h3>
          <p className="text-white/80 text-xs line-clamp-2">{guide.description}</p>
        </div>
      </div>
    </Link>
  );
}

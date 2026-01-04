import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { ArrowUpRight, Clock } from "lucide-react";
import { Guide } from "@/types/guide";

interface GuideCardProps {
  guide: Guide;
}

export default function GuideCard({ guide }: GuideCardProps) {
  return (
    <Card className="group relative pt-0 overflow-hidden hover:shadow-xl transition-all duration-300 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-full">
      <Link
        href={`/guides/${guide.slug}`}
        className="absolute inset-0 z-10"
        aria-label={guide.title}
      />
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-lg">
        {guide.coverImage ? (
          <Image
            src={guide.coverImage}
            alt={guide.alt || guide.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
            loading="eager"
          />
        ) : (
          <div className="absolute inset-0 bg-muted/80" />
        )}
        {guide.categories && guide.categories[0] && (
          <div className="absolute top-4 left-4 z-20">
            <Badge
              variant="secondary"
              className="backdrop-blur-sm bg-background/80 shadow-sm"
            >
              {guide.categories[0]}
            </Badge>
          </div>
        )}
      </div>
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {guide.readingTime}
          </span>
          <span>
            <span className="font-medium">Updated:</span> {format(new Date(guide.lastUpdated || guide.date), "MMM d, yyyy")}
          </span>
        </div>
        <div className="group-hover:pr-8 transition-all duration-300">
          <h2 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
            {guide.title}
          </h2>
          <ArrowUpRight className="absolute top-[7.5rem] right-6 h-6 w-6 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-primary" />
        </div>
        <p className="text-muted-foreground line-clamp-3">{guide.description}</p>
      </CardHeader>
      {guide.city || guide.country && (
        <CardFooter>
          <div className="flex gap-2 flex-wrap">
            {guide.city && (
              <Badge variant="default">
                {guide.city}
              </Badge>
            )}
            {guide.country && (
              <Badge variant="outline" className="bg-background/80">
                {guide.country}
              </Badge>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

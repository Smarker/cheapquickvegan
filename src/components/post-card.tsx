import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";
import { Post } from "@/lib/types";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <Card className="group relative pt-0 overflow-hidden hover:shadow-xl transition-all duration-300 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-full">
      <Link
        href={`/recipes/${post.slug}`}
        className="absolute inset-0 z-10"
        aria-label={post.title}
      />
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-lg">
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={post.alt || post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="absolute inset-0 bg-muted/80" />
        )}
        {post.categories && post.categories[0] && (
          <div className="absolute top-4 left-4 z-20">
            <Badge
              variant="secondary"
              className="backdrop-blur-sm bg-background/80 shadow-sm"
            >
              {post.categories[0]}
            </Badge>
          </div>
        )}
      </div>
      <CardHeader className="space-y-2">
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">Published:</span> {format(new Date(post.date), "MMM d, yyyy")}
        </div>
        <div className="group-hover:pr-8 transition-all duration-300">
          <h1 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
            {post.title}
          </h1>
          <ArrowUpRight className="absolute top-[7.5rem] right-6 h-6 w-6 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-primary" />
        </div>
        <p className="text-muted-foreground line-clamp-2">{post.description}</p>
      </CardHeader>
      {(post.recipeCuisine || (post.tags && post.tags.length > 0)) && (
        <CardFooter>
          <div className="flex gap-2 flex-wrap">
            {post.recipeCuisine && (
              <Badge variant="default">
                {post.recipeCuisine}
              </Badge>
            )}
            {post.tags?.map((tag) => (
              <Badge key={tag} variant="outline" className="bg-background/80">
                {tag}
              </Badge>
            ))}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

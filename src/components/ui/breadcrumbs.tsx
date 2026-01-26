import Link from "next/link";
import { ChevronsRight } from "lucide-react";

/**
 * Breadcrumb component for navigation hierarchy
 * Displays a trail of links showing the user's location in the site structure
 *
 * SEO Benefits:
 * - Helps users understand site hierarchy
 * - Provides internal linking structure
 * - Works with BreadcrumbList schema markup
 */

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbGroup {
  items: BreadcrumbItem[];
}

interface BreadcrumbsProps {
  items: (BreadcrumbItem | BreadcrumbGroup)[];
  className?: string;
}

function isBreadcrumbGroup(item: BreadcrumbItem | BreadcrumbGroup): item is BreadcrumbGroup {
  return 'items' in item;
}

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-baseline text-sm leading-none py-0 my-0 h-auto ${className}`}>
      <ol className="flex items-baseline flex-wrap list-none p-0 m-0 sm:pl-2 py-0 my-0 h-auto">
        {items.map((item, index) => {
          return (
            <li key={index} className="flex items-baseline py-0 my-0 h-auto">
              {index > 0 && (
                <ChevronsRight className="w-3.5 h-3.5 text-muted-foreground/60 mr-1 inline-block align-baseline" aria-hidden="true" />
              )}
              {isBreadcrumbGroup(item) ? (
                // Render grouped items with "/" separator
                <span className="flex items-baseline gap-1">
                  {item.items.map((groupItem, groupIndex) => (
                    <span key={groupIndex} className="flex items-baseline">
                      {groupIndex > 0 && <span className="text-muted-foreground/60 mx-1">/</span>}
                      {groupItem.href ? (
                        <Link
                          href={groupItem.href}
                          className="text-primary font-medium hover:text-primary/80 hover:underline underline-offset-4 transition-all leading-none inline-block py-0 my-0"
                        >
                          {groupItem.label}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground font-medium leading-none inline-block py-0 my-0">
                          {groupItem.label}
                        </span>
                      )}
                    </span>
                  ))}
                </span>
              ) : (
                // Regular single item
                item.href ? (
                  <Link
                    href={item.href}
                    className="text-primary font-medium hover:text-primary/80 hover:underline underline-offset-4 transition-all leading-none inline-block py-0 my-0"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-muted-foreground font-medium leading-none inline-block py-0 my-0" aria-current="page">
                    {item.label}
                  </span>
                )
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

import Link from "next/link";
import { ChevronRight } from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mountainrun.in";

interface BreadcrumbItem {
  name: string;
  href: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.href}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-(--muted)">
        {items.map((item, index) => (
          <div key={item.href} className="flex items-center gap-2">
            {index > 0 && <ChevronRight className="h-4 w-4" />}
            {index === items.length - 1 ? (
              <span className="text-foreground">{item.name}</span>
            ) : (
              <Link
                className="transition hover:text-foreground hover:underline"
                href={item.href}
              >
                {item.name}
              </Link>
            )}
          </div>
        ))}
      </nav>
    </>
  );
}

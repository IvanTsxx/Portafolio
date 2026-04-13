import { SITE } from "@/shared/config/site";

interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        logo: `${SITE.url}/images/avatar.jpeg`,
        name: SITE.name,
        sameAs: [SITE.github, SITE.twitter, SITE.linkedin],
        url: SITE.url,
      }}
    />
  );
}

export function WebSiteJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        description: SITE.description,
        name: SITE.name,
        url: SITE.url,
      }}
    />
  );
}

export function BlogPostingJsonLd({
  title,
  description,
  date,
  slug,
  authorName = "Ivan Bongiovanni",
  authorUrl = SITE.url,
}: {
  authorName?: string;
  authorUrl?: string;
  date: string;
  description: string;
  slug: string;
  title: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        author: {
          "@type": "Person",
          name: authorName,
          url: authorUrl,
        },
        dateModified: date,
        datePublished: date,
        description,
        headline: title,
        mainEntityOfPage: {
          "@id": `${SITE.url}/thoughts/${slug}`,
          "@type": "WebPage",
        },
        publisher: {
          "@type": "Organization",
          logo: {
            "@type": "ImageObject",
            url: `${SITE.url}/images/avatar.jpeg`,
          },
          name: SITE.name,
        },
        title,
        url: `${SITE.url}/thoughts/${slug}`,
      }}
    />
  );
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          item: item.url,
          name: item.name,
          position: index + 1,
        })),
      }}
    />
  );
}

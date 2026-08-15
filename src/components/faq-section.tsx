type FaqItem = {
  q: string;
  a: string;
};

type Props = {
  title: string;
  items: FaqItem[];
};

export function FaqSection({ title, items }: Props) {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: {
        "@type": "Answer",
        text: a,
      },
    })),
  };

  return (
    <section className="mt-16 md:mt-24">
      <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {title}
      </h2>
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        {items.map(({ q, a }) => (
          <article key={q}>
            <h3 className="text-base font-medium">{q}</h3>
            <p className="mt-2 text-sm leading-relaxed text-foreground/70">
              {a}
            </p>
          </article>
        ))}
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c"),
        }}
      />
    </section>
  );
}

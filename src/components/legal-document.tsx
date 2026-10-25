import type { ReactNode } from "react";

type LegalSection = {
  heading: string;
  paragraphs?: ReactNode[];
  items?: ReactNode[];
};

type Props = {
  eyebrow: string;
  title: string;
  intro: string;
  lastUpdatedLabel: string;
  lastUpdated: string;
  sections: LegalSection[];
};

export function LegalDocument({
  eyebrow,
  title,
  intro,
  lastUpdatedLabel,
  lastUpdated,
  sections,
}: Props) {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-16 md:px-6 md:py-24">
      <header className="max-w-2xl">
        <p className="enter-rise text-xs uppercase tracking-[0.25em] text-primary">
          {eyebrow}
        </p>
        <h1 className="enter-rise enter-delay-1 mt-3 text-4xl font-semibold leading-tight tracking-tight text-balance sm:text-5xl md:text-6xl">
          {title}
        </h1>
        <p className="enter-rise enter-delay-2 mt-5 text-base leading-7 text-pretty text-foreground/70 sm:text-lg">
          {intro}
        </p>
        <p className="enter-rise enter-delay-2 mt-3 text-sm text-foreground/50">
          {lastUpdatedLabel}: <time dateTime="2026-09-26">{lastUpdated}</time>
        </p>
      </header>

      <div className="enter-rise enter-delay-3 mt-12 space-y-10">
        {sections.map((section) => (
          <section key={section.heading} className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight text-balance sm:text-2xl">
              {section.heading}
            </h2>
            {section.paragraphs?.map((paragraph, index) => (
              <p
                key={index}
                className="text-base leading-7 text-pretty text-foreground/70"
              >
                {paragraph}
              </p>
            ))}
            {section.items && (
              <ul className="list-disc space-y-3 pl-5 text-base leading-7 text-foreground/70 marker:text-primary">
                {section.items.map((item, index) => (
                  <li key={index} className="pl-1 text-pretty">
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </article>
  );
}

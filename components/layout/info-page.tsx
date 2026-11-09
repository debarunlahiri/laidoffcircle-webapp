import AppHeader from "./app-header";
import type { ReactNode } from "react";
import SiteFooter from "./site-footer";

export type InfoSection = { id: string; title: string; content: ReactNode };

export default function InfoPage({
  title,
  intro,
  updated,
  sections,
  children,
}: {
  title: string;
  intro: string;
  updated?: string;
  sections?: InfoSection[];
  children?: ReactNode;
}) {
  return (
    <>
      <AppHeader
        title={title}
        back={{ href: "/more", label: "Back to More" }}
      />
      <main className="info-page">
        <article className="card info-page-content">
          <header>
            <h1>{title}</h1>
            <p>{intro}</p>
            {updated && (
              <small className="info-updated">Last updated {updated}</small>
            )}
          </header>
          {sections && sections.length > 3 && (
            <nav className="info-toc" aria-label="On this page">
              <strong>On this page</strong>
              <ol>
                {sections.map((section) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`}>{section.title}</a>
                  </li>
                ))}
              </ol>
            </nav>
          )}
          {sections?.map((section) => (
            <section key={section.id} id={section.id}>
              <h2>{section.title}</h2>
              {section.content}
            </section>
          ))}
          {children}
        </article>
        <SiteFooter />
      </main>
    </>
  );
}

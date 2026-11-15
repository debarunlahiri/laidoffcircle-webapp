"use client";
import { usePlatform } from "@/providers/platform-provider";
import { ArrowDownUp, Search } from "lucide-react";
import { useMemo, useState } from "react";

type SortKey = "rolesAffected" | "headcount" | "hires" | "name";
const sorts: { key: SortKey; label: string }[] = [
  { key: "rolesAffected", label: "Roles affected" },
  { key: "headcount", label: "Headcount" },
  { key: "hires", label: "Hires" },
  { key: "name", label: "Name" },
];

export default function CompanyTable() {
  const { year, insights } = usePlatform();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("rolesAffected");
  const count = (value: number | null) =>
    value === null ? "—" : Number(value).toLocaleString();
  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return insights.companies
      .filter((company) => company.name.toLowerCase().includes(needle))
      .sort((a, b) =>
        sort === "name"
          ? a.name.localeCompare(b.name)
          : Number(b[sort] ?? -1) - Number(a[sort] ?? -1),
      );
  }, [insights.companies, query, sort]);
  const maximum = Math.max(
    1,
    ...insights.companies.map((company) => Number(company.rolesAffected)),
  );
  return (
    <section className="ins-card ins-companies">
      <div className="ins-card-head">
        <div>
          <h2>Company overview</h2>
          <p>
            {insights.companies.length} compan
            {insights.companies.length === 1 ? "y" : "ies"} · {year}
          </p>
        </div>
        <div className="ins-tools">
          <label className="ins-search">
            <Search size={15} aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Find a company"
              aria-label="Find a company"
            />
          </label>
          <label className="ins-sort">
            <ArrowDownUp size={14} aria-hidden="true" />
            <select
              aria-label="Sort companies"
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
            >
              {sorts.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <ol className="ins-rows">
        {rows.map((company, index) => (
          <li key={company.id} className="ins-row">
            <span className="ins-rank">{index + 1}</span>
            <span className="ins-avatar" aria-hidden="true">
              {company.name.slice(0, 1).toUpperCase()}
            </span>
            <div className="ins-row-main">
              <div className="ins-row-top">
                <strong>{company.name}</strong>
                <span className="ins-pill">User reported</span>
              </div>
              <div className="ins-meter" aria-hidden="true">
                <span
                  style={{
                    width: `${(Number(company.rolesAffected) / maximum) * 100}%`,
                  }}
                />
              </div>
            </div>
            <dl className="ins-figures">
              <div>
                <dt>Roles affected</dt>
                <dd className="is-main">{count(company.rolesAffected)}</dd>
              </div>
              <div>
                <dt>Headcount</dt>
                <dd>{count(company.headcount)}</dd>
              </div>
              <div>
                <dt>Hires</dt>
                <dd>{count(company.hires)}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ol>
      {!rows.length && (
        <p className="ins-empty">
          {insights.companies.length
            ? "No companies match your search."
            : `No workforce reports for ${year}.`}
        </p>
      )}
      <p className="ins-foot">
        Reports may overlap. Headcount and hires are reported figures, not
        inferred from workforce changes. “—” means no figure was reported.
      </p>
    </section>
  );
}

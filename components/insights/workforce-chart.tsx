"use client";
import { usePlatform } from "@/providers/platform-provider";
import { useMemo, useState } from "react";

const compact = (value: number) =>
  new Intl.NumberFormat(undefined, { notation: "compact" }).format(value);

export default function WorkforceChart() {
  const { year, insights } = usePlatform();
  const [active, setActive] = useState<number | null>(null);
  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => {
        const row = insights.monthly.find(
          (item) => Number(item.month) === index + 1,
        );
        return {
          label: new Intl.DateTimeFormat(undefined, { month: "short" }).format(
            new Date(2000, index, 1),
          ),
          value: Number(row?.rolesAffected ?? 0),
          reports: Number(row?.reports ?? 0),
        };
      }),
    [insights.monthly],
  );
  const total = months.reduce((sum, item) => sum + item.value, 0);
  const peak = months.reduce((best, item) =>
    item.value > best.value ? item : best,
  );
  const maximum = Math.max(4, ...months.map((item) => item.value));
  const ticks = [1, 0.75, 0.5, 0.25, 0];
  const shown = active === null ? null : months[active];
  return (
    <section className="ins-card ins-chart">
      <div className="ins-card-head">
        <div>
          <h2>Roles affected by month</h2>
          <p>Reported monthly figures · {year}</p>
        </div>
        <div className="ins-chart-summary" aria-live="polite">
          <strong>{(shown ? shown.value : total).toLocaleString()}</strong>
          <span>
            {shown
              ? `${shown.label} · ${shown.reports} report${shown.reports === 1 ? "" : "s"}`
              : peak.value > 0
                ? `Total · peak in ${peak.label}`
                : "Total"}
          </span>
        </div>
      </div>
      <div className="ins-plot">
        <div className="ins-axis" aria-hidden="true">
          {ticks.map((tick) => (
            <span key={tick}>{compact(Math.round(maximum * tick))}</span>
          ))}
        </div>
        <div className="ins-bars" onMouseLeave={() => setActive(null)}>
          {ticks.map((tick) => (
            <i
              key={tick}
              className="ins-grid"
              style={{ bottom: `${tick * 100}%` }}
              aria-hidden="true"
            />
          ))}
          {months.map((item, index) => (
            <button
              type="button"
              key={item.label}
              className={`ins-col${active === index ? " is-active" : ""}${item.value === peak.value && item.value > 0 ? " is-peak" : ""}`}
              onMouseEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
              onBlur={() => setActive(null)}
              onClick={() => setActive(active === index ? null : index)}
              aria-label={`${item.label}: ${item.value.toLocaleString()} reported roles`}
            >
              <span className="ins-bar-track">
                <span
                  className="ins-bar"
                  style={{
                    height: `${item.value ? Math.max(3, (item.value / maximum) * 100) : 0}%`,
                  }}
                />
              </span>
              <small>{item.label}</small>
            </button>
          ))}
        </div>
      </div>
      {total === 0 && <p className="ins-empty">No reports for {year} yet.</p>}
    </section>
  );
}

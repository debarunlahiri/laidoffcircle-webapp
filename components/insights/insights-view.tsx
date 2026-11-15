"use client";
import CompanyTable from "@/components/insights/company-table";
import WorkforceChart from "@/components/insights/workforce-chart";
import { usePlatform } from "@/providers/platform-provider";
import ReportDialog from "@/components/insights/report-dialog";
import {
  Building2,
  FilePlus2,
  FileText,
  ShieldCheck,
  TrendingDown,
} from "lucide-react";
import { useMemo, useState } from "react";

export default function InsightsView() {
  const { year, setYear, insights, insightsLoading, insightsError } =
    usePlatform();
  const [reporting, setReporting] = useState(false);
  const current = new Date().getFullYear();
  const totals = useMemo(
    () => ({
      roles: insights.companies.reduce(
        (sum, item) => sum + Number(item.rolesAffected),
        0,
      ),
      companies: insights.companies.length,
      reports: insights.monthly.reduce(
        (sum, item) => sum + Number(item.reports),
        0,
      ),
    }),
    [insights],
  );
  const stats = [
    {
      icon: TrendingDown,
      value: totals.roles,
      label: "Reported roles affected",
      tone: "rose",
    },
    {
      icon: Building2,
      value: totals.companies,
      label: "Companies reported",
      tone: "blue",
    },
    {
      icon: FileText,
      value: totals.reports,
      label: "Submitted reports",
      tone: "violet",
    },
  ];
  return (
    <div className="ins-page">
      <header className="ins-hero">
        <div className="ins-hero-text">
          <span className="ins-eyebrow">Workforce insights</span>
          <h2>Every number is a human story.</h2>
          <p>
            Layoff and hiring figures shared by the community, gathered in one
            place so nobody has to read the room alone.
          </p>
        </div>
        <div className="ins-hero-actions">
          <label className="ins-year">
            <span>Year</span>
            <select
              aria-label="Reporting year"
              value={year}
              onChange={(event) => setYear(event.target.value)}
            >
              {Array.from(
                { length: Math.max(3, current - 2023) },
                (_, i) => current - i,
              ).map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <button className="primary" onClick={() => setReporting(true)}>
            <FilePlus2 size={16} /> Submit a report
          </button>
        </div>
      </header>
      <div className="ins-stats">
        {stats.map(({ icon: Icon, value, label, tone }) => (
          <div className={`ins-stat ins-${tone}`} key={label}>
            <span className="ins-stat-icon">
              <Icon size={20} aria-hidden="true" />
            </span>
            <div>
              <strong>{insightsLoading ? "—" : value.toLocaleString()}</strong>
              <span>{label}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="ins-notice">
        <ShieldCheck size={18} aria-hidden="true" />
        <span>{insights.notice}</span>
      </div>
      {insightsLoading && <p role="status">Loading workforce reports…</p>}
      {insightsError && <p role="alert">{insightsError}</p>}
      <WorkforceChart />
      <CompanyTable />
      {reporting && <ReportDialog onClose={() => setReporting(false)} />}
    </div>
  );
}

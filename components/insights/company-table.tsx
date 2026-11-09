"use client";
import { usePlatform } from "@/providers/platform-provider";
export default function CompanyTable() {
  const { year, insights } = usePlatform();
  const count = (value: number | null) =>
    value === null ? "Unavailable" : Number(value).toLocaleString();
  return (
    <section className="card company-table">
      <h2>Company overview</h2>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Company</th>
              <th>Roles affected</th>
              <th>Headcount</th>
              <th>Hires</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {insights.companies.map((company) => (
              <tr key={company.id}>
                <td>{company.name}</td>
                <td>{count(company.rolesAffected)}</td>
                <td>{count(company.headcount)}</td>
                <td>{count(company.hires)}</td>
                <td>
                  <span className="tag">User reported</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!insights.companies.length && (
        <p className="subtle-text">No workforce reports for {year}.</p>
      )}
      <p className="subtle-text">
        Period: {year}. Reports may overlap. Headcount and hires are reported
        figures, not inferred from workforce changes.
      </p>
    </section>
  );
}

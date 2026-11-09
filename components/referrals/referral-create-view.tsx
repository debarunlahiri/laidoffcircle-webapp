"use client";
import MarkdownEditor from "@/components/ui/markdown-editor";
import ReferralFieldBuilder, {
  type DraftField,
} from "@/components/referrals/referral-field-builder";
import CompanyAutocomplete from "@/components/ui/company-autocomplete";
import LocationAutocomplete from "@/components/ui/location-autocomplete";
import SkillsInput from "@/components/ui/skills-input";
import { useApiResource } from "@/hooks/use-api-resource";
import type {
  ApiCompany,
  ReferralLevel,
  ReferralWorkMode,
} from "@/lib/api-types";
import { levelLabels, workModeLabels } from "@/lib/referral-meta";
import { usePlatform } from "@/providers/platform-provider";
import { BriefcaseBusiness, Globe2, Layers, MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const starterFields: DraftField[] = [
  { label: "Resume / CV", type: "file", required: true, options: [] },
  {
    label: "Why are you a good fit?",
    type: "textarea",
    required: true,
    options: [],
  },
];

// "company.com/jobs" becomes "https://company.com/jobs"; blank stays blank.
const validLink = (value: string) => {
  if (!value.trim()) return true;
  try {
    return Boolean(new URL(toWebLink(value)).hostname.includes("."));
  } catch {
    return false;
  }
};
const toWebLink = (value: string) => {
  const link = value.trim();
  return !link || /^https?:\/\//i.test(link) ? link : `https://${link}`;
};

// A full page (not a dialog): the form is long and has a live preview.
export default function ReferralCreateView() {
  const router = useRouter();
  const { currentUser, addReferral, referralSaving } = usePlatform();
  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [workMode, setWorkMode] = useState<ReferralWorkMode>("onsite");
  const [level, setLevel] = useState<ReferralLevel | "">("");
  const [years, setYears] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [companyLink, setCompanyLink] = useState("");
  const [jobLink, setJobLink] = useState("");
  const [requestFields, setRequestFields] = useState(starterFields);
  const companyInfo = useApiResource<ApiCompany | null>(
    company ? `/companies/${company}` : null,
    null,
  );
  const place = location.trim() || (workMode === "remote" ? "Remote" : "");
  const missing = [
    !company && "Select a company",
    !title.trim() && "Enter a job title",
    !place && "Add a location (or choose Remote)",
    !skills.length && "Add at least one skill",
    !validLink(companyLink) && "Company link isn’t a valid web address",
    !validLink(jobLink) && "Job description link isn’t a valid web address",
  ].filter(Boolean) as string[];
  const valid = missing.length === 0;

  return (
    <div className="referral-create">
      <form
        className="referral-create-layout"
        onSubmit={async (event) => {
          event.preventDefault();
          if (
            await addReferral({
              company,
              title,
              location: place,
              skills: skills.join(", "),
              description,
              companyLink: toWebLink(companyLink),
              jobLink: toWebLink(jobLink),
              workMode,
              level: level || null,
              minExperience: years === "" ? null : Number(years),
              requestFields,
            })
          )
            router.push("/referrals");
        }}
      >
        <div className="referral-create-main">
          <section className="card create-section">
            <h2>The role</h2>
            <CompanyAutocomplete
              value={company}
              onChange={setCompany}
              required
            />
            <label className="field-label">
              Job title
              <input
                required
                maxLength={120}
                placeholder="e.g. Store Manager, Nurse, or Software Engineer"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </label>
            <LocationAutocomplete
              label="Location"
              value={location}
              onChange={setLocation}
              placeholder={
                workMode === "remote"
                  ? "Optional for remote roles"
                  : "Search a city, e.g. Bengaluru"
              }
              required={workMode !== "remote"}
            />
            <div className="field-label">
              Work arrangement
              <div
                className="segmented"
                role="radiogroup"
                aria-label="Work arrangement"
              >
                {(
                  Object.entries(workModeLabels) as [ReferralWorkMode, string][]
                ).map(([value, text]) => (
                  <button
                    type="button"
                    key={value}
                    role="radio"
                    aria-checked={workMode === value}
                    className={workMode === value ? "selected" : ""}
                    onClick={() => setWorkMode(value)}
                  >
                    {text}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="card create-section">
            <h2>Who it suits</h2>
            <SkillsInput label="Skills" skills={skills} onChange={setSkills} />
            <div className="two-fields">
              <label className="field-label">
                Minimum experience (years)
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={60}
                  step={1}
                  placeholder="e.g. 4"
                  value={years}
                  onChange={(event) =>
                    setYears(
                      event.target.value.replace(/[^0-9]/g, "").slice(0, 2),
                    )
                  }
                />
              </label>
              <label className="field-label">
                Seniority
                <select
                  className="filter-select"
                  value={level}
                  onChange={(event) =>
                    setLevel(event.target.value as ReferralLevel | "")
                  }
                >
                  <option value="">Any level</option>
                  {Object.entries(levelLabels).map(([value, text]) => (
                    <option key={value} value={value}>
                      {text}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="field-label">
              Additional details (optional)
              <MarkdownEditor
                ariaLabel="Additional details"
                maxLength={10000}
                rows={7}
                placeholder="About the team, the role, and how you can help with a referral…"
                value={description}
                onChange={setDescription}
              />
              <small className="subtle-text">
                Markdown supported: headings, lists, tables and links.
              </small>
            </label>
            <label className="field-label">
              Job description link (optional)
              <input
                type="text"
                inputMode="url"
                maxLength={2048}
                placeholder="https://company.com/jobs/123"
                value={jobLink}
                onChange={(event) => setJobLink(event.target.value)}
              />
            </label>
            <label className="field-label">
              Company link (optional)
              <input
                type="text"
                inputMode="url"
                maxLength={2048}
                placeholder="https://company.com/careers"
                value={companyLink}
                onChange={(event) => setCompanyLink(event.target.value)}
              />
            </label>
          </section>

          <section className="card create-section">
            <h2>What requesters share</h2>
            <ReferralFieldBuilder
              fields={requestFields}
              onChange={setRequestFields}
            />
          </section>
        </div>

        <aside className="referral-create-side">
          <div className="card create-preview" aria-label="Preview">
            <small className="preview-label">Preview</small>
            <div className="opportunity-top">
              <span className="company-logo purple">
                {companyInfo.data?.name?.[0]?.toUpperCase() ?? "?"}
              </span>
              <span>
                <strong>{companyInfo.data?.name ?? "Choose a company"}</strong>
                <small>Employee referral</small>
              </span>
            </div>
            <h3>{title.trim() || "Job title"}</h3>
            <div className="referral-facts">
              <span>
                <MapPin size={14} />
                {place || "Location"}
              </span>
              <span>
                <Globe2 size={14} />
                {workModeLabels[workMode]}
              </span>
              {level && (
                <span>
                  <Layers size={14} />
                  {levelLabels[level]}
                </span>
              )}
            </div>
            <div className="skill-chips">
              {skills.length ? (
                skills.map((skill) => (
                  <span className="skill-chip static" key={skill}>
                    {skill}
                  </span>
                ))
              ) : (
                <small className="optional-mark">Skills appear here</small>
              )}
              {years && (
                <span className="skill-chip static years">{years}+ years</span>
              )}
            </div>
            <p className="subtle-text">
              Offered by {currentUser?.name ?? "you"}.
              {requestFields.length > 0 &&
                ` Requesters will share: ${requestFields.map((f) => f.label).join(", ")}.`}
            </p>
          </div>
          <div className="create-actions">
            <button className="primary" disabled={!valid || referralSaving}>
              <BriefcaseBusiness size={16} />
              {referralSaving ? "Publishing…" : "Publish referral"}
            </button>
            <Link className="text-button" href="/referrals">
              Cancel
            </Link>
          </div>
          {!valid && (
            <p className="subtle-text" role="status">
              To publish: {missing.join(" · ")}.
            </p>
          )}
          <p className="subtle-text">
            Referrals are voluntary and always free.
          </p>
        </aside>
      </form>
    </div>
  );
}

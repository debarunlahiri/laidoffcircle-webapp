"use client";
import LocationAutocomplete from "@/components/ui/location-autocomplete";
import CompanyAutocomplete from "@/components/ui/company-autocomplete";
import type { ReferralFilters } from "@/hooks/use-referral-board";
import {
  levelLabels,
  postedOptions,
  sortOptions,
  workModeLabels,
} from "@/lib/referral-meta";
import {
  ArrowDownUp,
  BadgeCheck,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useState } from "react";

type Props = {
  filters: ReferralFilters;
  activeCount: number;
  signedIn: boolean;
  onChange: (patch: Partial<ReferralFilters>) => void;
  onReset: () => void;
};

export default function ReferralFiltersBar({
  filters,
  activeCount,
  signedIn,
  onChange,
  onReset,
}: Props) {
  const [open, setOpen] = useState(false);
  const chips: { label: string; clear: Partial<ReferralFilters> }[] = [];
  if (filters.status)
    chips.push({
      label: `Status: ${filters.status}`,
      clear: { status: "" },
    });
  if (filters.workMode)
    chips.push({
      label: workModeLabels[filters.workMode],
      clear: { workMode: "" },
    });
  if (filters.level)
    chips.push({ label: levelLabels[filters.level], clear: { level: "" } });
  if (filters.location.trim())
    chips.push({
      label: `Location: ${filters.location}`,
      clear: { location: "" },
    });
  if (filters.skill.trim())
    chips.push({ label: `Skill: ${filters.skill}`, clear: { skill: "" } });
  if (filters.experience)
    chips.push({
      label: `${filters.experience} yrs experience`,
      clear: { experience: "" },
    });
  if (filters.postedWithin)
    chips.push({
      label:
        postedOptions.find((o) => o.value === filters.postedWithin)?.label ??
        "",
      clear: { postedWithin: "" },
    });
  if (filters.requestStatus)
    chips.push({
      label: `My request: ${filters.requestStatus}`,
      clear: { requestStatus: "" },
    });
  if (filters.companyId)
    chips.push({ label: "Company selected", clear: { companyId: "" } });
  if (filters.topRated)
    chips.push({ label: "Top referrers", clear: { topRated: false } });

  return (
    <div className="referral-toolbar">
      <div className="referral-toolbar-row">
        <label className="referral-search">
          <Search size={16} />
          <input
            type="search"
            aria-label="Search referrals"
            placeholder="Search role, company, skill or place"
            value={filters.search}
            onChange={(event) => onChange({ search: event.target.value })}
          />
        </label>
        <label className="referral-sort">
          <ArrowDownUp size={15} />
          <select
            aria-label="Sort referrals"
            className="filter-select"
            value={filters.sort}
            onChange={(event) => onChange({ sort: event.target.value })}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className={`secondary filter-toggle ${open || activeCount ? "on" : ""}`}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <SlidersHorizontal size={15} />
          Filters{activeCount ? <b>{activeCount}</b> : null}
        </button>
      </div>
      {open && (
        <div className="referral-filter-panel card">
          <label>
            Status
            <select
              className="filter-select"
              value={filters.status}
              onChange={(event) =>
                onChange({
                  status: event.target.value as ReferralFilters["status"],
                })
              }
            >
              <option value="">Default</option>
              <option value="open">Open only</option>
              <option value="closed">Closed only</option>
              <option value="all">Open and closed</option>
            </select>
          </label>
          <label>
            Work arrangement
            <select
              className="filter-select"
              value={filters.workMode}
              onChange={(event) =>
                onChange({
                  workMode: event.target.value as ReferralFilters["workMode"],
                })
              }
            >
              <option value="">Any</option>
              {Object.entries(workModeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Experience level
            <select
              className="filter-select"
              value={filters.level}
              onChange={(event) =>
                onChange({
                  level: event.target.value as ReferralFilters["level"],
                })
              }
            >
              <option value="">Any</option>
              {Object.entries(levelLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Posted
            <select
              className="filter-select"
              value={filters.postedWithin}
              onChange={(event) =>
                onChange({ postedWithin: event.target.value })
              }
            >
              {postedOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <div className="referral-filter-company">
            Location
            <LocationAutocomplete
              compact
              placeholder="e.g. Bengaluru"
              value={filters.location}
              onChange={(location) => onChange({ location })}
            />
          </div>
          <label>
            My experience (years)
            <input
              type="number"
              min={0}
              max={60}
              placeholder="Roles I qualify for"
              value={filters.experience}
              onChange={(event) =>
                onChange({
                  experience: event.target.value
                    .replace(/[^0-9]/g, "")
                    .slice(0, 2),
                })
              }
            />
          </label>
          <label>
            Skill
            <input
              placeholder="Search any skill"
              value={filters.skill}
              onChange={(event) => onChange({ skill: event.target.value })}
            />
          </label>
          <div className="referral-filter-company">
            <CompanyAutocomplete
              label="Company"
              placeholder="Any company"
              value={filters.companyId}
              onChange={(companyId) => onChange({ companyId })}
            />
          </div>
          {signedIn && (
            <label>
              My request status
              <select
                className="filter-select"
                value={filters.requestStatus}
                onChange={(event) =>
                  onChange({
                    requestStatus: event.target
                      .value as ReferralFilters["requestStatus"],
                  })
                }
              >
                <option value="">Any</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="declined">Declined</option>
              </select>
            </label>
          )}
          <label className="filter-check">
            <input
              type="checkbox"
              checked={filters.topRated}
              onChange={(event) => onChange({ topRated: event.target.checked })}
            />
            <BadgeCheck size={15} /> Only top referrers (70%+ helpful)
          </label>
        </div>
      )}
      {chips.length > 0 && (
        <div className="filter-chips" aria-label="Active filters">
          {chips.map((chip) => (
            <button
              key={chip.label}
              type="button"
              className="filter-chip"
              onClick={() => onChange(chip.clear)}
            >
              {chip.label} <X size={12} />
            </button>
          ))}
          <button type="button" className="text-button" onClick={onReset}>
            <RotateCcw size={13} /> Clear all
          </button>
        </div>
      )}
    </div>
  );
}

"use client";

import CompanyAutocomplete from "@/components/ui/company-autocomplete";
import BottomSheet from "@/components/ui/bottom-sheet";
import { usePlatform } from "@/providers/platform-provider";
import { FilePlus2 } from "lucide-react";
import { useState } from "react";

const optionalCount = (value: string) =>
  value.trim() === "" ? null : Number(value);

export default function ReportDialog({ onClose }: { onClose: () => void }) {
  const { submitReport } = usePlatform();
  const [companyId, setCompanyId] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [rolesAffected, setRolesAffected] = useState("");
  const [headcount, setHeadcount] = useState("");
  const [hires, setHires] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const valid =
    companyId && eventDate && Number(rolesAffected) >= 1 && sourceUrl;

  return (
    <BottomSheet title="Submit a report" onClose={onClose}>
      <p className="subtle-text">
        Reports are marked as user reported and are not independently verified.
        Please include a public source.
      </p>
      <form
        className="referral-create-form workforce-report-form"
        onSubmit={async (event) => {
          event.preventDefault();
          setSaving(true);
          const ok = await submitReport({
            companyId,
            eventDate,
            rolesAffected: Number(rolesAffected),
            headcount: optionalCount(headcount),
            hires: optionalCount(hires),
            sourceUrl: sourceUrl.trim(),
          });
          setSaving(false);
          if (ok) onClose();
        }}
      >
        <CompanyAutocomplete
          value={companyId}
          onChange={setCompanyId}
          required
        />
        <label className="field-label">
          Event date
          <input
            required
            type="date"
            max={new Date().toISOString().slice(0, 10)}
            value={eventDate}
            onChange={(event) => setEventDate(event.target.value)}
          />
        </label>
        <label className="field-label">
          Roles affected
          <input
            required
            type="number"
            min={1}
            value={rolesAffected}
            onChange={(event) => setRolesAffected(event.target.value)}
          />
        </label>
        <label className="field-label">
          Company headcount (optional)
          <input
            type="number"
            min={0}
            value={headcount}
            onChange={(event) => setHeadcount(event.target.value)}
          />
        </label>
        <label className="field-label">
          Hires (optional)
          <input
            type="number"
            min={0}
            value={hires}
            onChange={(event) => setHires(event.target.value)}
          />
        </label>
        <label className="field-label">
          Source link
          <input
            required
            type="url"
            placeholder="https://…"
            value={sourceUrl}
            onChange={(event) => setSourceUrl(event.target.value)}
          />
        </label>
        <div className="modal-bottom">
          <span />
          <button className="primary" disabled={!valid || saving}>
            <FilePlus2 size={16} />
            {saving ? "Submitting…" : "Submit report"}
          </button>
        </div>
      </form>
    </BottomSheet>
  );
}

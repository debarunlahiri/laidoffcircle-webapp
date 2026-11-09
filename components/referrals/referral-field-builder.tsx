"use client";
import { fieldPresets, fieldTypeLabels } from "@/lib/referral-meta";
import type { ReferralFieldType } from "@/lib/api-types";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

export type DraftField = {
  label: string;
  type: ReferralFieldType;
  required: boolean;
  options: string[];
};

// Lets the referrer decide what a requester must share.
export default function ReferralFieldBuilder({
  fields,
  onChange,
}: {
  fields: DraftField[];
  onChange: (fields: DraftField[]) => void;
}) {
  const [label, setLabel] = useState("");
  const [type, setType] = useState<ReferralFieldType>("text");
  const [options, setOptions] = useState("");
  const max = 8;
  const has = (text: string) =>
    fields.some((field) => field.label.toLowerCase() === text.toLowerCase());

  function add(field: DraftField) {
    if (fields.length >= max || has(field.label)) return;
    onChange([...fields, field]);
  }
  const customOptions = options
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const customValid =
    label.trim().length > 0 && (type !== "select" || customOptions.length >= 2);

  return (
    <fieldset className="field-builder">
      <legend>What should requesters share with you?</legend>
      <p className="subtle-text">
        People fill these in when they request a referral. Add a resume upload,
        questions, links or choices.
      </p>
      <div className="preset-row">
        {fieldPresets.map((preset) => (
          <button
            type="button"
            key={preset.label}
            className="filter-chip"
            disabled={has(preset.label) || fields.length >= max}
            onClick={() => add({ options: [], ...preset })}
          >
            <Plus size={12} /> {preset.label}
          </button>
        ))}
      </div>
      {fields.length > 0 && (
        <ol className="draft-fields">
          {fields.map((field, index) => (
            <li key={field.label}>
              <span>
                <strong>{field.label}</strong>
                <small>
                  {fieldTypeLabels[field.type]}
                  {field.type === "select" && ` · ${field.options.join(", ")}`}
                </small>
              </span>
              <label className="filter-check">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(event) =>
                    onChange(
                      fields.map((item, i) =>
                        i === index
                          ? { ...item, required: event.target.checked }
                          : item,
                      ),
                    )
                  }
                />
                Required
              </label>
              <button
                type="button"
                className="icon-button"
                aria-label={`Remove ${field.label}`}
                onClick={() => onChange(fields.filter((_, i) => i !== index))}
              >
                <Trash2 size={15} />
              </button>
            </li>
          ))}
        </ol>
      )}
      <div className="custom-field">
        <input
          aria-label="Custom question"
          placeholder="Add your own question…"
          maxLength={80}
          value={label}
          onChange={(event) => setLabel(event.target.value)}
        />
        <select
          aria-label="Answer type"
          className="filter-select"
          value={type}
          onChange={(event) => setType(event.target.value as ReferralFieldType)}
        >
          {Object.entries(fieldTypeLabels).map(([value, text]) => (
            <option key={value} value={value}>
              {text}
            </option>
          ))}
        </select>
        {type === "select" && (
          <input
            aria-label="Choices"
            placeholder="Choices, separated by commas"
            value={options}
            onChange={(event) => setOptions(event.target.value)}
          />
        )}
        <button
          type="button"
          className="secondary"
          disabled={!customValid || has(label) || fields.length >= max}
          onClick={() => {
            add({
              label: label.trim(),
              type,
              required: false,
              options: type === "select" ? customOptions.slice(0, 10) : [],
            });
            setLabel("");
            setOptions("");
          }}
        >
          <Plus size={14} /> Add
        </button>
      </div>
    </fieldset>
  );
}

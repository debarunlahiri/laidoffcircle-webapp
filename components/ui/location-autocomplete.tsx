"use client";
import { useDebouncedValue } from "@/hooks/use-api-resource";
import {
  mapsKey,
  mapsLink,
  newPlaceSession,
  suggestPlaces,
} from "@/lib/google-maps";
import { ExternalLink, MapPin } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

// Place search backed by Google Maps. Without an API key it is a plain text
// field, so typing a location always works.
export default function LocationAutocomplete({
  label,
  name,
  value,
  onChange,
  placeholder = "Search a city or region",
  required = false,
  compact = false,
}: {
  label?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  compact?: boolean;
}) {
  const id = useId();
  const session = useRef<object | null>(null);
  const [options, setOptions] = useState<{ id: string; text: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [problem, setProblem] = useState(false);
  const typed = useDebouncedValue(value.trim());

  useEffect(() => {
    if (!mapsKey || !open || typed.length < 2) {
      setOptions([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        session.current ??= await newPlaceSession();
        const found = await suggestPlaces(typed, session.current);
        if (!cancelled) {
          setOptions(found.slice(0, 6));
          setProblem(false);
        }
      } catch {
        if (!cancelled) {
          setOptions([]);
          setProblem(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [typed, open]);

  function pick(text: string) {
    onChange(text);
    setOpen(false);
    setActive(-1);
    session.current = null;
  }

  const field = (
    <div
      className="location-field"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <div className="location-input">
        <MapPin size={16} />
        <input
          id={id}
          name={name}
          aria-autocomplete="list"
          aria-activedescendant={
            open && options[active] ? `${id}-option-${active}` : undefined
          }
          required={required}
          maxLength={160}
          autoComplete="off"
          role="combobox"
          aria-expanded={open && options.length > 0}
          aria-controls={`${id}-list`}
          placeholder={placeholder}
          value={value}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            onChange(event.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" && options.length) {
              event.preventDefault();
              setActive((current) => (current + 1) % options.length);
            } else if (event.key === "ArrowUp" && options.length) {
              event.preventDefault();
              setActive(
                (current) => (current - 1 + options.length) % options.length,
              );
            } else if (event.key === "Enter" && open && options[active]) {
              event.preventDefault();
              pick(options[active].text);
            } else if (event.key === "Escape") setOpen(false);
          }}
        />
        {value.trim() && (
          <a
            className="icon-button"
            href={mapsLink(value.trim())}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open in Google Maps"
            title="Open in Google Maps"
          >
            <ExternalLink size={14} />
          </a>
        )}
      </div>
      {open && options.length > 0 && (
        <ul className="skills-list" id={`${id}-list`} role="listbox">
          {options.map((option, index) => (
            <li
              key={option.id}
              id={`${id}-option-${index}`}
              role="option"
              aria-selected={index === active}
              className={index === active ? "active" : ""}
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setActive(index)}
              onClick={() => pick(option.text)}
            >
              <MapPin size={13} /> {option.text}
            </li>
          ))}
          <li className="maps-credit" aria-hidden="true">
            Powered by Google Maps
          </li>
        </ul>
      )}
      {!compact && !mapsKey && (
        <small className="location-hint">Enter your city or region.</small>
      )}
      {!compact && problem && (
        <small className="location-hint">
          Google Maps suggestions are unavailable. You can still type a place.
        </small>
      )}
    </div>
  );
  if (!label) return field;
  return (
    <div className="field-label">
      <label htmlFor={id}>{label}</label>
      {field}
    </div>
  );
}

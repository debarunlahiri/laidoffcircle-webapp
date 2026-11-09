"use client";

import { useApiResource, useDebouncedValue } from "@/hooks/use-api-resource";
import { api, apiMessage, queryPath } from "@/lib/api";
import type { ApiCompany } from "@/lib/api-types";
import { Check, ChevronDown, Plus, X } from "lucide-react";
import { useId, useLayoutEffect, useRef, useState } from "react";

export default function CompanyAutocomplete({
  value,
  onChange,
  required = false,
  label,
  placeholder = "Search and select a company",
}: {
  required?: boolean;
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (company: string) => void;
}) {
  const id = useId();
  const field = useRef<HTMLDivElement>(null);
  const [placement, setPlacement] = useState({
    upward: false,
    maxHeight: 220,
    bottom: 0,
  });
  const input = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(-1);
  const search = useDebouncedValue(query);
  const result = useApiResource<ApiCompany[]>(
    open ? queryPath("/companies", { search, limit: 50 }) : null,
    [],
  );
  const selection = useApiResource<ApiCompany | null>(
    value ? `/companies/${value}` : null,
    null,
  );
  const options = result.data;
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const typed = query.trim();
  // Offer to add the company when what was typed isn't already in the list.
  const canCreate =
    typed.length >= 2 &&
    !result.loading &&
    !options.some((o) => o.name.toLowerCase() === typed.toLowerCase());

  async function createCompany() {
    if (creating || !canCreate) return;
    setCreating(true);
    setCreateError("");
    try {
      const company = await api<ApiCompany>("/companies", {
        method: "POST",
        body: { name: typed },
      });
      onChange(company.id);
      setOpen(false);
      setActive(-1);
    } catch (error) {
      setCreateError(apiMessage(error));
    } finally {
      setCreating(false);
    }
  }

  useLayoutEffect(() => {
    if (!open) return;
    function position() {
      if (!input.current || !field.current) return;
      const anchor = input.current.getBoundingClientRect();
      const bounds = field.current.getBoundingClientRect();
      let top = 8;
      let bottom = window.innerHeight - 8;
      let ancestor = field.current.parentElement;
      while (ancestor) {
        const overflow = getComputedStyle(ancestor).overflowY;
        if (["auto", "scroll", "hidden", "clip"].includes(overflow)) {
          const rect = ancestor.getBoundingClientRect();
          top = Math.max(top, rect.top + 8);
          bottom = Math.min(bottom, rect.bottom - 8);
        }
        ancestor = ancestor.parentElement;
      }
      const below = Math.max(0, bottom - anchor.bottom - 6);
      const above = Math.max(0, anchor.top - top - 6);
      const upward = below < 220 && above > below;
      setPlacement({
        upward,
        maxHeight: Math.min(220, upward ? above : below),
        bottom: bounds.bottom - anchor.top + 6,
      });
    }
    position();
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, true);
    const observer = new ResizeObserver(position);
    if (field.current) observer.observe(field.current);
    const modal = field.current?.closest(".modal");
    if (modal) observer.observe(modal);
    return () => {
      window.removeEventListener("resize", position);
      window.removeEventListener("scroll", position, true);
      observer.disconnect();
    };
  }, [open]);

  function select(company: ApiCompany) {
    onChange(company.id);
    setOpen(false);
    setActive(-1);
  }

  return (
    <div
      ref={field}
      className="company-field"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
          setActive(-1);
        }
      }}
    >
      <label htmlFor={id}>
        {label ?? (required ? "Company" : "Company (optional)")}
      </label>
      <div className="company-combobox">
        <input
          ref={input}
          id={id}
          role="combobox"
          aria-required={required}
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={open ? `${id}-options` : undefined}
          aria-activedescendant={
            open && active >= 0 && options[active]
              ? `${id}-option-${active}`
              : undefined
          }
          autoComplete="off"
          placeholder={placeholder}
          value={open ? query : (selection.data?.name ?? "")}
          onFocus={() => {
            setQuery("");
            setActive(-1);
            setOpen(true);
          }}
          onClick={() => {
            if (!open) {
              setQuery("");
              setOpen(true);
            }
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(-1);
            setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              if (!open) {
                setQuery("");
                setOpen(true);
                setActive(0);
              } else if (options.length)
                setActive((current) =>
                  event.key === "ArrowDown"
                    ? (current + 1) % options.length
                    : current <= 0
                      ? options.length - 1
                      : current - 1,
                );
            } else if (event.key === "Enter" && open) {
              event.preventDefault();
              const match =
                options[active] ??
                options.find(
                  (option) =>
                    option.name.toLowerCase() === query.trim().toLowerCase(),
                );
              if (match) select(match);
            } else if (event.key === "Escape" && open) {
              event.preventDefault();
              event.stopPropagation();
              setOpen(false);
            }
          }}
        />
        {value ? (
          <button
            type="button"
            className="company-clear icon-button"
            aria-label="Clear selected company"
            onClick={() => {
              onChange("");
              setQuery("");
              input.current?.focus();
            }}
          >
            <X size={15} />
          </button>
        ) : (
          <ChevronDown
            size={16}
            className="company-chevron"
            aria-hidden="true"
          />
        )}
      </div>
      {open && (
        <div
          className="company-options"
          style={{
            maxHeight: placement.maxHeight,
            ...(placement.upward
              ? { top: "auto", bottom: placement.bottom }
              : {}),
          }}
          id={`${id}-options`}
          role="listbox"
          aria-label="Companies"
        >
          {options.map((company, index) => (
            <div
              key={company.id}
              id={`${id}-option-${index}`}
              role="option"
              aria-selected={value === company.id}
              className={active === index ? "highlighted" : ""}
              onPointerDown={(event) => event.preventDefault()}
              onClick={() => select(company)}
              ref={(element) => {
                if (active === index)
                  element?.scrollIntoView({ block: "nearest" });
              }}
            >
              <span>{company.name}</span>
              {value === company.id && <Check size={15} />}
            </div>
          ))}
          {canCreate && (
            <button
              type="button"
              className="company-create"
              disabled={creating}
              onPointerDown={(event) => event.preventDefault()}
              onClick={() => void createCompany()}
            >
              <Plus size={15} />
              {creating ? "Adding…" : `Add “${typed}” as a new company`}
            </button>
          )}
          {createError && <p role="alert">{createError}</p>}
          {result.loading && <p role="status">Searching companies…</p>}
          {result.error && <p role="alert">{result.error}</p>}
          {!result.loading && !result.error && !options.length && (
            <p role="status">
              {canCreate
                ? "Not in the list yet."
                : "No companies found. Try another search."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

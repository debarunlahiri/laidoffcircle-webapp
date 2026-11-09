"use client";
import { Check, ChevronDown } from "lucide-react";
import { useId, useRef, useState } from "react";

export type SelectOption = { value: string; label: string };

// A styled single-select that matches the company field: keyboard friendly
// listbox instead of the browser's native dropdown.
export default function SelectField({
  label,
  value,
  options,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  options: SelectOption[];
  placeholder: string;
  onChange: (value: string) => void;
}) {
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const selected = options.find((option) => option.value === value);

  function choose(option: SelectOption) {
    onChange(option.value);
    setOpen(false);
    trigger.current?.focus();
  }
  function move(step: number) {
    setActive((current) => (current + step + options.length) % options.length);
  }

  return (
    <div
      className="company-field"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <label id={`${id}-label`} htmlFor={id}>
        {label}
      </label>
      <div className="company-combobox">
        <button
          ref={trigger}
          id={id}
          type="button"
          className={`select-trigger${selected?.value ? "" : " placeholder"}`}
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? `${id}-options` : undefined}
          aria-labelledby={`${id}-label`}
          aria-activedescendant={
            open && active >= 0 ? `${id}-option-${active}` : undefined
          }
          onClick={() => {
            setActive(
              Math.max(
                0,
                options.findIndex((o) => o.value === value),
              ),
            );
            setOpen((current) => !current);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              if (!open) {
                setActive(
                  Math.max(
                    0,
                    options.findIndex((o) => o.value === value),
                  ),
                );
                setOpen(true);
              } else move(event.key === "ArrowDown" ? 1 : -1);
            } else if ((event.key === "Enter" || event.key === " ") && open) {
              event.preventDefault();
              if (options[active]) choose(options[active]);
            } else if (event.key === "Escape" && open) {
              event.preventDefault();
              event.stopPropagation();
              setOpen(false);
            }
          }}
        >
          {selected?.value ? selected.label : placeholder}
        </button>
        <ChevronDown size={16} className="company-chevron" aria-hidden="true" />
      </div>
      {open && (
        <div
          className="company-options"
          id={`${id}-options`}
          role="listbox"
          aria-labelledby={`${id}-label`}
        >
          {options.map((option, index) => (
            <div
              key={option.value}
              id={`${id}-option-${index}`}
              role="option"
              aria-selected={option.value === value}
              className={active === index ? "highlighted" : ""}
              onPointerDown={(event) => event.preventDefault()}
              onMouseEnter={() => setActive(index)}
              onClick={() => choose(option)}
            >
              <span>{option.label}</span>
              {option.value === value && option.value && <Check size={15} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

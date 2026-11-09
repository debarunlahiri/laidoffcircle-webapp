"use client";
import { maxSkills, skillSuggestions } from "@/lib/skills";
import { Plus, X } from "lucide-react";
import { useId, useMemo, useRef, useState } from "react";

// Chip based picker: choose from the dropdown or type your own and press Enter.
export default function SkillsInput({
  label,
  skills,
  onChange,
}: {
  label: string;
  skills: string[];
  onChange: (skills: string[]) => void;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const taken = useMemo(
    () => new Set(skills.map((skill) => skill.toLowerCase())),
    [skills],
  );
  const term = text.trim();
  const matches = useMemo(() => {
    const lower = term.toLowerCase();
    return skillSuggestions
      .filter(
        (skill) =>
          !taken.has(skill.toLowerCase()) &&
          (!lower || skill.toLowerCase().includes(lower)),
      )
      .sort(
        (a, b) =>
          Number(!a.toLowerCase().startsWith(lower)) -
          Number(!b.toLowerCase().startsWith(lower)),
      )
      .slice(0, 8);
  }, [term, taken]);
  const canCreate =
    term.length > 0 &&
    !taken.has(term.toLowerCase()) &&
    !skillSuggestions.some(
      (skill) => skill.toLowerCase() === term.toLowerCase(),
    );
  const options = [...matches, ...(canCreate ? [term] : [])];
  const full = skills.length >= maxSkills;

  function add(value: string) {
    const clean = value.replace(/[,·]/g, " ").trim().slice(0, 40);
    if (!clean || taken.has(clean.toLowerCase()) || full) return;
    onChange([...skills, clean]);
    setText("");
    setActive(0);
    input.current?.focus();
  }

  return (
    <div
      className="field-label skills-field"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <label htmlFor={id}>
        {label}{" "}
        <span className="optional-mark">
          ({skills.length}/{maxSkills})
        </span>
      </label>
      <div className="skills-box" onClick={() => input.current?.focus()}>
        {skills.map((skill) => (
          <span className="skill-chip" key={skill}>
            {skill}
            <button
              type="button"
              aria-label={`Remove ${skill}`}
              onClick={() => onChange(skills.filter((item) => item !== skill))}
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          ref={input}
          id={id}
          role="combobox"
          aria-expanded={open && options.length > 0}
          aria-controls={`${id}-list`}
          aria-describedby={`${id}-hint`}
          autoComplete="off"
          disabled={full}
          placeholder={
            skills.length ? "Add another…" : "Search or add any skill"
          }
          value={text}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            const value = event.target.value;
            if (value.endsWith(",")) return add(value);
            setText(value);
            setOpen(true);
            setActive(0);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setOpen(true);
              setActive(
                (current) => (current + 1) % Math.max(options.length, 1),
              );
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setActive(
                (current) =>
                  (current - 1 + options.length) % Math.max(options.length, 1),
              );
            } else if (event.key === "Enter") {
              event.preventDefault();
              if (open && options[active]) add(options[active]);
              else add(text);
            } else if (event.key === "Escape") {
              setOpen(false);
            } else if (event.key === "Backspace" && !text && skills.length) {
              onChange(skills.slice(0, -1));
            }
          }}
        />
      </div>
      <small id={`${id}-hint`} className="subtle-text">
        Skills from any profession are welcome. Choose a suggestion or type your
        own and press Enter.
      </small>
      {open && options.length > 0 && (
        <ul className="skills-list" id={`${id}-list`} role="listbox">
          {options.map((option, index) => (
            <li
              key={option}
              role="option"
              aria-selected={index === active}
              className={index === active ? "active" : ""}
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setActive(index)}
              onClick={() => add(option)}
            >
              {canCreate && option === term ? (
                <>
                  <Plus size={13} /> Add “{option}”
                </>
              ) : (
                option
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

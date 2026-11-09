"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

export default function PillTabs<Key extends string>({
  label,
  items,
  active,
  onChange,
}: {
  label: string;
  items: readonly {
    key: Key;
    label: string;
    icon?: ReactNode;
    disabled?: boolean;
  }[];
  active: Key;
  onChange: (key: Key) => void;
}) {
  const strip = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ previous: false, next: false });

  function updateEdges() {
    const element = strip.current;
    if (!element) return;
    setEdges({
      previous: element.scrollLeft > 1,
      next: element.scrollLeft + element.clientWidth < element.scrollWidth - 1,
    });
  }

  useEffect(() => {
    const element = strip.current;
    if (!element) return;
    const observer = new ResizeObserver(updateEdges);
    observer.observe(element);
    for (const button of element.children) observer.observe(button);
    updateEdges();
    return () => observer.disconnect();
  }, [items]);

  useEffect(() => {
    const element = strip.current;
    const selected = element?.querySelector<HTMLButtonElement>(
      '[aria-pressed="true"]',
    );
    if (!element || !selected) return;
    const container = element.getBoundingClientRect();
    const button = selected.getBoundingClientRect();
    if (button.left < container.left || button.right > container.right) {
      element.scrollLeft +=
        button.left - container.left - (container.width - button.width) / 2;
    }
    updateEdges();
  }, [active]);

  function scroll(direction: number) {
    const element = strip.current;
    if (!element) return;
    element.scrollBy({
      left: direction * element.clientWidth * 0.75,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }

  return (
    <div
      className="pill-tabs-navigation"
      role="group"
      aria-label={label}
      data-overflow={edges.previous || edges.next}
    >
      <button
        type="button"
        className="pill-tabs-arrow"
        aria-label={`Scroll ${label.toLowerCase()} left`}
        disabled={!edges.previous}
        onClick={() => scroll(-1)}
      >
        <ChevronLeft size={18} />
      </button>
      <div ref={strip} className="pill-tabs-strip" onScroll={updateEdges}>
        {items.map(({ key, label: itemLabel, icon, disabled }) => (
          <button
            key={key}
            type="button"
            className="pill-tab"
            aria-pressed={active === key}
            disabled={disabled}
            onClick={() => onChange(key)}
          >
            {icon}
            {itemLabel}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="pill-tabs-arrow"
        aria-label={`Scroll ${label.toLowerCase()} right`}
        disabled={!edges.next}
        onClick={() => scroll(1)}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

"use client";
import PillTabs from "@/components/ui/pill-tabs";
import RichText from "@/components/ui/rich-text";
import {
  Bold,
  Code,
  FileCode2,
  Heading2,
  Italic,
  Link2,
  List,
  ListChecks,
  ListOrdered,
  Minus,
  Quote,
  Strikethrough,
  Table2,
  type LucideIcon,
} from "lucide-react";
import {
  type ClipboardEventHandler,
  type KeyboardEventHandler,
  useRef,
  useState,
} from "react";

type Edit = { value: string; start: number; end: number };

const tableTemplate =
  "| Column 1 | Column 2 | Column 3 |\n| --- | --- | --- |\n| Cell | Cell | Cell |\n| Cell | Cell | Cell |";

/** Wraps the selection in markers; wrapping already-wrapped text removes them. */
function wrap(
  { value, start, end }: Edit,
  before: string,
  after: string,
  placeholder: string,
): Edit {
  const selected = value.slice(start, end);
  if (
    selected &&
    value.slice(start - before.length, start) === before &&
    value.slice(end, end + after.length) === after
  )
    return {
      value:
        value.slice(0, start - before.length) +
        selected +
        value.slice(end + after.length),
      start: start - before.length,
      end: end - before.length,
    };
  const inner = selected || placeholder;
  const next =
    value.slice(0, start) + before + inner + after + value.slice(end);
  return {
    value: next,
    start: start + before.length,
    end: start + before.length + inner.length,
  };
}

/** Adds (or, if every line already has it, removes) a prefix on each selected line. */
function prefixLines(
  { value, start, end }: Edit,
  prefix: (index: number) => string,
  matches: RegExp,
): Edit {
  const from = value.lastIndexOf("\n", start - 1) + 1;
  const nl = value.indexOf("\n", end);
  const to = nl === -1 ? value.length : nl;
  const lines = value.slice(from, to).split("\n");
  const all = lines.every((line) => matches.test(line));
  const changed = lines
    .map((line, i) =>
      all ? line.replace(matches, "") : prefix(i) + line.replace(matches, ""),
    )
    .join("\n");
  return {
    value: value.slice(0, from) + changed + value.slice(to),
    start: from,
    end: from + changed.length,
  };
}

/** Inserts a block on its own lines, replacing the selection. */
function block({ value, start, end }: Edit, text: string): Edit {
  const lead =
    start > 0 && value[start - 1] !== "\n"
      ? "\n\n"
      : start > 0 && value[start - 2] !== "\n"
        ? "\n"
        : "";
  const tail =
    value[end] === undefined ? "\n" : value[end] === "\n" ? "" : "\n\n";
  const next = value.slice(0, start) + lead + text + tail + value.slice(end);
  const at = start + lead.length;
  return { value: next, start: at, end: at + text.length };
}

type Tool = {
  key: string;
  label: string;
  hint?: string;
  icon: LucideIcon;
  run: (edit: Edit) => Edit;
};

const tools: (Tool | "|")[] = [
  {
    key: "heading",
    label: "Heading",
    icon: Heading2,
    run: (e) => prefixLines(e, () => "## ", /^#{1,6}\s+/),
  },
  {
    key: "bold",
    label: "Bold",
    hint: "Ctrl/⌘ B",
    icon: Bold,
    run: (e) => wrap(e, "**", "**", "bold text"),
  },
  {
    key: "italic",
    label: "Italic",
    hint: "Ctrl/⌘ I",
    icon: Italic,
    run: (e) => wrap(e, "_", "_", "italic text"),
  },
  {
    key: "strike",
    label: "Strikethrough",
    icon: Strikethrough,
    run: (e) => wrap(e, "~~", "~~", "text"),
  },
  "|",
  {
    key: "quote",
    label: "Quote",
    icon: Quote,
    run: (e) => prefixLines(e, () => "> ", /^>\s?/),
  },
  {
    key: "code",
    label: "Inline code",
    icon: Code,
    run: (e) => wrap(e, "`", "`", "code"),
  },
  {
    key: "codeblock",
    label: "Code block",
    icon: FileCode2,
    run: (e) => {
      const selected = e.value.slice(e.start, e.end) || "code";
      const out = block(e, "```\n" + selected + "\n```");
      return {
        ...out,
        start: out.start + 4,
        end: out.start + 4 + selected.length,
      };
    },
  },
  {
    key: "link",
    label: "Link",
    hint: "Ctrl/⌘ K",
    icon: Link2,
    run: (e) => {
      const selected = e.value.slice(e.start, e.end) || "link text";
      const next =
        e.value.slice(0, e.start) +
        `[${selected}](https://)` +
        e.value.slice(e.end);
      const urlStart = e.start + selected.length + 3;
      return { value: next, start: urlStart, end: urlStart + 8 };
    },
  },
  "|",
  {
    key: "ul",
    label: "Bulleted list",
    icon: List,
    run: (e) => prefixLines(e, () => "- ", /^[-*]\s+(?!\[[ x]\])/),
  },
  {
    key: "ol",
    label: "Numbered list",
    icon: ListOrdered,
    run: (e) => prefixLines(e, (i) => `${i + 1}. `, /^\d+\.\s+/),
  },
  {
    key: "task",
    label: "Task list",
    icon: ListChecks,
    run: (e) => prefixLines(e, () => "- [ ] ", /^[-*]\s+\[[ x]\]\s+/),
  },
  "|",
  {
    key: "table",
    label: "Table",
    icon: Table2,
    run: (e) => block(e, tableTemplate),
  },
  {
    key: "rule",
    label: "Divider",
    icon: Minus,
    run: (e) => block({ ...e, end: e.start }, "---"),
  },
];

const shortcuts: Record<string, string> = { b: "bold", i: "italic", k: "link" };

/**
 * A textarea with a Markdown toolbar (headings, bold, lists, tables, links…)
 * and a Write / Preview switch that renders exactly what the post will show.
 */
export default function MarkdownEditor({
  value,
  onChange,
  placeholder,
  maxLength,
  autoFocus,
  ariaLabel,
  rows = 8,
  onPaste,
  onKeyDown,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  autoFocus?: boolean;
  ariaLabel?: string;
  rows?: number;
  onPaste?: ClipboardEventHandler<HTMLTextAreaElement>;
  onKeyDown?: KeyboardEventHandler<HTMLTextAreaElement>;
}) {
  const field = useRef<HTMLTextAreaElement>(null);
  const [mode, setMode] = useState<"write" | "preview">("write");

  function apply(key: string) {
    const area = field.current;
    const tool = tools.find((t): t is Tool => t !== "|" && t.key === key);
    if (!area || !tool) return;
    const result = tool.run({
      value,
      start: area.selectionStart,
      end: area.selectionEnd,
    });
    if (maxLength && result.value.length > maxLength) return;
    onChange(result.value);
    requestAnimationFrame(() => {
      area.focus();
      area.setSelectionRange(result.start, result.end);
    });
  }

  return (
    <div className="md-editor">
      <div className="md-bar" role="toolbar" aria-label="Formatting">
        <div className="md-tools">
          {tools.map((tool, index) =>
            tool === "|" ? (
              <i key={index} className="md-sep" aria-hidden="true" />
            ) : (
              <button
                key={tool.key}
                type="button"
                className="md-tool"
                title={tool.hint ? `${tool.label} (${tool.hint})` : tool.label}
                aria-label={tool.label}
                disabled={mode === "preview"}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => apply(tool.key)}
              >
                <tool.icon size={16} />
              </button>
            ),
          )}
        </div>
        <PillTabs
          label="Editor mode"
          items={[
            { key: "write", label: "Write" },
            { key: "preview", label: "Preview" },
          ]}
          active={mode}
          onChange={setMode}
        />
      </div>
      {mode === "write" ? (
        <textarea
          ref={field}
          className="md-textarea"
          aria-label={ariaLabel}
          autoFocus={autoFocus}
          rows={rows}
          maxLength={maxLength}
          placeholder={placeholder}
          value={value}
          onPaste={onPaste}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (event.defaultPrevented) return;
            if ((event.metaKey || event.ctrlKey) && !event.altKey) {
              const key = shortcuts[event.key.toLowerCase()];
              if (key) {
                event.preventDefault();
                apply(key);
              }
            }
          }}
        />
      ) : (
        <div className="md-preview post-copy">
          {value.trim() ? (
            <RichText text={value} />
          ) : (
            <p className="md-empty">Nothing to preview yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

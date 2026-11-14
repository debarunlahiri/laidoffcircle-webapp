"use client";
import BottomSheet from "@/components/ui/bottom-sheet";
import { useApiResource } from "@/hooks/use-api-resource";
import { api, apiMessage, displayDate } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import { useConfirm } from "@/providers/confirm-provider";
import { usePlatform } from "@/providers/platform-provider";
import { Check, Copy, KeyRound, LoaderCircle, Plus } from "lucide-react";
import { notFound } from "next/navigation";
import { useState } from "react";

type Key = {
  id: string;
  name: string;
  hint: string;
  account: string;
  writesPerHour: number;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
};
type Created = {
  account: string;
  accountName: string;
  writesPerHour: number;
  apiKey: string;
};
const DEFAULT_ACCOUNT = "news@laidoffcircle.com";

// Admin-only page (mobile first): list, create and revoke agent API keys.
export default function AgentKeysView() {
  const { user, loading: authLoading } = useAuth();
  const confirm = useConfirm();
  const { notify } = usePlatform();
  const keys = useApiResource<{ items: Key[] }>(
    user?.isAdmin ? "/admin/agent-keys" : null,
    { items: [] },
  );
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [account, setAccount] = useState(DEFAULT_ACCOUNT);
  const [writes, setWrites] = useState("60");
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<Created | null>(null);
  const [copied, setCopied] = useState(false);

  if (authLoading)
    return (
      <div className="agent-keys-loading" role="status">
        <LoaderCircle className="auth-spinner" size={24} />
      </div>
    );
  if (!user?.isAdmin) notFound();

  function closeForm() {
    setCreating(false);
    setName("");
    setAccount(DEFAULT_ACCOUNT);
    setWrites("60");
    setFormError("");
  }
  async function create(event: React.FormEvent) {
    event.preventDefault();
    const n = Number(writes);
    if (!name.trim()) return setFormError("Give the key a name.");
    if (!Number.isInteger(n) || n < 1 || n > 1000)
      return setFormError(
        "Writes per hour must be a whole number from 1 to 1000.",
      );
    setBusy(true);
    try {
      const result = await api<Created>("/admin/agent-keys", {
        method: "POST",
        body: { name: name.trim(), account: account.trim(), writesPerHour: n },
      });
      closeForm();
      setCreated(result);
      void keys.reload();
    } catch (e) {
      setFormError(apiMessage(e));
    } finally {
      setBusy(false);
    }
  }
  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      notify("Could not copy. Press and hold the key to copy it.");
    }
  }
  async function revoke(k: Key) {
    if (
      !(await confirm({
        title: `Revoke "${k.name}"?`,
        message:
          "Any agent using this key stops working on its next request. This cannot be undone.",
        confirmLabel: "Revoke",
        tone: "danger",
      }))
    )
      return;
    try {
      await api(`/admin/agent-keys/${k.id}/revoke`, {
        method: "POST",
        body: {},
      });
      notify(`Key "${k.name}" revoked.`);
      void keys.reload();
    } catch (e) {
      notify(apiMessage(e));
    }
  }

  return (
    <div className="agent-keys">
      <header className="agent-keys-head">
        <div>
          <h1>Agent API keys</h1>
          <p>
            Let trusted AI agents publish layoff updates. Each key posts as one
            member account.
          </p>
        </div>
        <button
          type="button"
          className="primary"
          onClick={() => setCreating(true)}
        >
          <Plus size={16} aria-hidden="true" /> New key
        </button>
      </header>

      {keys.error && (
        <p className="auth-error" role="alert">
          {keys.error}
        </p>
      )}
      {keys.loading && !keys.data.items.length ? (
        <div className="agent-keys-loading" role="status">
          <LoaderCircle className="auth-spinner" size={24} />
        </div>
      ) : keys.data.items.length === 0 && !keys.error ? (
        <div className="card agent-key-empty">
          <KeyRound size={26} aria-hidden="true" />
          <strong>No agent keys yet</strong>
          <span>Create one to let an agent publish as LaidOff News.</span>
        </div>
      ) : (
        <ul className="agent-key-list">
          {keys.data.items.map((k) => (
            <li
              key={k.id}
              className={`card agent-key${k.revokedAt ? " is-revoked" : ""}`}
            >
              <div className="agent-key-top">
                <strong>{k.name}</strong>
                <span
                  className={`agent-key-status${k.revokedAt ? " off" : " on"}`}
                >
                  {k.revokedAt ? "Revoked" : "Active"}
                </span>
              </div>
              <dl>
                <div>
                  <dt>Key</dt>
                  <dd>
                    <code>{k.hint}…</code>
                  </dd>
                </div>
                <div>
                  <dt>Posts as</dt>
                  <dd>{k.account}</dd>
                </div>
                <div>
                  <dt>Limit</dt>
                  <dd>{k.writesPerHour} per hour</dd>
                </div>
                <div>
                  <dt>Last used</dt>
                  <dd>{k.lastUsedAt ? displayDate(k.lastUsedAt) : "Never"}</dd>
                </div>
              </dl>
              {!k.revokedAt && (
                <button
                  type="button"
                  className="danger-button agent-key-revoke"
                  onClick={() => void revoke(k)}
                >
                  Revoke key
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {creating && (
        <BottomSheet title="New agent API key" onClose={closeForm}>
          <form className="pw-form" onSubmit={create}>
            <p className="subtle-text">
              The key is shown once after you create it.
            </p>
            <label>
              Name
              <input
                autoFocus
                maxLength={80}
                placeholder="e.g. grok"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setFormError("");
                }}
              />
            </label>
            <label>
              Posts as (member email)
              <input
                type="email"
                autoCapitalize="none"
                value={account}
                onChange={(e) => {
                  setAccount(e.target.value);
                  setFormError("");
                }}
              />
            </label>
            <label>
              Writes per hour
              <input
                inputMode="numeric"
                value={writes}
                onChange={(e) => {
                  setWrites(e.target.value);
                  setFormError("");
                }}
              />
            </label>
            {formError && (
              <p className="auth-error" role="alert">
                {formError}
              </p>
            )}
            <div className="pw-form-actions">
              <button type="button" className="secondary" onClick={closeForm}>
                Cancel
              </button>
              <button
                type="submit"
                className="primary"
                disabled={busy || !name.trim()}
              >
                {busy ? "Creating…" : "Create key"}
              </button>
            </div>
          </form>
        </BottomSheet>
      )}

      {created && (
        <BottomSheet title="Copy your API key" onClose={() => setCreated(null)}>
          <p className="subtle-text">
            This is the only time it is shown. It posts as{" "}
            <strong>{created.accountName}</strong> ({created.account}), up to{" "}
            {created.writesPerHour} writes per hour.
          </p>
          <code className="agent-key-secret">{created.apiKey}</code>
          <div className="pw-form-actions">
            <button
              type="button"
              className="secondary"
              onClick={() => void copy(created.apiKey)}
            >
              {copied ? (
                <Check size={16} aria-hidden="true" />
              ) : (
                <Copy size={16} aria-hidden="true" />
              )}{" "}
              {copied ? "Copied" : "Copy key"}
            </button>
            <button
              type="button"
              className="primary"
              onClick={() => setCreated(null)}
            >
              I have saved it
            </button>
          </div>
        </BottomSheet>
      )}
    </div>
  );
}

"use client";

import UsernameInput from "@/components/ui/username-input";
import type { ProfileEditField } from "@/components/profile/profile-card";
import Dialog from "@/components/ui/dialog";
import LocationAutocomplete from "@/components/ui/location-autocomplete";
import { apiMessage } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import { usePlatform } from "@/providers/platform-provider";
import { Save, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function ProfileEditDialog({
  onClose,
  initialField = "name",
  presentation = "dialog",
}: {
  onClose: () => void;
  initialField?: ProfileEditField;
  presentation?: "dialog" | "page";
}) {
  const { user, updateProfile } = useAuth();
  const { notify } = usePlatform();
  const [name, setName] = useState(user?.name ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [usernameValid, setUsernameValid] = useState(true);
  const [role, setRole] = useState(user?.role ?? "");
  const [location, setLocation] = useState(user?.location ?? "");
  const [about, setAbout] = useState(user?.about ?? "");
  const [skills, setSkills] = useState((user?.skills ?? []).join(", "));
  const [nextChapter, setNextChapter] = useState(user?.nextChapter ?? "");
  const [openToWork, setOpenToWork] = useState(Boolean(user?.openToWork));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (presentation === "page") return;
    const frame = requestAnimationFrame(() => {
      const field = formRef.current?.querySelector<HTMLElement>(
        `[name="${initialField}"]`,
      );
      field?.focus();
      field?.scrollIntoView({ block: "nearest" });
    });
    return () => cancelAnimationFrame(frame);
  }, [initialField, presentation]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (saving || !name.trim() || !usernameValid) return;
    setSaving(true);
    setError("");
    try {
      await updateProfile({
        name: name.trim(),
        username: username.trim().replace(/^@/, "").toLowerCase(),
        role: role.trim(),
        location: location.trim(),
        about,
        nextChapter,
        openToWork,
        skills: [
          ...new Set(
            skills
              .split(",")
              .map((skill) => skill.trim())
              .filter(Boolean),
          ),
        ],
      });
      notify("Profile updated.");
      onClose();
    } catch (err) {
      setError(apiMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const content = (
    <>
      {presentation === "dialog" && (
        <div className="modal-heading">
          <h2>Edit profile</h2>
          <button
            className="icon-button"
            aria-label="Close profile form"
            onClick={onClose}
            disabled={saving}
          >
            <X size={21} />
          </button>
        </div>
      )}
      <p className="pf-editor-intro">
        A little about you can start a meaningful connection.
      </p>
      <form
        ref={formRef}
        className="referral-create-form pf-edit-form"
        onSubmit={submit}
      >
        <fieldset disabled={saving}>
          <legend>The essentials</legend>
          <label className="field-label">
            Name
            <input
              required
              maxLength={100}
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <UsernameInput
            id="profile-username"
            name="username"
            value={username}
            onChange={setUsername}
            current={user?.username}
            onValidity={setUsernameValid}
          />
          <label className="field-label">
            Professional headline
            <input
              maxLength={160}
              placeholder="e.g. Teacher, Electrician, or Sales Manager"
              name="role"
              value={role}
              onChange={(event) => setRole(event.target.value)}
            />
          </label>
          <LocationAutocomplete
            label="Location"
            name="location"
            value={location}
            onChange={setLocation}
          />
        </fieldset>
        <fieldset disabled={saving}>
          <legend>Your story & strengths</legend>
          <label className="field-label">
            About
            <textarea
              maxLength={5000}
              rows={5}
              placeholder="Your experience, what you care about, and what makes you, you."
              name="about"
              value={about}
              onChange={(event) => setAbout(event.target.value)}
            />
          </label>
          <label className="field-label">
            Skills (comma separated)
            <input
              placeholder="e.g. Patient care, Bookkeeping, Customer service"
              name="skills"
              value={skills}
              onChange={(event) => setSkills(event.target.value)}
            />
          </label>
        </fieldset>
        <fieldset disabled={saving}>
          <legend>What’s next</legend>
          <label className="field-label">
            My next chapter
            <textarea
              maxLength={3000}
              rows={4}
              placeholder="What would you love to do next? Share the roles or connections you’re looking for."
              name="nextChapter"
              value={nextChapter}
              onChange={(event) => setNextChapter(event.target.value)}
            />
          </label>
          <label className="field-label">
            <span>
              <input
                type="checkbox"
                name="openToWork"
                checked={openToWork}
                onChange={(event) => setOpenToWork(event.target.checked)}
              />{" "}
              Open to work
            </span>
          </label>
        </fieldset>
        {error && (
          <p className="pf-form-error" role="alert">
            {error}
          </p>
        )}
        <div className="modal-bottom">
          <button
            type="button"
            className="secondary"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className="primary"
            disabled={!name.trim() || !usernameValid || saving}
          >
            <Save size={16} />
            {saving ? "Saving…" : "Save profile"}
          </button>
        </div>
      </form>
    </>
  );

  if (presentation === "page")
    return <section className="pf-edit-page">{content}</section>;
  return (
    <Dialog
      label="Edit profile"
      onClose={saving ? () => {} : onClose}
      className="pf-edit-dialog"
    >
      {content}
    </Dialog>
  );
}

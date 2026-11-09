import VerifiedBadge from "@/components/ui/verified-badge";
import Avatar from "@/components/ui/avatar";
import { mediaUrl } from "@/lib/api";
import { userInitials } from "@/providers/auth-provider";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  Circle,
  ExternalLink,
  MapPin,
  Pencil,
  Plus,
  Sparkles,
  UserRound,
  Wrench,
} from "lucide-react";
import type { ReactNode } from "react";

export type ProfileData = {
  name: string;
  username?: string | null;
  badge?: "blue" | "gold" | null;
  role?: string | null;
  location?: string | null;
  about?: string | null;
  skills?: string[] | null;
  nextChapter?: string | null;
  openToWork?: boolean;
  profileImageUrl?: string | null;
  coverImageUrl?: string | null;
  websiteUrl?: string | null;
  linkedinProfileUrl?: string | null;
};

export type ProfileEditField =
  | "name"
  | "username"
  | "role"
  | "location"
  | "about"
  | "skills"
  | "nextChapter"
  | "openToWork";

// Presentational profile layout shared by "my profile" and member profiles.
export default function ProfileCard({
  profile,
  subtitle,
  actions,
  coverControls,
  avatarControls,
  children,
  onEdit,
}: {
  profile: ProfileData;
  subtitle?: string;
  actions?: ReactNode;
  // Edit controls for the owner; omitted on other members' profiles.
  coverControls?: ReactNode;
  avatarControls?: ReactNode;
  children?: ReactNode;
  onEdit?: (field: ProfileEditField) => void;
}) {
  const links = [
    { label: "Website", href: profile.websiteUrl },
    { label: "LinkedIn", href: profile.linkedinProfileUrl },
  ].filter((link) => link.href);
  const steps: { label: string; done: boolean; field: ProfileEditField }[] = [
    {
      label: "Add your professional headline",
      done: Boolean(profile.role?.trim()),
      field: "role",
    },
    {
      label: "Tell your story",
      done: Boolean(profile.about?.trim()),
      field: "about",
    },
    {
      label: "Showcase your skills",
      done: Boolean(profile.skills?.length),
      field: "skills",
    },
    {
      label: "Share your next chapter",
      done: Boolean(profile.nextChapter?.trim()),
      field: "nextChapter",
    },
    {
      label: "Add your location",
      done: Boolean(profile.location?.trim()),
      field: "location",
    },
  ];
  const completed = steps.filter((step) => step.done).length;
  const progress = Math.round((completed / steps.length) * 100);
  function editButton(field: ProfileEditField, label: string, empty: boolean) {
    if (!onEdit) return null;
    return (
      <button
        type="button"
        className="pf-section-edit"
        onClick={() => onEdit(field)}
        aria-label={label}
      >
        {empty ? (
          <Plus size={16} aria-hidden="true" />
        ) : (
          <Pencil size={15} aria-hidden="true" />
        )}
        <span>{empty ? "Add" : "Edit"}</span>
      </button>
    );
  }
  return (
    <div className="pf-layout">
      <article className="pf card">
        <div
          className={`pf-cover${profile.coverImageUrl ? " has-image" : ""}`}
          style={
            profile.coverImageUrl
              ? { backgroundImage: `url(${mediaUrl(profile.coverImageUrl)})` }
              : undefined
          }
        >
          {!profile.coverImageUrl && (
            <div className="pf-cover-caption">
              <span>YOUR STORY. YOUR NEXT CHAPTER.</span>
              <span>A little possibility goes a long way.</span>
            </div>
          )}
          {coverControls}
        </div>
        <div className="pf-head">
          <div className="pf-avatar profile-avatar-wrap">
            <Avatar
              initials={userInitials(profile.name || "Member")}
              src={profile.profileImageUrl}
            />
            {avatarControls}
          </div>
          <div className="pf-identity-row">
            <div className="pf-title">
              <h2>
                {profile.name}
                <VerifiedBadge type={profile.badge} size={22} />
              </h2>
              {profile.username && (
                <p className="pf-username">@{profile.username}</p>
              )}
              {profile.role ? (
                <p className="pf-role">{profile.role}</p>
              ) : onEdit ? (
                <button
                  type="button"
                  className="pf-add-headline"
                  onClick={() => onEdit("role")}
                >
                  <Plus size={14} /> Add a professional headline
                </button>
              ) : (
                subtitle && <p className="pf-role">{subtitle}</p>
              )}
              <div className="pf-meta">
                {profile.location && (
                  <span className="pf-location">
                    <MapPin size={14} aria-hidden="true" />
                    {profile.location}
                  </span>
                )}
                {links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href!}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="pf-meta-link"
                  >
                    <ExternalLink size={13} aria-hidden="true" />
                    {link.label}
                  </a>
                ))}
                {onEdit && (
                  <span className="pf-location">
                    <UserRound size={14} aria-hidden="true" />
                    Community member
                  </span>
                )}
              </div>
            </div>
            {actions && <div className="pf-actions">{actions}</div>}
          </div>
          {profile.openToWork && (
            <span className="pf-open">
              <i aria-hidden="true" />
              Open to work
            </span>
          )}
        </div>
      </article>
      <div className="pf-details">
        <div className="pf-main-details">
          <section
            className="pf-detail-card card pf-chapter"
            aria-labelledby="pf-chapter-title"
          >
            <div className="pf-section-heading">
              <h3 id="pf-chapter-title">
                <span className="pf-section-icon">
                  <Sparkles size={18} aria-hidden="true" />
                </span>
                My next chapter
              </h3>
              {editButton(
                "nextChapter",
                "Edit your next chapter",
                !profile.nextChapter,
              )}
            </div>
            {profile.nextChapter ? (
              <p className="pf-prose">{profile.nextChapter}</p>
            ) : (
              <div className="pf-placeholder">
                <p>
                  {onEdit
                    ? "What does your next chapter look like?"
                    : "A new chapter is still taking shape."}
                </p>
                <span>
                  {onEdit
                    ? "Share the roles, opportunities, or connections you’re looking for."
                    : "This member hasn’t shared their plans yet."}
                </span>
                {onEdit && (
                  <button
                    type="button"
                    className="pf-text-action"
                    onClick={() => onEdit("nextChapter")}
                  >
                    Share what’s next <ArrowUpRight size={15} />
                  </button>
                )}
              </div>
            )}
          </section>
          <section
            className="pf-detail-card card"
            aria-labelledby="pf-about-title"
          >
            <div className="pf-section-heading">
              <h3 id="pf-about-title">
                <span className="pf-section-icon">
                  <UserRound size={18} aria-hidden="true" />
                </span>
                About me
              </h3>
              {editButton("about", "Edit your story", !profile.about)}
            </div>
            {profile.about ? (
              <p className="pf-prose">{profile.about}</p>
            ) : (
              <div className="pf-placeholder">
                <p>
                  {onEdit
                    ? "There’s more to you than a job title."
                    : "Their story is on its way."}
                </p>
                <span>
                  {onEdit
                    ? "Introduce yourself, your experience, and what matters to you."
                    : "This member hasn’t added an introduction yet."}
                </span>
                {onEdit && (
                  <button
                    type="button"
                    className="pf-text-action"
                    onClick={() => onEdit("about")}
                  >
                    Tell your story <ArrowUpRight size={15} />
                  </button>
                )}
              </div>
            )}
          </section>
          <section
            className="pf-detail-card card"
            aria-labelledby="pf-skills-title"
          >
            <div className="pf-section-heading">
              <h3 id="pf-skills-title">
                <span className="pf-section-icon">
                  <Wrench size={18} aria-hidden="true" />
                </span>
                Skills & expertise{" "}
                {Boolean(profile.skills?.length) && (
                  <span className="pf-count">{profile.skills!.length}</span>
                )}
              </h3>
              {editButton(
                "skills",
                "Edit your skills",
                !profile.skills?.length,
              )}
            </div>
            {profile.skills?.length ? (
              <div className="pf-skills">
                {profile.skills.map((skill) => (
                  <span key={skill} className="pf-skill">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <div className="pf-placeholder">
                <p>
                  {onEdit
                    ? "Put your strengths in the spotlight."
                    : "Skills haven’t been added yet."}
                </p>
                <span>
                  {onEdit
                    ? "Add the tools, skills, and expertise you bring to the table."
                    : "Check back to learn more about their expertise."}
                </span>
                {onEdit && (
                  <button
                    type="button"
                    className="pf-text-action"
                    onClick={() => onEdit("skills")}
                  >
                    Add your skills <Plus size={15} />
                  </button>
                )}
              </div>
            )}
          </section>
        </div>
        {onEdit && (
          <aside className="pf-sidebar" aria-label="Profile tools">
            <section className="pf-completion card">
              <div className="pf-completion-top">
                <span className="pf-eyebrow">MAKE YOURSELF KNOWN</span>
                <Sparkles size={17} aria-hidden="true" />
              </div>
              <h3>
                {progress === 100
                  ? "Looking good!"
                  : "Bring your profile to life"}
              </h3>
              <p>
                {progress === 100
                  ? "Your story is ready for the community."
                  : "Help the right people get to know you."}
              </p>
              <div className="pf-progress-label">
                <strong>{progress}% complete</strong>
                <span>
                  {completed} of {steps.length}
                </span>
              </div>
              <progress
                value={completed}
                max={steps.length}
                aria-label="Profile completeness"
              />
              <div className="pf-checklist">
                {steps.map((step) => (
                  <button
                    type="button"
                    key={step.field}
                    className={step.done ? "is-complete" : ""}
                    onClick={() => onEdit(step.field)}
                    aria-label={`${step.label}${step.done ? ", completed. Edit" : ""}`}
                  >
                    {step.done ? (
                      <Check size={16} aria-hidden="true" />
                    ) : (
                      <Circle size={16} aria-hidden="true" />
                    )}
                    <span>{step.label}</span>
                    <ChevronRight size={14} aria-hidden="true" />
                  </button>
                ))}
              </div>
            </section>
            <section className="pf-opportunity card">
              <span className="pf-section-icon">
                <BriefcaseBusiness size={20} aria-hidden="true" />
              </span>
              <h3>Your next opportunity</h3>
              <p>
                {profile.openToWork
                  ? "Your profile lets the community know you’re open to work."
                  : "Let the community know when you’re ready for something new."}
              </p>
              <button
                type="button"
                className="secondary"
                onClick={() => onEdit("openToWork")}
              >
                {profile.openToWork
                  ? "Manage availability"
                  : "Set your availability"}
                <ArrowUpRight size={15} aria-hidden="true" />
              </button>
            </section>
          </aside>
        )}
      </div>
      {children}
    </div>
  );
}

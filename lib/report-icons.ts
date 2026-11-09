import {
  Ban, Bug, CircleHelp, Copyright, EyeOff, FileWarning, Flag, Gavel, HeartCrack,
  Info, Link2, Lock, Megaphone, MessageSquareWarning, Newspaper, OctagonAlert,
  Scale, ShieldAlert, Siren, Skull, Swords, ThumbsDown, TriangleAlert, UserX,
  type LucideIcon,
} from "lucide-react";

/** Icons an admin can attach to a report reason (stored by name). */
export const REPORT_ICONS: Record<string, LucideIcon> = {
  flag: Flag, "shield-alert": ShieldAlert, "triangle-alert": TriangleAlert,
  "octagon-alert": OctagonAlert, ban: Ban, siren: Siren, "eye-off": EyeOff,
  "user-x": UserX, "message-warning": MessageSquareWarning, megaphone: Megaphone,
  "file-warning": FileWarning, lock: Lock, "heart-crack": HeartCrack,
  copyright: Copyright, "circle-help": CircleHelp, info: Info, swords: Swords,
  "thumbs-down": ThumbsDown, link: Link2, skull: Skull, newspaper: Newspaper,
  scale: Scale, gavel: Gavel, bug: Bug,
};
/** Unknown or empty names (including old emoji values) fall back to a flag. */
export const reportIcon = (name?: string): LucideIcon => REPORT_ICONS[name ?? ""] ?? Flag;

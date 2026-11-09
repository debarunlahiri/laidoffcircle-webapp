"use client";
import { sectionPaths } from "@/config/navigation";
import { pageHeadings } from "@/config/page-headings";
import { usePlatform } from "@/providers/platform-provider";
import { Plus } from "lucide-react";
import { usePathname } from "next/navigation";

export default function PageHeading() {
  const { section, openReferralForm } = usePlatform();
  const pathname = usePathname();
  if (pathname === "/bookmarks") return null;
  if (pathname === "/search") return null;
  if (pathname === "/settings" || pathname.startsWith("/settings/"))
    return null;
  if (pathname === "/support" || pathname.startsWith("/support/")) return null;
  if (pathname === "/referrals/new")
    return (
      <div className="page-heading">
        <div>
          <h1>Add a referral</h1>
          <p>Offer to refer someone and choose what they share with you.</p>
        </div>
      </div>
    );

  if (pathname.startsWith("/referrals/")) return null;

  if (pathname === "/notifications")
    return (
      <div className="page-heading">
        <div>
          <h1>Notifications</h1>
          <p>
            Messages, comments, connections and referral updates in one place.
          </p>
        </div>
      </div>
    );

  // Only the main pages get the big heading. Detail pages (a single post, a
  // post page opened from search, etc.) have their own back link and title, and
  // would otherwise fall back to the Home heading.
  const mainPage =
    Object.values(sectionPaths).includes(pathname) ||
    pathname.startsWith("/search") ||
    pathname.startsWith("/users/");
  if (!mainPage) return null;

  return (
    <div className="page-heading">
      <div>
        <h1>{pageHeadings[section]}</h1>
        <p>
          {section === "Profile"
            ? "Your story, skills, and next chapter."
            : section === "Search"
              ? "People, posts, referrals and companies across the community."
              : section === "Member profile"
                ? "Their story, skills, and next chapter."
                : section === "Home"
                  ? "Share your story, find your people, and discover what’s next."
                  : "Across companies, industries, and chapters. You belong here."}
        </p>
      </div>
      {section === "Referrals" && (
        <button
          type="button"
          className="primary heading-add-post"
          onClick={() => openReferralForm()}
        >
          <Plus size={18} />
          Add referrals
        </button>
      )}
    </div>
  );
}

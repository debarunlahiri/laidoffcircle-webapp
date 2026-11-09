import AccountSettings from "@/components/settings/account-settings";
import AppearanceSettings from "@/components/settings/appearance-settings";
import HelpSettings from "@/components/settings/help-settings";
import PrivacySettingsView from "@/components/settings/privacy-settings";
import { notFound } from "next/navigation";

export default async function SettingsSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  switch ((await params).section) {
    case "account":
      return <AccountSettings />;
    case "privacy":
      return <PrivacySettingsView />;
    case "appearance":
      return <AppearanceSettings />;
    case "help":
      return <HelpSettings />;
    default:
      notFound();
  }
}

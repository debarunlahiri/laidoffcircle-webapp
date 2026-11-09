import FeedView from "@/components/feed/feed-view";
import WelcomeBanner from "@/components/feed/welcome-banner";

export default function HomePage() {
  return (
    <>
      <WelcomeBanner />
      <FeedView />
    </>
  );
}

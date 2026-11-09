import InfoPage, { type InfoSection } from "@/components/layout/info-page";
import { contactEmail } from "@/config/site";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About LaidOffCircle",
  description:
    "LaidOffCircle is a professional community for people navigating layoffs, job searches and career change.",
};

const sections: InfoSection[] = [
  {
    id: "mission",
    title: "Why LaidOffCircle exists",
    content: (
      <>
        <p>
          A layoff is rarely just a change of employer. It affects income,
          identity, plans and relationships, and it often happens to many people
          at once, with very little structure to help afterwards. The advice
          people receive tends to be generic, and the most useful help usually
          comes from someone who has recently been through the same thing, or
          who works at a company that is hiring.
        </p>
        <p>
          LaidOffCircle is built to connect those people. It is a community
          where members can talk openly about what is happening, share what they
          are learning, offer and request employee referrals, and keep up with
          what is happening across the workforce. Our tagline,{" "}
          <em>Laid off, not disconnected</em>, describes the aim: that nobody
          has to work through a career disruption alone.
        </p>
      </>
    ),
  },
  {
    id: "who",
    title: "Who it is for",
    content: (
      <ul>
        <li>
          <strong>People who have been laid off</strong> or who expect to be,
          and want practical information and company from others in the same
          position.
        </li>
        <li>
          <strong>Job seekers and career changers</strong> looking for roles,
          introductions and honest advice about specific companies and
          industries.
        </li>
        <li>
          <strong>Employees who can help,</strong> including those at companies
          that are hiring, who are willing to refer capable people and share
          what they know.
        </li>
        <li>
          <strong>Anyone following the market,</strong> including recruiters,
          managers and researchers who want a grounded picture of layoffs and
          hiring.
        </li>
      </ul>
    ),
  },
  {
    id: "features",
    title: "What you can do here",
    content: (
      <>
        <h3>Conversations</h3>
        <p>
          Share updates, questions and experiences in the feed. Posts can
          include up to six photos, a poll, formatted text and links, and can be
          organised by topic and hashtag. You can comment, reply, react, repost,
          quote a post with your own commentary, and post anonymously when a
          subject is sensitive. Posts and comments you write can be edited
          later, and edited content is marked as such.
        </p>
        <h3>Referrals</h3>
        <p>
          Employees can list roles they are able to{" "}
          <Link href="/referrals">refer people for</Link>, with the company,
          location, work arrangement, level, skills and a link to the job
          description. Job seekers can filter by those criteria and send a
          request containing only what the referrer asked for, including a
          résumé, which is visible to the referrer only. Requests can be
          withdrawn, and referrers can be rated on how helpful they were.
        </p>
        <h3>Your network</h3>
        <p>
          Follow people whose posts you find useful, send connection requests,
          and manage your connections from a single page. Suggestions are based
          on people you are not yet connected to, so that the network keeps
          growing in directions you choose.
        </p>
        <h3>Messages</h3>
        <p>
          Talk privately with your connections and other members through live
          one-to-one conversations with typing indicators and read receipts.
          Chats open in a window beside whatever you are doing, so you do not
          lose your place.
        </p>
        <h3>Workforce insights</h3>
        <p>
          Browse <Link href="/insights">layoff reports and trends</Link> by
          company and month, add reports of your own, and add companies that are
          missing from the directory so that others can find them. The figures
          are contributed and reviewed by the community, so each report should
          link to a source where one exists.
        </p>
        <h3>Search and discovery</h3>
        <p>
          Search across posts, referrals, people, companies and topics, or
          search for a hashtag to see everything tagged with it. Trending topics
          show what the community is talking about.
        </p>
      </>
    ),
  },
  {
    id: "principles",
    title: "Principles we work by",
    content: (
      <ul>
        <li>
          <strong>Free to ask, free to give.</strong> Referrals are never sold.
          Anyone asking for payment in exchange for access or a promised outcome
          is breaking our rules and will be removed.
        </li>
        <li>
          <strong>Honesty over polish.</strong> We would rather members share
          accurate, imperfect information than confident guesses. Sources are
          encouraged and misrepresentation is not tolerated.
        </li>
        <li>
          <strong>Privacy by default.</strong> Documents you send to a referrer
          are kept private to that person, direct messages are visible only to
          participants, and you decide whether a post carries your name.
        </li>
        <li>
          <strong>Respect, including in disagreement.</strong> People here are
          often under stress. We expect members to be generous with each other.
        </li>
        <li>
          <strong>Accountability.</strong> Standards are published, reports are
          reviewed by people, and members can appeal decisions.
        </li>
      </ul>
    ),
  },
  {
    id: "moderation",
    title: "How the community is looked after",
    content: (
      <p>
        Any member can report a post or comment, and our team reviews reports
        and acts where the{" "}
        <Link href="/community-guidelines">Community guidelines</Link> have been
        broken. Depending on the severity, that can mean a reminder or warning
        email, a change to a post, removal of content, or a restriction on the
        account. We also verify email addresses at sign-up to reduce fake
        accounts and to make sure members can receive important updates.
      </p>
    ),
  },
  {
    id: "data",
    title: "Your information",
    content: (
      <p>
        We collect what is needed to run the service and nothing that we sell.
        The <Link href="/privacy">Privacy policy</Link> explains what we
        collect, who can see it, which providers help us operate the platform,
        how long we keep data and how to exercise your rights.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    content: (
      <p>
        Questions, feedback, corrections to a company or layoff report, or
        concerns about content that you cannot report from inside the app can be
        sent to <a href={`mailto:${contactEmail}`}>{contactEmail}</a>. We read
        everything.
      </p>
    ),
  },
];

export default function AboutPage() {
  return (
    <InfoPage
      title="About LaidOffCircle"
      intro="LaidOffCircle is a professional community for people navigating layoffs, job searches and career change, and for the people who can help them."
      sections={sections}
    />
  );
}

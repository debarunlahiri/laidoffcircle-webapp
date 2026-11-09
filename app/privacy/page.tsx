import InfoPage, { type InfoSection } from "@/components/layout/info-page";
import { contactEmail, policiesUpdated } from "@/config/site";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy policy | LaidOffCircle",
  description:
    "What LaidOffCircle collects, why, who can see it, who processes it for us, how long we keep it and the choices you have.",
};

const sections: InfoSection[] = [
  {
    id: "overview",
    title: "Overview",
    content: (
      <>
        <p>
          This policy explains how LaidOffCircle (“we”, “us”) collects, uses,
          shares and protects personal information when you use our website and
          related services at laidoffcircle.com. It applies to members and to
          visitors who browse public pages.
        </p>
        <p>
          In short: we collect the information needed to run a community, we use
          it to operate, secure and moderate it, we do not sell it, and we do
          not show advertising. The rest of this page gives the detail so that
          you can decide what to share.
        </p>
      </>
    ),
  },
  {
    id: "collect",
    title: "Information we collect",
    content: (
      <>
        <h3>Information you give us</h3>
        <ul>
          <li>
            <strong>Account details:</strong> your name, email address and, if
            you sign up with a password, the password. Passwords are stored only
            as a one-way hash, never in readable form.
          </li>
          <li>
            <strong>Profile details:</strong> optional information such as your
            role, an “about” section, your skills, what you are looking for
            next, your location, links to your website or LinkedIn profile,
            whether you are open to work, and your profile photo and cover
            image.
          </li>
          <li>
            <strong>Content you create:</strong> posts, polls and poll votes,
            photos, comments and replies, reactions, reposts, bookmarks,
            hashtags, and reports you submit about other content.
          </li>
          <li>
            <strong>Referral information:</strong> referrals you list, and when
            you request one, the answers you give and any documents you upload,
            such as a résumé or CV.
          </li>
          <li>
            <strong>Messages:</strong> the content of direct messages and
            related status such as read receipts.
          </li>
          <li>
            <strong>Network activity:</strong> people you follow and your
            connection requests and connections.
          </li>
          <li>
            <strong>Community data:</strong> companies and layoff reports you
            add to shared catalogues, and ratings you give to referrers.
          </li>
          <li>
            <strong>Correspondence:</strong> messages you send to us, and
            appeals or reports you make by email.
          </li>
        </ul>
        <h3>Information from Google sign-in</h3>
        <p>
          If you choose “Continue with Google”, Google confirms your identity to
          us through Firebase Authentication. We receive your name, verified
          email address, profile picture and a Google account identifier. We do
          not receive your Google password and we do not access your Google
          contacts, mail or files.
        </p>
        <h3>Information collected automatically</h3>
        <ul>
          <li>
            <strong>Technical and security data:</strong> IP address, browser
            and device type, request time, the pages and interface actions you
            use, and error information. We use it to keep the service working,
            to detect abuse and to apply rate limits.
          </li>
          <li>
            <strong>Session data:</strong> a sign-in session so that you stay
            signed in, with its creation and expiry time and last login time.
          </li>
          <li>
            <strong>Email delivery records:</strong> which service emails we
            sent to you and whether they were delivered.
          </li>
        </ul>
        <h3>Location and map searches</h3>
        <p>
          Locations are text that you type (for example a city on a referral or
          profile). When you use place suggestions, the text you type is sent to
          Google Maps Platform to return matching places. We do not track your
          device’s location.
        </p>
      </>
    ),
  },
  {
    id: "use",
    title: "How we use information",
    content: (
      <>
        <p>We use personal information to:</p>
        <ul>
          <li>
            create and secure your account, sign you in, and confirm your email
            address;
          </li>
          <li>
            operate the features you use: showing your posts and profile,
            delivering messages, handling referral requests, building your
            network and personalising suggestions such as people you may want to
            connect with;
          </li>
          <li>
            send service emails: verification links and reminders, a welcome
            message, and notices about activity or about your content (see
            “Email”);
          </li>
          <li>
            keep the community safe: review reports, apply our{" "}
            <Link href="/community-guidelines">Community guidelines</Link>,
            record warnings and enforcement actions, and prevent spam, fraud and
            abuse;
          </li>
          <li>
            produce aggregate statistics, such as layoff trends and platform
            usage, which do not identify individual members;
          </li>
          <li>
            maintain, debug and improve the service, and keep audit records of
            administrative actions; and
          </li>
          <li>comply with legal obligations and respond to lawful requests.</li>
        </ul>
        <p>
          Where the law requires a legal basis, we rely on: performing our
          agreement with you (running your account and the features you ask
          for); our legitimate interests in securing, moderating and improving
          the service; your consent where we ask for it (for example, when you
          choose to upload a document); and legal obligation.
        </p>
      </>
    ),
  },
  {
    id: "visibility",
    title: "What other people can see",
    content: (
      <>
        <div className="info-table-wrap">
          <table className="info-table">
            <thead>
              <tr>
                <th>Information</th>
                <th>Who can see it</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Name, role, photo and other profile details</td>
                <td>
                  Your public profile can be seen by other members and may be
                  visible to visitors. Edit it at any time.
                </td>
              </tr>
              <tr>
                <td>Posts, polls, photos and comments</td>
                <td>
                  Public, together with your name, unless you post anonymously.
                  Reactions and reposts may be visible to others.
                </td>
              </tr>
              <tr>
                <td>Anonymous posts</td>
                <td>
                  Your name is hidden from other members. Our moderation team
                  can still identify the author to enforce the guidelines, and
                  details you include in the text can still identify you.
                </td>
              </tr>
              <tr>
                <td>Direct messages</td>
                <td>
                  The people in the conversation. Messages may be accessed by us
                  only to investigate a report, to resolve a technical problem
                  or where the law requires.
                </td>
              </tr>
              <tr>
                <td>Referral requests and uploaded documents</td>
                <td>
                  The member offering that referral. Documents are stored
                  privately and are not displayed publicly.
                </td>
              </tr>
              <tr>
                <td>Follows and connections</td>
                <td>
                  The people involved. Your follower, following and connection
                  counts may be shown on your profile.
                </td>
              </tr>
              <tr>
                <td>Email address</td>
                <td>
                  Not shown publicly. Visible to our administrators for support
                  and moderation.
                </td>
              </tr>
              <tr>
                <td>Technical logs and warnings</td>
                <td>Our administrators and engineers only.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Anything you post publicly can be copied, quoted or screenshotted by
          others, and search engines may index public pages. Deleting content
          from LaidOffCircle does not remove copies that others have already
          made.
        </p>
      </>
    ),
  },
  {
    id: "sharing",
    title: "Who we share information with",
    content: (
      <>
        <p>
          We do not sell your personal information and we do not share it for
          advertising. We share it only in these situations:
        </p>
        <ul>
          <li>
            <strong>Service providers</strong> who process data on our behalf
            under confidentiality and security obligations:
            <ul>
              <li>
                Google (Firebase Authentication for Google sign-in, and Google
                Maps Platform for place suggestions);
              </li>
              <li>
                Hostinger, which delivers our service emails through its mail
                servers; and
              </li>
              <li>
                our infrastructure providers, which host the website and the
                database (currently Amazon Web Services and Vercel).
              </li>
            </ul>
          </li>
          <li>
            <strong>Other members,</strong> as described in the table above,
            according to your own choices.
          </li>
          <li>
            <strong>Legal and safety reasons:</strong> where we are required by
            law, court order or valid legal process, or where disclosure is
            necessary to protect the safety of a person, to investigate fraud or
            abuse, or to establish or defend legal claims.
          </li>
          <li>
            <strong>Business changes:</strong> if LaidOffCircle is involved in a
            merger, acquisition or similar transaction, information may be
            transferred to the successor, which would remain bound by this
            policy or would notify you of any change.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies and browser storage",
    content: (
      <>
        <p>
          We use a small number of technologies that are essential to the
          service. We do not use advertising or cross-site tracking cookies.
        </p>
        <ul>
          <li>
            <strong>Session cookie:</strong> keeps you signed in. It is marked
            HTTP-only, so scripts on the page cannot read it, and it expires
            after a limited period or when you sign out.
          </li>
          <li>
            <strong>Browser storage:</strong> remembers interface preferences on
            your device, such as your theme, whether the sidebar or chat bar is
            collapsed, your recent searches, and which release notes you have
            seen. This data stays in your browser and is not used to identify
            you.
          </li>
        </ul>
        <p>
          You can clear cookies and site storage in your browser at any time.
          Doing so will sign you out and reset these preferences.
        </p>
      </>
    ),
  },
  {
    id: "email",
    title: "Email",
    content: (
      <>
        <p>
          We send emails that are part of running your account: a message to
          confirm your address and, if it is still unconfirmed, a small number
          of reminders; a welcome message; and notices about activity or about
          your content, including a reminder or warning if a post does not
          follow the Community guidelines. These are service messages, not
          marketing, and some cannot be switched off while you hold an account.
        </p>
        <p>
          Messages come from donot-reply@laidoffcircle.com, which is not
          monitored. To reach us, write to{" "}
          <a href={`mailto:${contactEmail}`}>{contactEmail}</a>. We will never
          ask for your password by email.
        </p>
      </>
    ),
  },
  {
    id: "retention",
    title: "How long we keep information",
    content: (
      <>
        <ul>
          <li>
            <strong>Account and profile information</strong> is kept for as long
            as your account is open.
          </li>
          <li>
            <strong>Content</strong> you post stays until you delete it or your
            account is removed. Content that was reported may be kept for a
            limited time to resolve the report.
          </li>
          <li>
            <strong>Sessions</strong> expire automatically after a fixed number
            of days, and end immediately when you sign out.
          </li>
          <li>
            <strong>
              Security logs, audit records and email delivery records
            </strong>{" "}
            are kept only as long as needed for security, troubleshooting and
            accountability, and are then deleted or anonymised.
          </li>
          <li>
            <strong>Records of moderation actions,</strong> including warnings,
            may be kept after content is removed, so that we can apply the
            guidelines consistently and respond to appeals.
          </li>
        </ul>
        <p>
          When we delete information from our live systems, copies in backups
          are overwritten on a regular cycle rather than removed immediately.
        </p>
      </>
    ),
  },
  {
    id: "security",
    title: "How we protect information",
    content: (
      <>
        <p>
          We use measures appropriate to the sensitivity of the data. These
          include encrypted connections (HTTPS) between your browser and our
          servers, one-way hashing of passwords, HTTP-only session cookies, rate
          limiting and request validation, separate private storage for
          documents sent to referrers, restricted administrator access with an
          audit trail, and verification of email addresses.
        </p>
        <p>
          No system is completely secure. Use a strong, unique password, keep
          your devices up to date, and tell us promptly at{" "}
          <a href={`mailto:${contactEmail}`}>{contactEmail}</a> if you think
          your account has been compromised or you notice a security issue.
        </p>
      </>
    ),
  },
  {
    id: "rights",
    title: "Your choices and rights",
    content: (
      <>
        <p>
          You have control over much of your information directly in the app:
        </p>
        <ul>
          <li>edit your profile, photo and cover image;</li>
          <li>edit or delete your own posts and comments;</li>
          <li>withdraw a referral request or delete a referral you listed;</li>
          <li>
            remove connections, unfollow people, and sign out of your account.
          </li>
        </ul>
        <p>
          Depending on where you live, for example under the EU and UK GDPR or
          India’s Digital Personal Data Protection Act, 2023, you may also have
          the right to:
        </p>
        <ul>
          <li>access the personal information we hold about you;</li>
          <li>correct information that is inaccurate or incomplete;</li>
          <li>
            ask us to delete your account and personal information, subject to
            what we must keep by law or for safety;
          </li>
          <li>receive a copy of your information in a commonly used format;</li>
          <li>
            object to or ask us to restrict certain uses, and withdraw consent
            where we rely on it; and
          </li>
          <li>
            complain to your data protection authority if you believe we have
            not handled your information properly.
          </li>
        </ul>
        <p>
          To make a request, email{" "}
          <a href={`mailto:${contactEmail}`}>{contactEmail}</a> from the address
          on your account so that we can verify it is you. We aim to respond
          within 30 days. We may ask for more detail to locate your information,
          and we will explain if we cannot fully act on a request.
        </p>
      </>
    ),
  },
  {
    id: "transfers",
    title: "Where information is processed",
    content: (
      <p>
        Our servers are primarily located in India. Some of our service
        providers, such as Google, operate globally, so your information may be
        processed in other countries, including countries whose data protection
        laws differ from those where you live. Where required, we rely on
        appropriate safeguards such as contractual commitments from those
        providers.
      </p>
    ),
  },
  {
    id: "children",
    title: "Age requirement",
    content: (
      <p>
        LaidOffCircle is intended for working-age adults and is not directed to
        anyone under 16. We do not knowingly collect personal information from
        children. If you believe a child has created an account, contact us and
        we will remove it.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    content: (
      <p>
        We may update this policy as the service and the law change. We will
        revise the date at the top of this page and, for significant changes,
        tell you in What’s new or by email. Continuing to use LaidOffCircle
        after a change means you accept the updated policy. Our{" "}
        <Link href="/community-guidelines">Community guidelines</Link> and{" "}
        <Link href="/about">About page</Link> describe how the community
        operates.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact us",
    content: (
      <p>
        For any question about this policy or about your information, write to{" "}
        <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <InfoPage
      title="Privacy policy"
      intro="What LaidOffCircle collects, why we collect it, who can see it, who processes it for us, how long we keep it and the choices you have."
      updated={policiesUpdated}
      sections={sections}
    />
  );
}

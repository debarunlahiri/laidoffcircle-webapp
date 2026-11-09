import InfoPage, { type InfoSection } from "@/components/layout/info-page";
import { contactEmail, policiesUpdated } from "@/config/site";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Community guidelines | LaidOffCircle",
  description:
    "The standards that keep LaidOffCircle useful, respectful and safe for people dealing with layoffs and career change.",
};

const sections: InfoSection[] = [
  {
    id: "purpose",
    title: "Purpose and scope",
    content: (
      <>
        <p>
          LaidOffCircle exists so that people affected by layoffs can find
          information, perspective, referrals and support. That only works if
          members trust each other and trust the platform. These guidelines set
          out what we expect from everyone who takes part, and what happens when
          those expectations are not met.
        </p>
        <p>
          They apply to everything you contribute or send on the platform:
          posts, polls, photos, comments, reposts, direct messages, referral
          listings and requests, profile information, company and layoff
          reports, and any content you add to the shared catalogues. They apply
          equally to anonymous posts. Using LaidOffCircle means agreeing to
          follow them.
        </p>
      </>
    ),
  },
  {
    id: "respect",
    title: "Respectful conduct",
    content: (
      <>
        <p>
          Disagreement is expected, particularly on topics as personal as job
          loss. Criticise ideas, decisions and companies as strongly as the
          facts justify, but do not direct hostility at people.
        </p>
        <p>The following are not permitted:</p>
        <ul>
          <li>
            <strong>Harassment and bullying:</strong> repeated unwanted contact,
            pile-ons, mocking someone’s situation, or demeaning someone for
            being laid off, unemployed or looking for work.
          </li>
          <li>
            <strong>Threats and intimidation,</strong> including threats of
            violence, of exposing someone, or of damaging their career.
          </li>
          <li>
            <strong>Hate speech and discrimination</strong> based on race,
            ethnicity, nationality, caste, religion, gender, gender identity,
            sexual orientation, age, disability, medical condition, marital or
            parental status, or any other protected characteristic.
          </li>
          <li>
            <strong>Abusive or offensive language</strong> used to insult,
            degrade or provoke another person. Strong feelings are fine;
            profanity aimed at people, or used to demean, is not.
          </li>
          <li>
            <strong>Sexual content or unwelcome advances,</strong> including in
            direct messages and including towards people who have asked you for
            a referral or advice.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "honesty",
    title: "Honest representation",
    content: (
      <>
        <p>
          People make real decisions based on what others say here: whom to
          trust with a résumé, which opening to pursue, which company to
          approach. Present yourself and your information accurately.
        </p>
        <ul>
          <li>
            Do not impersonate another person, a recruiter, a company or a
            member of our team.
          </li>
          <li>
            Do not claim employment, seniority, affiliations or access that you
            do not have.
          </li>
          <li>
            Do not create multiple accounts to evade a restriction, to influence
            a poll or reaction counts, or to endorse your own content.
          </li>
          <li>
            Do not post fabricated stories, reviews, layoff figures or
            testimonials.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "privacy-of-others",
    title: "Protecting other people’s information",
    content: (
      <>
        <p>
          Layoffs involve managers, colleagues, recruiters and companies, and it
          is natural to talk about them. Keep your account of events focused on
          what happened to you and on information that is already public.
        </p>
        <ul>
          <li>
            Do not publish another person’s private contact details, address,
            employee ID, résumé, or other identifying information without their
            permission.
          </li>
          <li>
            Do not post screenshots or excerpts of private messages, emails or
            internal chats that identify other people unless they have agreed.
          </li>
          <li>
            Do not name individual colleagues or managers in connection with
            allegations of misconduct. If something serious has happened, use
            the proper channels at the company or with the authorities.
          </li>
          <li>
            Do not share confidential company material or anything you are bound
            by a non-disclosure or severance agreement not to disclose.
          </li>
          <li>
            Keep your own sensitive documents, such as identity papers, offer
            letters and bank details, out of public posts.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "referrals",
    title: "Referrals",
    content: (
      <>
        <p>
          Referrals are one of the most valuable things members can do for each
          other, and the part of the platform most open to abuse. The following
          rules apply to both people offering referrals and people requesting
          them.
        </p>
        <h3>If you are offering a referral</h3>
        <ul>
          <li>
            Referrals are free. Never ask for or accept payment, gifts or any
            other consideration for a referral, an introduction or interview
            access.
          </li>
          <li>
            Never promise a job, an interview or a particular outcome. A
            referral improves someone’s chances; it does not guarantee them.
          </li>
          <li>
            Describe the role, company and your connection to it accurately. Do
            not list roles that do not exist or that you cannot refer for.
          </li>
          <li>
            Ask only for information that is relevant to the referral. Treat
            résumés and documents you receive as confidential, use them only for
            that referral, and do not share or keep them longer than needed.
          </li>
          <li>
            Close or delete a listing once you can no longer refer for it.
          </li>
        </ul>
        <h3>If you are requesting a referral</h3>
        <ul>
          <li>
            Read the listing first and request only for roles that fit your
            background. Do not send the same request to many people in bulk.
          </li>
          <li>Provide truthful information and genuine documents.</li>
          <li>
            Accept a decline graciously. Referrers are not obliged to refer
            anyone, and repeated pressure after a decline may be treated as
            harassment.
          </li>
          <li>
            You may rate whether a referrer was helpful. Ratings must reflect
            your real experience.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "workforce-news",
    title: "Layoff reports and workforce news",
    content: (
      <>
        <p>
          Layoff reports, company information and news help members understand
          what is happening in the market. Their usefulness depends on accuracy.
        </p>
        <ul>
          <li>
            Link to the original source when you share an announcement, filing
            or news article, and say clearly which parts are confirmed.
          </li>
          <li>
            Separate facts from estimates, rumours and personal opinion, and
            label each as such.
          </li>
          <li>
            When you add a layoff report or a company, provide accurate figures
            and dates to the best of your knowledge, and correct them if you
            learn they are wrong.
          </li>
          <li>
            Do not make unverified accusations of illegal conduct against a
            company or a named person. Statements of fact about others can have
            legal consequences for the person who makes them.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "spam",
    title: "Spam, promotion and scams",
    content: (
      <>
        <p>
          People who have lost a job are an obvious target for fraud. We take
          scams and manipulation seriously and act on them quickly.
        </p>
        <ul>
          <li>
            No advertising, affiliate links, paid courses, multi-level marketing
            or recruitment-fee schemes unless they are genuinely relevant and
            clearly disclosed. Repeated promotion is spam even if each
            individual post is polite.
          </li>
          <li>
            No fake job offers, advance-fee or “training fee” schemes, requests
            for money or financial details, or requests that someone move to
            another platform to be paid.
          </li>
          <li>
            No phishing, malicious or deceptive links, or attempts to collect
            passwords or verification codes.
          </li>
          <li>
            No automated or mass posting, messaging or connection requests, and
            no artificially inflating reactions, votes or follower counts.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "safety",
    title: "Safety and lawful content",
    content: (
      <>
        <p>
          Do not post content that is illegal, that infringes someone else’s
          rights, or that is intended to cause harm. This includes malware,
          graphic violence, content that exploits or endangers minors, and
          material you do not have the right to share.
        </p>
        <p>
          Losing a job can be a heavy experience, and we want members to feel
          able to say so. If you are struggling, you are welcome to talk about
          it here. If you or someone you know may be in immediate danger, please
          contact local emergency services or a crisis line in your country.
          Posts that encourage self-harm are not permitted and may be escalated.
        </p>
      </>
    ),
  },
  {
    id: "anonymous",
    title: "Anonymous posting and private messages",
    content: (
      <>
        <p>
          Anonymous posts hide your name from other members so that you can
          speak freely about sensitive situations. They are not exempt from
          these guidelines. Our moderation team can act on anonymous content,
          including by contacting its author or removing it, and we may share
          information with the authorities where the law requires it.
        </p>
        <p>
          Direct messages are private to the people in the conversation, but the
          same standards of conduct apply. If you receive a message that is
          abusive, threatening, sexually inappropriate or fraudulent, report it
          to us rather than responding.
        </p>
      </>
    ),
  },
  {
    id: "reporting",
    title: "Reporting content",
    content: (
      <>
        <p>
          You are the best early warning we have. To report a post or a comment,
          open its three-dot menu and choose <strong>Report</strong>, then
          select the reason that best fits and add detail if it helps. Anonymous
          posts can be reported in the same way.
        </p>
        <ul>
          <li>
            Reports are reviewed by people, not only by automated checks, and
            are treated confidentially. The person you report is not told who
            made the report.
          </li>
          <li>
            Please report in good faith. Using reports to harass someone or to
            silence a view you simply disagree with is itself a violation.
          </li>
          <li>
            For urgent concerns, or if the content you want to report is a
            direct message or a profile, email us at{" "}
            <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "enforcement",
    title: "How we enforce these guidelines",
    content: (
      <>
        <p>
          We aim to be fair and proportionate. The action we take depends on the
          severity of the violation, whether it was deliberate, and the member’s
          history on the platform. Actions can include:
        </p>
        <ul>
          <li>
            <strong>Friendly reminder:</strong> an email pointing out a minor or
            first-time issue and linking to these guidelines. No action is
            needed beyond reading them.
          </li>
          <li>
            <strong>Warning:</strong> an email explaining which guideline was
            broken, with the relevant content and a note from our team.
          </li>
          <li>
            <strong>Final warning:</strong> an email stating that further
            violations may lead to restrictions.
          </li>
          <li>
            <strong>Content changes or removal:</strong> editing the topic of a
            post, or removing a post, comment or listing.
          </li>
          <li>
            <strong>Account restriction:</strong> temporary or permanent
            suspension, ending active sessions, and preventing a return.
          </li>
        </ul>
        <p>
          We keep a record of warnings issued to an account so that decisions
          are consistent. Serious violations, such as threats, scams, hate
          speech or exploitation of others, may lead to immediate removal or
          suspension without a prior warning.
        </p>
      </>
    ),
  },
  {
    id: "appeals",
    title: "Appeals and corrections",
    content: (
      <p>
        We can make mistakes. If you believe a warning, removal or suspension
        was wrong, email <a href={`mailto:${contactEmail}`}>{contactEmail}</a>{" "}
        from the address on your account and tell us which action you are
        challenging and why. We will review it and reply with the outcome.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to these guidelines",
    content: (
      <p>
        As the community grows we will update these guidelines. When we make a
        significant change we will note it in What’s new. The date at the top of
        this page shows when it was last revised. See also our{" "}
        <Link href="/privacy">Privacy policy</Link> and{" "}
        <Link href="/about">About page</Link>.
      </p>
    ),
  },
];

export default function CommunityGuidelinesPage() {
  return (
    <InfoPage
      title="Community guidelines"
      intro="The standards that keep LaidOffCircle useful, respectful and safe for people dealing with layoffs and career change."
      updated={policiesUpdated}
      sections={sections}
    />
  );
}

import type { Metadata } from "next";
import { brand, legal } from "../content";
import { LegalMail, LegalPage } from "../legal-page";
import { MarketingJsonLd } from "../../json-ld";
import { pageMetadata } from "../metadata";

export const metadata: Metadata = pageMetadata({
  title: `Privacy — ${brand}`,
  description: "What UseChangelog stores, what it uses it for, and who processes it.",
  path: "/privacy",
});

// Plain-language privacy policy (#18). Not legal advice; the owner approves the text.
export default function PrivacyPage() {
  return (
    <LegalPage label="Privacy" title="What we keep, and why." updated="October 8, 2026">
      <MarketingJsonLd />
      <p>
        UseChangelog is operated by {legal.operator}. This page explains what we store, what we use it for and who
        processes it for us. Questions go to <LegalMail />.
      </p>

      <h2>What we store</h2>
      <ul>
        <li>
          Your account: your email address and your sign-in sessions. If you sign in with Google, also the name and
          profile picture Google shares with us.
        </li>
        <li>
          Your workspace: its name, its public URL (slug), its widget settings and the posts you write, drafts
          included.
        </li>
        <li>
          Your subscription: the customer and subscription ids Polar gives us, and its status and dates. We never see
          or store your card details.
        </li>
        <li>
          The feedback you send from the app: your message, its kind, the app page you sent it from, your account
          and your workspace, so we can answer you.
        </li>
        <li>The emails you send to <LegalMail />.</li>
      </ul>

      <h2>What we use it for</h2>
      <p>
        To run the service: sign you in, show your changelog page and widget, and know whether your plan is active.
        And to bill you, through Polar. We don&apos;t sell your data and we don&apos;t use it for advertising.
      </p>

      <h2>Who processes it</h2>
      <ul>
        <li>
          <strong>Neon</strong>: our database, sign-in, and the emails with your sign-in link.
        </li>
        <li>
          <strong>Google</strong>: sign-in, if you choose &ldquo;Continue with Google&rdquo;. We ask Google only for
          your email address, name and profile picture.
        </li>
        <li>
          <strong>Vercel</strong>: hosting. Like any web host, it logs the requests made to the app, to your public
          page and to the widget, including the IP address and browser. Its Web Analytics also counts page views on
          our site and on public changelog pages, without cookies and without identifying anyone.
        </li>
        <li>
          <strong>Polar</strong>: payments, as our merchant of record. Polar runs the checkout, invoices and taxes,
          and handles your payment details under its own privacy policy.
        </li>
        <li>
          <strong>ImprovMX</strong>: forwards the emails sent to our support address.
        </li>
      </ul>

      <h2>The people who read your changelog</h2>
      <p>
        Your public page and the widget don&apos;t set cookies and don&apos;t track their readers. Visits to your
        public page are counted anonymously by Vercel Web Analytics; the widget isn&apos;t counted at all.
      </p>

      <h2>Cookies</h2>
      <p>
        Only the cookies that keep you signed in. Our page-view counting uses no cookies, and there are no advertising
        cookies.
      </p>

      <h2>Deleting your account</h2>
      <p>
        Delete it yourself in Settings → Delete account. That deletes your account, your workspace and its posts
        right away, and cancels your subscription without a refund. If you can&apos;t sign in, email <LegalMail /> from
        your account&apos;s address and we&apos;ll do it. Polar keeps its own records of your payments, as the law
        requires.
      </p>

      <h2>Changes</h2>
      <p>If this changes, we&apos;ll update this page and its date.</p>
    </LegalPage>
  );
}

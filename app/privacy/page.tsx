import type { Metadata } from "next";
import { legal } from "../content";
import { LegalPage } from "../legal-page";

export const metadata: Metadata = { title: "Privacy — UseChangelog" };

const mail = <a href={`mailto:${legal.contact}`}>{legal.contact}</a>;

// Plain-language privacy policy (#18). Not legal advice; the owner approves the text.
export default function PrivacyPage() {
  return (
    <LegalPage label="Privacy" title="What we keep, and why.">
      <p>
        UseChangelog is operated by {legal.operator}. This page explains what we store, what we use it for and who
        processes it for us. Questions go to {mail}.
      </p>

      <h2>What we store</h2>
      <ul>
        <li>Your account: your email address and your sign-in sessions.</li>
        <li>
          Your workspace: its name, its public URL (slug), its widget settings and the posts you write, drafts
          included.
        </li>
        <li>
          Your subscription: the customer and subscription ids Polar gives us, and its status and dates. We never see
          or store your card details.
        </li>
        <li>The emails you send to {mail}.</li>
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
          <strong>Vercel</strong>: hosting. Like any web host, it logs the requests made to the app, to your public
          page and to the widget, including the IP address and browser.
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
        Your public page and the widget don&apos;t set cookies and don&apos;t track their readers. Their requests only
        reach our host&apos;s logs, like any web page.
      </p>

      <h2>Cookies</h2>
      <p>Only the session cookie that keeps you signed in. No analytics and no advertising cookies.</p>

      <h2>Deleting your account</h2>
      <p>
        Email {mail} from your account&apos;s address and we&apos;ll delete your account, your workspace and its
        posts. To stop paying, cancel your subscription first in Billing → Manage subscription. Polar keeps its own
        records of your payments, as the law requires.
      </p>

      <h2>Changes</h2>
      <p>If this changes, we&apos;ll update this page and its date.</p>
    </LegalPage>
  );
}

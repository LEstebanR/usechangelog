import type { Metadata } from "next";
import { legal } from "../content";
import { LegalPage } from "../legal-page";

export const metadata: Metadata = { title: "Terms — UseChangelog" };

const mail = <a href={`mailto:${legal.contact}`}>{legal.contact}</a>;

// Short terms of service (#18). Not legal advice; the owner approves the text.
// Billing matches the product: one monthly plan through Polar, access until the period ends (#15).
export default function TermsPage() {
  return (
    <LegalPage label="Terms" title="The short version, in full.">
      <p>
        These terms cover your use of UseChangelog, operated by {legal.operator}. By creating an account you agree
        to them. Questions go to {mail}.
      </p>

      <h2>The service</h2>
      <p>
        UseChangelog gives your product a public changelog page and an embeddable &ldquo;What&apos;s new&rdquo;
        widget. Creating an account and writing drafts is free. Publishing, the public page and the widget need an
        active subscription.
      </p>

      <h2>The plan</h2>
      <p>
        There is one monthly plan. Its price, and a free trial if there is one, are shown at checkout. Polar sells the
        subscription as our merchant of record: it charges you, sends your invoices and handles taxes, under
        Polar&apos;s own buyer terms.
      </p>

      <h2>Cancelling</h2>
      <p>
        Cancel any time in Billing → Manage subscription. You keep publishing until the end of the period you paid
        for, or of your trial, and you aren&apos;t charged again. If a payment fails, your page and widget pause
        until it&apos;s fixed. A lapsed subscription never deletes your posts: they come back when it&apos;s active
        again. Refunds are handled by Polar.
      </p>

      <h2>Acceptable use</h2>
      <p>
        Don&apos;t use UseChangelog to publish anything illegal or deceptive, or anything that infringes someone
        else&apos;s rights, to send spam or malware, or to disrupt the service. We may suspend an account that does.
      </p>

      <h2>Your content</h2>
      <p>
        Your posts are yours. You give us the permission we need to store them and show them on your page and in your
        widget.
      </p>

      <h2>No warranty</h2>
      <p>
        We work to keep UseChangelog running, but it&apos;s provided as is, without warranties. As far as the law
        allows, we aren&apos;t liable for indirect damages, and our total liability is limited to what you paid us in
        the last 12 months.
      </p>

      <h2>Changes</h2>
      <p>
        If these terms change, we&apos;ll update this page and its date. Using UseChangelog after a change means you
        accept it.
      </p>
    </LegalPage>
  );
}

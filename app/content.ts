export type PostTag = "New" | "Improved" | "Fixed" | "Coming soon";

export type Post = {
  tag: PostTag;
  date: string;
  dateTime?: string;
  title: string;
  body: string;
};

export const brand = "UseChangelog";

// Sample public page used across the hero, steps and example.
export const publicPath = "usechangelog.com/acme";

export const hero = {
  headline: "Tell your users what shipped.",
  subhead:
    "UseChangelog gives your product a public changelog and an in-app widget. Write a post once, and people see it on your site and inside your app.",
  primaryCta: { label: "Get started", href: "/signup" },
  secondaryCta: { label: "See a changelog", href: "#changelog" },
  facts: [
    { term: "Setup", value: "One script tag" },
    { term: "Editor", value: "Markdown" },
    { term: "Tags", value: "New, Improved, Fixed" },
    { term: "Public page", value: publicPath },
  ],
};

export const problem = {
  label: "The problem",
  title: "Your release notes are buried.",
  intro:
    "Most small teams already write down what they ship. The trouble is where it ends up.",
  places: [
    {
      name: "Notion",
      text: "A page called “Releases” that only people with the link can find, three clicks deep.",
    },
    {
      name: "Slack",
      text: "A #shipped channel your team reads and your customers never see.",
    },
    {
      name: "GitHub",
      text: "Release notes written for developers: commit hashes, PR numbers, no context.",
    },
  ],
  outcome:
    "So users miss what you built, and support keeps answering questions about features that shipped last month.",
};

export const how = {
  label: "How it works",
  title: "Three steps from release to readers.",
  steps: [
    {
      title: "Write a post",
      text: "Use a plain Markdown editor. Tag it New, Improved or Fixed, then publish.",
      detail: "Markdown editor",
    },
    {
      title: "Get a public page",
      text: "Every post lands on a clean public changelog at usechangelog.com/your-product. Link to it from your docs and emails.",
      detail: publicPath,
    },
    {
      title: "Embed the widget",
      text: "Add one script tag. Your app gets a small “What’s new” panel with your latest posts.",
      detail: "widget.js",
    },
  ],
};

export const example = {
  label: "Example",
  title: "What your readers see.",
  aside:
    "A public page with every post dated and tagged. Here is a sample for a product called Acme.",
  product: "Acme",
};

export const posts: Post[] = [
  {
    tag: "New",
    date: "Sep 30, 2026",
    dateTime: "2026-09-30",
    title: "CSV export",
    body: "Export any report to CSV from the Share menu. The columns match what you see on screen.",
  },
  {
    tag: "Improved",
    date: "Sep 22, 2026",
    dateTime: "2026-09-22",
    title: "Search as you type",
    body: "Search now shows results while you type and matches partial words, so “inv” finds every invoice.",
  },
  {
    tag: "Fixed",
    date: "Sep 15, 2026",
    dateTime: "2026-09-15",
    title: "Reminder time zones",
    body: "Reminders now go out in each teammate’s local time zone instead of the workspace default.",
  },
  {
    tag: "Coming soon",
    date: "Q4 2026",
    title: "Dark mode",
    body: "Acme will follow your system theme, with a manual switch in settings for when you want the opposite.",
  },
];

export const shippedPosts = posts.filter((post) => post.tag !== "Coming soon");

export const widget = {
  label: "Widget",
  title: "One line in your app.",
  text: "Paste the snippet before the closing body tag. A “What’s new” panel then shows your latest posts inside your app.",
  snippet: `<script
  src="https://usechangelog.com/widget.js"
  data-project="acme"
  data-trigger="#whats-new"
  defer
></script>`,
  note: "Preview only. The widget isn’t live yet.",
};

export const audience = {
  label: "Who it’s for",
  title: "Made for teams of one to twenty.",
  groups: [
    {
      title: "Indie hackers",
      text: "You ship every week and you’re the whole team. Posting an update should take two minutes, not an afternoon.",
    },
    {
      title: "Small product teams",
      text: "Product, design and engineering publish from one place, in one voice, without a release-management process.",
    },
  ],
};

export const closing = {
  label: "Next",
  title: "Start your changelog.",
  plan: "Publishing is part of a monthly plan. Pricing will be shared at launch.",
  // Early access until the launch (#9): sign-up is open, the product is still settling in.
  status: "We’re in early access while we launch. Sign up free; publishing needs the monthly plan.",
};

export const signIn = { label: "Sign in", href: "/sign-in" };

// Who runs UseChangelog, and the legal pages (#18). Each page keeps its own "Last updated" date.
export const legal = {
  operator: "LEsteban (Luis Esteban Ramírez)",
  contact: "support@lesteban.dev",
  links: [
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms" },
  ],
};

export const footer = {
  year: 2026,
  // The maker's credit, next to the copyright.
  credit: { name: "LEsteban", href: "https://www.lesteban.dev" },
};

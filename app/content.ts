export type PostTag = "New" | "Improved" | "Fixed" | "Coming soon";

export type Post = {
  tag: PostTag;
  date: string;
  dateTime?: string;
  title: string;
  body: string;
};

export const hero = {
  headline: "Tell your users what shipped.",
  subhead:
    "UseChangelog gives your product a public changelog and an in-app widget. Write a post once, and people see it on your site and inside your app.",
  primaryCta: { label: "Get started", href: "#get-started" },
  secondaryCta: { label: "See a changelog", href: "#changelog" },
};

export const problem = {
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

export const steps = [
  {
    title: "Write a post",
    text: "Use a plain Markdown editor. Tag it New, Improved or Fixed, then publish.",
  },
  {
    title: "Get a public page",
    text: "Every post lands on a clean public changelog at usechangelog.com/your-product. Link to it from your docs and emails.",
  },
  {
    title: "Embed the widget",
    text: "Add one script tag. Your app gets a small “What’s new” panel with your latest posts.",
  },
];

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

export const widget = {
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

export const audiences = [
  {
    title: "Indie hackers",
    text: "You ship every week and you’re the whole team. Posting an update should take two minutes, not an afternoon.",
  },
  {
    title: "Small product teams",
    text: "Product, design and engineering publish from one place, in one voice, without a release-management process.",
  },
];

export const footer = {
  name: "UseChangelog",
  year: 2026,
};

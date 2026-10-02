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
  primaryCta: { label: "Get started", href: "#" },
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
    text: "Use a plain Markdown editor. Tag it New, Improved or Fixed, then publish now or schedule it.",
  },
  {
    title: "Get a public page",
    text: "Every post lands on a clean changelog page with its own URL and an RSS feed. Link to it from your docs and emails.",
  },
  {
    title: "Embed the widget",
    text: "Add one script tag. Your app gets a small “What’s new” panel with an unread badge.",
  },
];

export const posts: Post[] = [
  {
    tag: "New",
    date: "Sep 30, 2026",
    dateTime: "2026-09-30",
    title: "Scheduled posts",
    body: "Write an update ahead of a launch and pick the date and time it goes live. The widget badge updates at the same moment.",
  },
  {
    tag: "Improved",
    date: "Sep 22, 2026",
    dateTime: "2026-09-22",
    title: "Lighter widget",
    body: "The embed script is now 9 KB gzipped and loads after your page becomes interactive, so it never delays your own UI.",
  },
  {
    tag: "Fixed",
    date: "Sep 15, 2026",
    dateTime: "2026-09-15",
    title: "RSS dates",
    body: "Feed entries now use the publish date instead of the date the draft was created.",
  },
  {
    tag: "Coming soon",
    date: "Q4 2026",
    title: "Email digests",
    body: "Send subscribers a short weekly summary of new posts, straight from your changelog.",
  },
];

export const widget = {
  title: "One line in your app.",
  text: "Paste the snippet before the closing body tag. The widget picks up your brand color and opens from any element you choose.",
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

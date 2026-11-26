// What /app/settings hands out to create drafts from merged pull requests (#86): the section
// to add to a pull request template and the GitHub Actions workflow that sends it. Pure, so
// the exact text is tested; examples/github-actions/ holds copies for production's origin.

// The PR template section. Only what's written in it is sent; the rest of the description,
// the diff and the commits stay in GitHub.
export const PR_TEMPLATE_SECTION = `## Changelog

<!-- Optional: a post for your customers, sent to UseChangelog as a draft when this pull request is merged.
Write a title to send it, or leave it empty to skip. Category: new, improved or fixed.
Anything below Title and Category is the post's body, in Markdown. Nothing else in this pull request is sent. -->

Title:
Category: improved
`;

// Reads the "Changelog" section of a pull request description: null when there is none or
// its title is empty (the workflow skips it), { error } when the category isn't valid. The
// section ends at the next heading of its level or higher, outside code fences.
// Plain JavaScript in a string, because the workflow runs it with Node; the tests run the same text.
export const CHANGELOG_PARSER = String.raw`function changelogEntry(description) {
  const lines = String(description || "").replace(/<!--[\s\S]*?-->/g, "").split(/\r?\n/);
  const start = lines.findIndex((line) => /^#{1,6}\s+changelog\s*$/i.test(line.trim()));
  if (start === -1) return null;
  const level = lines[start].trim().match(/^#+/)[0].length;
  const fields = {};
  const body = [];
  let fence = null;
  for (const line of lines.slice(start + 1)) {
    // Inside a code fence, a "# comment" is code, not a heading that ends the section.
    const marker = line.trim().match(/^(\x60{3,}|~{3,})/);
    if (marker && !fence) fence = marker[1][0];
    else if (marker && marker[1][0] === fence) fence = null;
    const heading = !fence && !marker && line.trim().match(/^(#{1,6})\s/);
    if (heading && heading[1].length <= level) break;
    const field = line.match(/^\s*(title|category)\s*:(.*)$/i);
    if (field && !(field[1].toLowerCase() in fields)) fields[field[1].toLowerCase()] = field[2].trim();
    else body.push(line);
  }
  if (!fields.title) return null;
  const category = (fields.category || "").toLowerCase();
  if (!["new", "improved", "fixed"].includes(category)) {
    return { error: "Set the changelog Category to new, improved or fixed." };
  }
  return { title: fields.title, category, body: body.join("\n").trim() };
}`;

// Sends the entry, retrying twice when UseChangelog can't be reached or fails. It never
// prints the key or the pull request's text: only the outcome and our own error messages.
const SEND = String.raw`const fs = require("node:fs");

(async () => {
  const pr = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, "utf8")).pull_request;
  const entry = changelogEntry(pr.body);
  const fail = (message) => {
    console.log("::error::" + message);
    process.exitCode = 1;
  };
  if (!entry) return console.log("No changelog title in this pull request: skipped.");
  if (entry.error) return fail(entry.error);
  if (!process.env.USECHANGELOG_API_KEY) return fail("Add the USECHANGELOG_API_KEY secret to this repository.");

  const request = {
    title: entry.title,
    body: entry.body,
    category: entry.category,
    source: { repo: process.env.GITHUB_REPOSITORY, pr: pr.number },
  };
  for (let attempt = 1; attempt <= 3; attempt++) {
    const response = await fetch(process.env.USECHANGELOG_URL, {
      method: "POST",
      headers: { authorization: "Bearer " + process.env.USECHANGELOG_API_KEY, "content-type": "application/json" },
      body: JSON.stringify(request),
    }).catch(() => null);
    if (response && response.status < 500) {
      const result = await response.json().catch(() => ({}));
      if (response.ok) {
        return console.log(result.created ? "Draft created in UseChangelog." : "This pull request already has a post in UseChangelog.");
      }
      const fields = Object.values(result.fields || {}).join(" ");
      return fail("UseChangelog answered " + response.status + ": " + (result.message || "no message") + (fields ? " " + fields : ""));
    }
    if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, 5000 * attempt));
  }
  fail("UseChangelog couldn't be reached. Re-run this job to try again.");
})();`;

const indent = (text: string, spaces: number) =>
  text
    .split("\n")
    .map((line) => (line ? " ".repeat(spaces) + line : line))
    .join("\n");

// The workflow, for .github/workflows/usechangelog.yml.
export function githubWorkflow(origin: string) {
  return `# Sends the "Changelog" section of each merged pull request to UseChangelog as a draft.
# Setup: add your project's API key as the USECHANGELOG_API_KEY secret
# (Settings → Secrets and variables → Actions → New repository secret).
name: UseChangelog

on:
  # Runs this file as it is on your default branch and never checks out the pull request's
  # code, so pull requests from forks work too without running their code.
  pull_request_target:
    types: [closed]

permissions: {}

jobs:
  draft:
    if: github.event.pull_request.merged && github.event.pull_request.base.ref == github.event.repository.default_branch
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - name: Send the changelog entry as a draft
        env:
          USECHANGELOG_API_KEY: \${{ secrets.USECHANGELOG_API_KEY }}
          USECHANGELOG_URL: ${origin}/api/v1/posts
        run: |
          node <<'SCRIPT'
${indent(`${CHANGELOG_PARSER}\n\n${SEND}`, 10)}
          SCRIPT
`;
}

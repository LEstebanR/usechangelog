import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { CHANGELOG_PARSER, githubWorkflow, PR_TEMPLATE_SECTION } from "./github";

// The same text the workflow runs.
const changelogEntry = new Function(`${CHANGELOG_PARSER}\nreturn changelogEntry;`)() as (
  description: unknown,
) => null | { error: string } | { title: string; category: string; body: string };

const pr = (section: string) => `## What changes\n\nInternal notes: refactor of the queue.\n\n${section}\n## How it was tested\n\nLocally.`;

describe("changelogEntry (#86)", () => {
  test("reads only the Changelog section: title, category and body", () => {
    expect(changelogEntry(pr("## Changelog\n\nTitle: Faster exports\nCategory: Improved\n\nExports run in the **background**.\n"))).toEqual({
      title: "Faster exports",
      category: "improved",
      body: "Exports run in the **background**.",
    });
  });

  test("the template as is, or no section at all, is skipped", () => {
    expect(changelogEntry(pr(PR_TEMPLATE_SECTION))).toBeNull();
    expect(changelogEntry("Just a fix.")).toBeNull();
    expect(changelogEntry(null)).toBeNull();
  });

  test("the template's comment never reaches the body", () => {
    const filled = PR_TEMPLATE_SECTION.replace("Title:", "Title: Dark mode").replace("Category: improved", "Category: new");
    expect(changelogEntry(pr(filled))).toEqual({ title: "Dark mode", category: "new", body: "" });
  });

  test("a title with an invalid category is an error, not a silent skip", () => {
    expect(changelogEntry("## Changelog\nTitle: X\nCategory: shipped")).toEqual({ error: expect.any(String) });
    expect(changelogEntry("## Changelog\nTitle: X")).toEqual({ error: expect.any(String) });
  });

  test("a subheading stays in the body; a heading of the same level ends it", () => {
    expect(changelogEntry("### Changelog\r\nTitle: X\r\nCategory: fixed\r\n#### Details\r\nMore.\r\n### Next\r\nInternal")).toEqual({
      title: "X",
      category: "fixed",
      body: "#### Details\nMore.",
    });
  });
});

test("a # comment inside a code fence stays in the body", () => {
  const fence = "\x60\x60\x60";
  expect(changelogEntry(`## Changelog\nTitle: CLI\nCategory: new\n${fence}bash\n# install\nnpm i x\n${fence}\n~~~\n## not a heading\n~~~\nAfter.\n## Next\nInternal`)).toEqual({
    title: "CLI",
    category: "new",
    body: `${fence}bash\n# install\nnpm i x\n${fence}\n~~~\n## not a heading\n~~~\nAfter.`,
  });
});

describe("githubWorkflow (#86)", () => {
  const workflow = githubWorkflow("https://www.usechangelog.com");

  test("runs only for pull requests merged into the default branch, with no token permissions", () => {
    expect(workflow).toContain("pull_request_target:\n    types: [closed]");
    expect(workflow).toContain("if: github.event.pull_request.merged && github.event.pull_request.base.ref == github.event.repository.default_branch");
    expect(workflow).toContain("permissions: {}");
    expect(workflow).not.toContain("actions/checkout");
  });

  test("reads the key from a secret, sends it only as a header and never prints it", () => {
    expect(workflow).toContain("USECHANGELOG_API_KEY: ${{ secrets.USECHANGELOG_API_KEY }}");
    expect(workflow).toContain("USECHANGELOG_URL: https://www.usechangelog.com/api/v1/posts");
    // Read twice: to check it's set, and for the Authorization header.
    expect(workflow.match(/process\.env\.USECHANGELOG_API_KEY/g)?.length).toBe(2);
    expect(workflow).toContain('authorization: "Bearer " + process.env.USECHANGELOG_API_KEY');
    expect(workflow).not.toMatch(/console\.log\([^)]*(process\.env|entry\.(title|body)|JSON\.stringify)/);
  });

  test("reads the pull request from the event file, never interpolated into the script", () => {
    expect(workflow).toContain("process.env.GITHUB_EVENT_PATH");
    expect(workflow.match(/\$\{\{/g)?.length).toBe(1);
  });

  test("the copies in examples/ match what settings hands out", () => {
    expect(readFileSync("examples/github-actions/usechangelog.yml", "utf8")).toBe(workflow);
    expect(readFileSync("examples/github-actions/pull_request_template.md", "utf8")).toBe(PR_TEMPLATE_SECTION);
  });
});

import { describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { getSkillInstallCommand } from "./install";
import { loadSkills, parseSkill, SkillError, skills } from "./skills";

const skillSource = (frontmatter: string, body = "# Title\n\nBody text.") =>
  `---\n${frontmatter}\n---\n\n${body}\n`;

const validFrontmatter = [
  "name: demo-skill",
  'description: "Trigger: demo. Does a thing."',
  "license: MIT",
  "metadata:",
  '  author: "ivo"',
  '  version: "1.2"',
].join("\n");

const makeSkillsRoot = (folders: Record<string, Record<string, string>>) => {
  const root = mkdtempSync(path.join(tmpdir(), "skills-"));
  for (const [folder, files] of Object.entries(folders)) {
    for (const [relativePath, content] of Object.entries(files)) {
      const filePath = path.join(root, folder, relativePath);
      mkdirSync(path.dirname(filePath), { recursive: true });
      writeFileSync(filePath, content);
    }
  }
  return root;
};

describe("parseSkill", () => {
  test("reads the frontmatter, the body and the public files", () => {
    const skill = parseSkill("demo-skill", skillSource(validFrontmatter), [
      "references/notes.md",
      "SKILL.md",
      "references/private.local.md",
      ".DS_Store",
    ]);
    expect(skill).toEqual({
      body: "# Title\n\nBody text.",
      description: "Trigger: demo. Does a thing.",
      files: ["SKILL.md", "references/notes.md"],
      license: "MIT",
      metadata: { author: "ivo", version: "1.2" },
      name: "demo-skill",
    });
  });

  test("accepts a skill with only a name and a description", () => {
    const skill = parseSkill(
      "bare",
      skillSource("name: bare\ndescription: Short."),
      ["SKILL.md"]
    );
    expect(skill.license).toBeUndefined();
    expect(skill.metadata).toBeUndefined();
  });

  test("throws when the frontmatter is missing", () => {
    expect(() => parseSkill("demo-skill", "# No frontmatter", [])).toThrow(
      SkillError
    );
  });

  test("throws when the description is missing", () => {
    expect(() =>
      parseSkill("demo-skill", skillSource("name: demo-skill"), [])
    ).toThrow(/invalid frontmatter/u);
  });

  test("throws when the name differs from the folder", () => {
    expect(() =>
      parseSkill("other-folder", skillSource(validFrontmatter), [])
    ).toThrow(/must match the folder name/u);
  });

  test("throws when a version is not a string", () => {
    expect(() =>
      parseSkill(
        "demo-skill",
        skillSource(
          "name: demo-skill\ndescription: Short.\nmetadata:\n  version: 1.0"
        ),
        []
      )
    ).toThrow(/invalid frontmatter/u);
  });
});

describe("loadSkills", () => {
  test("lists every skill folder sorted by name, without private files", () => {
    const root = makeSkillsRoot({
      alpha: {
        "SKILL.md": skillSource("name: alpha\ndescription: First."),
        "notes.local.md": "private",
        "references/guide.md": "guide",
      },
      beta: { "SKILL.md": skillSource("name: beta\ndescription: Second.") },
    });
    const loaded = loadSkills(root);
    expect(loaded.map((skill) => skill.name)).toEqual(["alpha", "beta"]);
    expect(loaded[0]?.files).toEqual(["SKILL.md", "references/guide.md"]);
  });

  test("throws when a folder has no SKILL.md", () => {
    const root = makeSkillsRoot({ empty: { "README.md": "no skill" } });
    expect(() => loadSkills(root)).toThrow(/missing SKILL.md/u);
  });
});

describe("repository skills", () => {
  test("every skill in skills/ parses and lists SKILL.md", () => {
    expect(skills.length).toBeGreaterThan(0);
    for (const skill of skills) {
      expect(skill.files).toContain("SKILL.md");
      expect(skill.files.some((file) => file.endsWith(".local.md"))).toBe(
        false
      );
    }
  });
});

describe("getSkillInstallCommand", () => {
  test("installs one skill from the repository", () => {
    expect(getSkillInstallCommand("frontend-care")).toBe(
      "npx skills add IvanTsxx/Portafolio --skill frontend-care"
    );
  });

  test("adds -g for a global install", () => {
    expect(getSkillInstallCommand("frontend-care", "global")).toBe(
      "npx skills add IvanTsxx/Portafolio --skill frontend-care -g"
    );
  });
});

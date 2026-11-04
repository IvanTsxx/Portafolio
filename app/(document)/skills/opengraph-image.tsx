import { padCount, renderOgImage } from "@/lib/content/og-image";
import { pageSeo, socialTitleOf } from "@/lib/site/seo";
import { skills } from "@/lib/skills/skills";

export const alt = socialTitleOf(pageSeo.skills);
export { contentType, size } from "@/lib/content/og-image";

const OpenGraphImage = () =>
  renderOgImage({
    label: { code: "Skills", meta: `${padCount(skills.length)} installable` },
    summary: "Agent Skills for Claude Code, Codex and other coding agents.",
    title: { accent: "skills", text: "Agent skills" },
  });

export default OpenGraphImage;

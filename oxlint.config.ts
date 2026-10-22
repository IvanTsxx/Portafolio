import { defineConfig } from "oxlint";
import antiSlop from "ultracite/oxlint/anti-slop";
import core from "ultracite/oxlint/core";
import { jsPluginSettings, selectJsPlugins } from "ultracite/oxlint/js-plugins";
import next from "ultracite/oxlint/next";
import nextJsPlugins from "ultracite/oxlint/next/js-plugins";
import react from "ultracite/oxlint/react";

const jsPlugins = selectJsPlugins(["react-doctor"]);

export default defineConfig({
  extends: [core, react, next, nextJsPlugins, antiSlop, jsPlugins],
  ignorePatterns: [
    ...(core.ignorePatterns ?? []),
    "components/ui/**",
    ".claude/**",
  ],
  jsPlugins: jsPlugins.jsPlugins,
  overrides: [
    {
      files: ["components/profile/experience/experience-section.tsx"],
      rules: { "require-await": "off" },
    },
    {
      files: ["app/**", "components/**", "hooks/**", "lib/**"],
      rules: { "react/jsx-no-constructed-context-values": "off" },
    },
  ],
  rules: {
    "jsx-a11y/aria-role": ["error", { ignoreNonDOM: true }],
  },
  settings: jsPluginSettings,
});

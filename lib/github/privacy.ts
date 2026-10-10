import type { GithubProfile } from "./model";

const redactedPattern = /basement/iu;

export class GithubPrivacyError extends Error {
  override name = "GithubPrivacyError";
}

export const isRedacted = (value: string | null | undefined) =>
  value !== null && value !== undefined && redactedPattern.test(value);

export const keepPublic = <Row>(
  rows: readonly Row[],
  textOf: (row: Row) => readonly (string | null)[]
) => rows.filter((row) => !textOf(row).some(isRedacted));

export const publicEmail = (email: string | null, allowedEmail: string) =>
  email !== null && email.toLowerCase() === allowedEmail.toLowerCase()
    ? email
    : null;

export const assertPublicProfile = (profile: GithubProfile) => {
  if (redactedPattern.test(JSON.stringify(profile))) {
    throw new GithubPrivacyError("Profile still carries a redacted term");
  }
  return profile;
};

import type { GithubProfile } from "./model";

const redactedPattern = /basement/iu;

const allowedAffiliations = new Set([
  "basement",
  "basement studio",
  "basement.studio",
  "basementstudio",
]);

export class GithubPrivacyError extends Error {
  override name = "GithubPrivacyError";
}

export const isRedacted = (value: string | null | undefined) =>
  value !== null && value !== undefined && redactedPattern.test(value);

export const isAllowedAffiliation = (value: string) =>
  allowedAffiliations.has(value.trim().replace(/^@/u, "").toLowerCase());

export const keepPublic = <Row>(
  rows: readonly Row[],
  textOf: (row: Row) => readonly (string | null)[]
) => rows.filter((row) => !textOf(row).some(isRedacted));

export const publicAffiliation = (value: string | null) =>
  value === null || !isRedacted(value) || isAllowedAffiliation(value)
    ? value
    : null;

export const publicOrganizations = (logins: readonly string[]) =>
  logins.filter(
    (login) => !isRedacted(login) || isAllowedAffiliation(login)
  );

export const publicEmail = (email: string | null, allowedEmail: string) =>
  email !== null && email.toLowerCase() === allowedEmail.toLowerCase()
    ? email
    : null;

const withoutAffiliations = (profile: GithubProfile) => ({
  ...profile,
  identity: {
    ...profile.identity,
    company:
      profile.identity.company !== null &&
      isAllowedAffiliation(profile.identity.company)
        ? null
        : profile.identity.company,
    organizations: profile.identity.organizations.filter(
      (login) => !isAllowedAffiliation(login)
    ),
  },
});

export const assertPublicProfile = (profile: GithubProfile) => {
  if (redactedPattern.test(JSON.stringify(withoutAffiliations(profile)))) {
    throw new GithubPrivacyError(
      "Profile carries a redacted term outside the company affiliation"
    );
  }
  return profile;
};

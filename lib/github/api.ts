import { z } from "zod";

const GRAPHQL_ENDPOINT = "https://api.github.com/graphql";
const REST_ENDPOINT = "https://api.github.com";

export const GITHUB_REVALIDATE_SECONDS = 3600;
export const GITHUB_PROFILE_TAG = "github-profile";

export class GithubRequestError extends Error {
  override name = "GithubRequestError";
}

const headers = (token: string) => ({
  accept: "application/vnd.github+json",
  authorization: `Bearer ${token}`,
  "x-github-api-version": "2022-11-28",
});

const cacheOptions = {
  next: { revalidate: GITHUB_REVALIDATE_SECONDS, tags: [GITHUB_PROFILE_TAG] },
};

const graphqlErrorsSchema = z.object({
  errors: z.array(z.object({ message: z.string() })).optional(),
});

const ensureOk = (response: Response, label: string) => {
  if (!response.ok) {
    throw new GithubRequestError(
      `${label} responded ${response.status} ${response.statusText}`
    );
  }
};

export const githubGraphql = async <User>(
  token: string,
  query: string,
  variables: Record<string, string>,
  userSchema: z.ZodType<User>
) => {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    ...cacheOptions,
    body: JSON.stringify({ query, variables }),
    headers: { ...headers(token), "content-type": "application/json" },
    method: "POST",
  });
  ensureOk(response, "GitHub GraphQL");
  const body = await response.json();
  const { errors } = graphqlErrorsSchema.parse(body);
  if (errors && errors.length > 0) {
    throw new GithubRequestError(
      `GitHub GraphQL errors: ${errors.map((error) => error.message).join("; ")}`
    );
  }
  return z.object({ data: z.object({ user: userSchema }) }).parse(body).data
    .user;
};

export const githubRest = async <Payload>(
  token: string,
  path: string,
  schema: z.ZodType<Payload>
) => {
  const response = await fetch(`${REST_ENDPOINT}${path}`, {
    ...cacheOptions,
    headers: headers(token),
  });
  ensureOk(response, `GitHub REST ${path}`);
  return schema.parse(await response.json());
};

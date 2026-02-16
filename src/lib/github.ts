import { env } from "@/env/server";

interface GithubEvent {
  type: string;
  repo: {
    name: string; // owner/repo
  };
  created_at: string;
  payload: {
    head?: string; // commit SHA
    ref?: string;
  };
}

interface GithubCommitResponse {
  html_url: string;
  commit: {
    message: string;
  };
}

export const getRecentActivity = async () => {
  const username = "IvanTsxx";

  const headers = {
    Authorization: `Bearer ${env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
  };

  try {
    // 1️⃣ Obtener eventos públicos
    const eventsRes = await fetch(
      `https://api.github.com/users/${username}/events/public`,
      {
        headers,
        next: { revalidate: 18_000 }, // 5 horas
      }
    );

    if (!eventsRes.ok) {
      return null;
    }

    const events: GithubEvent[] = await eventsRes.json();

    // 2️⃣ Buscar el último PushEvent válido
    const pushEvent = events.find(
      (e) => e.type === "PushEvent" && e.payload?.head
    );

    if (!pushEvent) {
      return null;
    }

    const [owner, repo] = pushEvent.repo.name.split("/");
    const sha = pushEvent.payload.head;

    // 3️⃣ Obtener el commit real
    const commitRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits/${sha}`,
      {
        headers,
      }
    );

    if (!commitRes.ok) {
      return null;
    }

    const commit: GithubCommitResponse = await commitRes.json();

    // 4️⃣ Resultado final
    return {
      type: "PushEvent",
      repo: pushEvent.repo.name,
      message: commit.commit.message,
      date: pushEvent.created_at,
      url: commit.html_url,
    };
  } catch (error) {
    console.error("Error fetching GitHub activity:", error);
    return null;
  }
};

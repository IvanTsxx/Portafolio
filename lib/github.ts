import { env } from "@/env/server";

interface GithubEvent {
  type: string;
  repo: {
    name: string;
    url: string;
  };
  created_at: string;
  payload: {
    commits?: Array<{
      message: string;
    }>;
  };
}

export const getRecentActivity = async () => {
  // Replace with your actual GitHub username
  const username = "ivantsxx"; // Using the username seen in previous contexts

  try {
    const response = await fetch(
      `https://api.github.com/users/${username}/events/public`,
      {
        headers: {
          // Add token if hitting rate limits: Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
          Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        },
        next: { revalidate: 18000 }, // Cache for 5 hour
      },
    );

    if (!response.ok) {
      // Mock data fallback
      return {
        type: "PushEvent",
        repo: "ivantsxx/portafolio-v2",
        message: "feat: implementing awesome features",
        date: new Date().toISOString(),
        url: "https://github.com/ivantsxx",
      };
    }

    const events: GithubEvent[] = await response.json();

    const pushEvent = events.find((e) => e.type === "PushEvent");

    if (pushEvent) {
      console.log("pushEvent", pushEvent);
      return {
        type: "PushEvent",
        repo: pushEvent.repo.name,
        message: pushEvent.payload.commits?.[0]?.message || "Updates",
        date: pushEvent.created_at,
        url: `https://github.com/${pushEvent.repo.name}`,
      };
    }

    return null;
  } catch (error) {
    console.error("Error fetching GitHub activity", error);
    return {
      type: "PushEvent",
      repo: "ivantsxx/portafolio-v2",
      message: "feat: implementing awesome features (mock)",
      date: new Date().toISOString(),
      url: "https://github.com/ivantsxx",
    };
  }
};

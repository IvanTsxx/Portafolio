export const spotifyRedirectUri = "http://[::1]:3000/api/spotify/callback";

export const spotifyScopes = [
  "user-read-currently-playing",
  "user-read-recently-played",
] as const;

export const isDevelopment = () => process.env.NODE_ENV === "development";

export const authorizeUrl = (clientId: string) =>
  `https://accounts.spotify.com/authorize?${new URLSearchParams({
    client_id: clientId,
    redirect_uri: spotifyRedirectUri,
    response_type: "code",
    scope: spotifyScopes.join(" "),
  })}`;

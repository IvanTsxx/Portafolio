import "dotenv/config";
import readline from "node:readline";

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:3000";

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error(
    "Error: SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET must be set in .env",
  );
  process.exit(1);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const SCOPES = [
  "user-read-currently-playing",
  "user-read-recently-played",
  "user-read-playback-state",
].join(" ");

const authUrl = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(
  REDIRECT_URI,
)}&scope=${encodeURIComponent(SCOPES)}`;

console.log("\n1. Ve a tu Spotify Developer Dashboard y asegúrate de que");
console.log(`   "${REDIRECT_URI}" esté en tus Redirect URIs.`);
console.log("\n2. Abre esta URL en tu navegador:\n");
console.log(authUrl);
console.log(
  "\n3. Después de autorizar, serás redirigido a una URL como: http://localhost:3000/?code=NA_...\n",
);

rl.question(
  "4. Pega aquí el código que aparece en la URL (todo lo después de ?code=): ",
  async (code) => {
    try {
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: REDIRECT_URI,
        }),
      });

      const data = await response.json();

      if (data.error) {
        console.error("\nError obteniendo el token:", data);
      } else {
        console.log("\n¡Éxito! Aquí tienes tu Refresh Token:\n");
        console.log(data.refresh_token);
        console.log(
          "\nCopia este valor y ponlo en tu .env como SPOTIFY_REFRESH_TOKEN",
        );
      }
    } catch (error) {
      console.error("Error de red:", error);
    } finally {
      rl.close();
    }
  },
);

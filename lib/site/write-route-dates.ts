import { registerAppLoaders } from "./bun-loaders";

registerAppLoaders();

const { getPublicRoutes } = await import("./public-routes");

const lastCommitDate = (sources: readonly string[]) => {
  const result = Bun.spawnSync([
    "git",
    "log",
    "-1",
    "--format=%cs",
    "--",
    ...sources,
  ]);
  const date = result.stdout.toString().trim();
  if (!date) {
    throw new Error(`No commit touches ${sources.join(", ")}`);
  }
  return date;
};

const routes = await getPublicRoutes();
const dates = Object.fromEntries(
  routes.map((route) => [route.path, lastCommitDate(route.sources)])
);

await Bun.write(
  new URL("route-dates.json", import.meta.url),
  `${JSON.stringify(dates, null, 2)}\n`
);
console.log(`route-dates.json written: ${routes.length} routes`);

/** Share deployment URL calculation with Astro, browser QA, and output verification. */
export function deploymentConfig(
  env: Record<string, string | undefined> = process.env,
) {
  const repository = env.GITHUB_REPOSITORY;
  const [owner, name] = repository?.split('/') ?? [];
  const inferred =
    name && name.toLowerCase() !== `${owner}.github.io`.toLowerCase()
      ? `/${name}`
      : '/';
  const raw = env.BASE_PATH || inferred;
  const base = raw === '/' ? '/' : `/${raw.replace(/^\/+|\/+$/g, '')}`;
  const site =
    env.SITE_URL ||
    (owner ? `https://${owner}.github.io` : 'http://localhost:4321');
  const repoUrl =
    env.REPOSITORY_URL ||
    (repository ? `https://github.com/${repository}` : undefined);
  return { base, site, repoUrl };
}

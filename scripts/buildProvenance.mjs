/** Treat build origin as an inspectable claim, never guess a deployment SHA. */
export function sourceCommit(env){
 const candidate=env.CF_PAGES_COMMIT_SHA||env.GITHUB_SHA||'';
 return /^[0-9a-f]{40}$/i.test(candidate)?candidate.toLowerCase():null;
}

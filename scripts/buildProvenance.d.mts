/** Typed ESM declaration for the provenance helper used by Node and CI. */
export function sourceCommit(env:{CF_PAGES_COMMIT_SHA?:string;GITHUB_SHA?:string}):string|null;

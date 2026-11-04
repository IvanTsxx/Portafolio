export interface CommitLine {
  hash: string;
  subject: string;
}

const hiddenSubject = /basement/iu;

export const parseCommitLog = (raw?: string): CommitLine[] =>
  (raw ?? "")
    .split("\n")
    .map((line) => {
      const [hash = "", ...subject] = line.split("\t");
      return { hash: hash.trim(), subject: subject.join("\t").trim() };
    })
    .filter(
      (commit) =>
        commit.hash.length > 0 &&
        commit.subject.length > 0 &&
        !hiddenSubject.test(commit.subject)
    );

export const siteRevision = process.env.NEXT_PUBLIC_GIT_SHA || "local";

export const recentCommits = parseCommitLog(process.env.NEXT_PUBLIC_GIT_LOG);

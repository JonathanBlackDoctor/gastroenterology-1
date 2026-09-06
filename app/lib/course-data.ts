import { env } from "cloudflare:workers";
import type { CourseManifest } from "./types";

const EMPTY_COURSE: CourseManifest = {
  schemaVersion: 1,
  slug: "setup-required",
  name: "학습 블록",
  cycleLabel: "데이터 연결 대기",
  timezone: "Asia/Seoul",
  sourceVersion: "none",
  sessions: [],
  sourceGroups: [],
  exam: null,
};

function getVariable(name: string): string | undefined {
  try {
    const workerEnv = env as unknown as Record<string, unknown>;
    const value = workerEnv[name];
    if (typeof value === "string" && value.trim()) return value;
  } catch {
    // Local rendering can run without the Cloudflare module context.
  }
  const value = process.env[name];
  return value?.trim() ? value : undefined;
}

function validateManifest(value: unknown): CourseManifest {
  if (!value || typeof value !== "object") throw new Error("manifest is not an object");
  const manifest = value as Partial<CourseManifest>;
  if (
    manifest.schemaVersion !== 1 ||
    typeof manifest.slug !== "string" ||
    typeof manifest.name !== "string" ||
    !Array.isArray(manifest.sessions) ||
    !Array.isArray(manifest.sourceGroups)
  ) {
    throw new Error("manifest schema is invalid");
  }
  return manifest as CourseManifest;
}

async function getManifestFromPrivateRepository(): Promise<CourseManifest | null> {
  const token = getVariable("GITHUB_DATA_TOKEN");
  const repository = getVariable("GITHUB_DATA_REPOSITORY");
  const path = getVariable("GITHUB_DATA_PATH") ?? "courses/current.json";
  if (!token || !repository) return null;

  const response = await fetch(
    `https://api.github.com/repos/${repository}/contents/${path}`,
    {
      headers: {
        Accept: "application/vnd.github.raw+json",
        Authorization: `Bearer ${token}`,
        "User-Agent": "study-cycle-site",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      next: { revalidate: 60 },
    },
  );
  if (!response.ok) throw new Error(`private data repository returned ${response.status}`);
  return validateManifest(await response.json());
}

export async function getCourseManifest(): Promise<CourseManifest> {
  const base64Manifest = getVariable("COURSE_MANIFEST_BASE64");
  if (base64Manifest) {
    const decoded = Buffer.from(base64Manifest, "base64").toString("utf-8");
    return validateManifest(JSON.parse(decoded));
  }
  const inlineManifest = getVariable("COURSE_MANIFEST_JSON");
  if (inlineManifest) return validateManifest(JSON.parse(inlineManifest));

  try {
    const remote = await getManifestFromPrivateRepository();
    if (remote) return remote;
  } catch (error) {
    console.error("Unable to load private course data", error);
  }

  return EMPTY_COURSE;
}

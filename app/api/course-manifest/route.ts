import { env } from "cloudflare:workers";
import { validateManifest } from "../../lib/course-data";

const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS course_manifests (
    course_slug TEXT PRIMARY KEY NOT NULL,
    manifest_json TEXT NOT NULL,
    updated_by TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`;

function userId(request: Request) {
  const authenticated = request.headers.get("oai-authenticated-user-id");
  if (authenticated) return authenticated;
  const host = new URL(request.url).hostname;
  if (host === "localhost" || host === "127.0.0.1") return "local-preview";
  return null;
}

export async function POST(request: Request) {
  const owner = userId(request);
  if (!owner) return Response.json({ error: "authentication required" }, { status: 401 });

  try {
    const manifest = validateManifest(await request.json());
    const db = env.DB as D1Database | undefined;
    if (!db) throw new Error("D1 binding DB is unavailable");
    await db.prepare(CREATE_TABLE_SQL).run();
    const updatedAt = new Date().toISOString();
    await db.prepare(
      `INSERT INTO course_manifests (course_slug, manifest_json, updated_by, updated_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(course_slug) DO UPDATE SET
         manifest_json = excluded.manifest_json,
         updated_by = excluded.updated_by,
         updated_at = excluded.updated_at`,
    ).bind(manifest.slug, JSON.stringify(manifest), owner, updatedAt).run();
    return Response.json({ courseSlug: manifest.slug, updatedAt });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "manifest import failed" },
      { status: 400 },
    );
  }
}

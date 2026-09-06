import { env } from "cloudflare:workers";
import { STUDY_ITEM_KEYS, type StudyItemKey } from "../../lib/types";

const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS progress_counts (
    user_id TEXT NOT NULL,
    course_slug TEXT NOT NULL,
    session_id TEXT NOT NULL,
    item_key TEXT NOT NULL,
    count INTEGER NOT NULL DEFAULT 0 CHECK (count >= 0),
    updated_at TEXT NOT NULL,
    PRIMARY KEY (user_id, course_slug, session_id, item_key)
  )
`;

function userId(request: Request) {
  const authenticated = request.headers.get("oai-authenticated-user-id");
  if (authenticated) return authenticated;
  const host = new URL(request.url).hostname;
  if (host === "localhost" || host === "127.0.0.1") return "local-preview";
  return null;
}

function database(): D1Database {
  if (!env.DB) throw new Error("D1 binding DB is unavailable");
  return env.DB;
}

async function prepareDatabase(db: D1Database) {
  await db.prepare(CREATE_TABLE_SQL).run();
}

export async function GET(request: Request) {
  const owner = userId(request);
  if (!owner) return Response.json({ error: "authentication required" }, { status: 401 });
  const courseSlug = new URL(request.url).searchParams.get("course")?.trim();
  if (!courseSlug) return Response.json({ error: "course is required" }, { status: 400 });

  try {
    const db = database();
    await prepareDatabase(db);
    const result = await db.prepare(
      `SELECT session_id AS sessionId, item_key AS itemKey, count, updated_at AS updatedAt
       FROM progress_counts WHERE user_id = ? AND course_slug = ? ORDER BY session_id, item_key`,
    ).bind(owner, courseSlug).all();
    return Response.json({ rows: result.results });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "database error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const owner = userId(request);
  if (!owner) return Response.json({ error: "authentication required" }, { status: 401 });

  try {
    const payload = (await request.json()) as {
      courseSlug?: string;
      sessionId?: string;
      itemKey?: StudyItemKey;
      delta?: number;
    };
    const { courseSlug, sessionId, itemKey } = payload;
    const delta = Number(payload.delta);
    if (!courseSlug?.trim() || !sessionId?.trim() || !itemKey || !STUDY_ITEM_KEYS.includes(itemKey)) {
      return Response.json({ error: "invalid progress payload" }, { status: 400 });
    }
    if (!Number.isInteger(delta) || ![-1, 1].includes(delta)) {
      return Response.json({ error: "delta must be -1 or 1" }, { status: 400 });
    }

    const db = database();
    await prepareDatabase(db);
    const updatedAt = new Date().toISOString();
    await db.prepare(
      `INSERT INTO progress_counts (user_id, course_slug, session_id, item_key, count, updated_at)
       VALUES (?, ?, ?, ?, MAX(?, 0), ?)
       ON CONFLICT(user_id, course_slug, session_id, item_key)
       DO UPDATE SET count = MAX(0, progress_counts.count + ?), updated_at = ?`,
    ).bind(owner, courseSlug.trim(), sessionId.trim(), itemKey, delta, updatedAt, delta, updatedAt).run();
    const row = await db.prepare(
      `SELECT count, updated_at AS updatedAt FROM progress_counts
       WHERE user_id = ? AND course_slug = ? AND session_id = ? AND item_key = ?`,
    ).bind(owner, courseSlug.trim(), sessionId.trim(), itemKey).first<{ count: number; updatedAt: string }>();
    return Response.json(row ?? { count: 0, updatedAt });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "database error" }, { status: 500 });
  }
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { STUDY_ITEMS } from "../lib/study-items";
import type { CourseManifest, ProgressRow, StudyItemKey } from "../lib/types";

type ProgressMap = Record<string, Partial<Record<StudyItemKey, number>>>;
type Filter = "all" | "upcoming" | "incomplete";

function toProgressMap(rows: ProgressRow[]): ProgressMap {
  return rows.reduce<ProgressMap>((accumulator, row) => {
    accumulator[row.sessionId] ??= {};
    accumulator[row.sessionId][row.itemKey] = row.count;
    return accumulator;
  }, {});
}

function formatSchedule(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "numeric",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Seoul",
  }).format(new Date(value));
}

export function StudyTracker({ course, now }: { course: CourseManifest; now: string }) {
  const [progress, setProgress] = useState<ProgressMap>({});
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!course.sessions.length) return;
    fetch(`/api/progress?course=${encodeURIComponent(course.slug)}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("진도를 불러오지 못했습니다.");
        return response.json() as Promise<{ rows: ProgressRow[] }>;
      })
      .then(({ rows }) => setProgress(toProgressMap(rows)))
      .catch(() => setNotice("저장소 연결을 확인해 주세요. 화면은 계속 사용할 수 있습니다."));
  }, [course.slug, course.sessions.length]);

  const totals = useMemo(() => {
    const possible = course.sessions.length * STUDY_ITEMS.length;
    const covered = course.sessions.reduce(
      (sum, session) =>
        sum + STUDY_ITEMS.filter((item) => (progress[session.id]?.[item.key] ?? 0) > 0).length,
      0,
    );
    const actions = Object.values(progress).reduce(
      (sum, row) => sum + Object.values(row).reduce((inner, count) => inner + (count ?? 0), 0),
      0,
    );
    return { possible, covered, actions, percent: possible ? Math.round((covered / possible) * 100) : 0 };
  }, [course.sessions, progress]);

  const visibleSessions = useMemo(() => {
    const currentTime = new Date(now).getTime();
    const normalizedQuery = query.trim().toLocaleLowerCase("ko");
    return course.sessions.filter((session) => {
      const completed = STUDY_ITEMS.every((item) => (progress[session.id]?.[item.key] ?? 0) > 0);
      if (filter === "upcoming" && new Date(session.scheduledAt).getTime() < currentTime) return false;
      if (filter === "incomplete" && completed) return false;
      if (
        normalizedQuery &&
        !`${session.sequence} ${session.title} ${session.professor}`.toLocaleLowerCase("ko").includes(normalizedQuery)
      ) return false;
      return true;
    });
  }, [course.sessions, filter, now, progress, query]);

  async function changeCount(sessionId: string, itemKey: StudyItemKey, delta: number) {
    const current = progress[sessionId]?.[itemKey] ?? 0;
    const next = Math.max(0, current + delta);
    if (next === current) return;
    const operationKey = `${sessionId}:${itemKey}`;
    setProgress((previous) => ({
      ...previous,
      [sessionId]: { ...previous[sessionId], [itemKey]: next },
    }));
    setPendingKey(operationKey);
    setNotice(null);
    try {
      const response = await fetch("/api/progress", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ courseSlug: course.slug, sessionId, itemKey, delta }),
      });
      if (!response.ok) throw new Error("save failed");
      const payload = (await response.json()) as { count: number };
      setProgress((previous) => ({
        ...previous,
        [sessionId]: { ...previous[sessionId], [itemKey]: payload.count },
      }));
    } catch {
      setProgress((previous) => ({
        ...previous,
        [sessionId]: { ...previous[sessionId], [itemKey]: current },
      }));
      setNotice("변경을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setPendingKey(null);
    }
  }

  if (!course.sessions.length) {
    return (
      <section className="empty-state">
        <span className="eyebrow">SETUP</span>
        <h1>첫 학습 블록을 연결할 차례입니다.</h1>
        <p>비공개 시간표 데이터가 연결되면 이곳에 고정 차시와 학습 카운터가 나타납니다.</p>
      </section>
    );
  }

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">CURRENT BLOCK · {course.cycleLabel}</span>
          <h1>{course.name}</h1>
          <p>차시는 고정하고, 달라진 수업 시각만 따라갑니다. 한 번이라도 실행한 항목이 진도율에 반영됩니다.</p>
        </div>
        <div className="hero-progress" aria-label={`전체 진도 ${totals.percent}%`}>
          <div className="progress-orbit" style={{ "--progress": `${totals.percent * 3.6}deg` } as React.CSSProperties}>
            <strong>{totals.percent}%</strong>
            <span>coverage</span>
          </div>
          <div className="progress-meta">
            <span><b>{totals.covered}</b> / {totals.possible} 칸</span>
            <span><b>{totals.actions}</b>회 총 학습</span>
          </div>
        </div>
      </section>

      <section className="utility-bar" aria-label="진도표 필터">
        <div className="filter-tabs">
          {(["all", "upcoming", "incomplete"] as Filter[]).map((value) => (
            <button className={filter === value ? "filter active" : "filter"} key={value} onClick={() => setFilter(value)}>
              {{ all: "전체", upcoming: "예정", incomplete: "미완료" }[value]}
            </button>
          ))}
        </div>
        <label className="search-field">
          <span className="sr-only">차시 검색</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="제목 · 교수 검색" />
        </label>
      </section>

      {notice ? <p className="notice" role="status">{notice}</p> : null}

      <section className="session-list" aria-label="차시별 진도">
        {visibleSessions.map((session) => {
          const completedItems = STUDY_ITEMS.filter((item) => (progress[session.id]?.[item.key] ?? 0) > 0).length;
          return (
            <article className="session-card" key={session.id}>
              <div className="session-heading">
                <span className="session-number">{String(session.sequence).padStart(2, "0")}</span>
                <div className="session-title">
                  <div className="session-kicker">
                    <time dateTime={session.scheduledAt}>{formatSchedule(session.scheduledAt)}</time>
                    <span>{session.period}교시</span>
                    {session.online ? <span className="online-badge">LMS</span> : null}
                  </div>
                  <h2>{session.title}</h2>
                  <p>{session.professor} · {session.room}</p>
                  {session.changeNote ? <small className="change-note">일정 메모 · {session.changeNote}</small> : null}
                </div>
                <div className="session-score">
                  <strong>{completedItems}</strong><span>/8</span>
                </div>
              </div>
              <div className="counter-grid">
                {STUDY_ITEMS.map((item) => {
                  const count = progress[session.id]?.[item.key] ?? 0;
                  const operationKey = `${session.id}:${item.key}`;
                  return (
                    <div className={`counter counter-${item.tone} ${count > 0 ? "done" : ""}`} key={item.key}>
                      <span className="counter-label">{item.label}</span>
                      <div className="counter-controls">
                        <button disabled={pendingKey === operationKey || count === 0} onClick={() => changeCount(session.id, item.key, -1)} aria-label={`${item.label} 1회 줄이기`}>−</button>
                        <output aria-label={`${item.label} ${count}회`}>{count}</output>
                        <button disabled={pendingKey === operationKey} onClick={() => changeCount(session.id, item.key, 1)} aria-label={`${item.label} 1회 늘리기`}>＋</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>
          );
        })}
      </section>
    </>
  );
}

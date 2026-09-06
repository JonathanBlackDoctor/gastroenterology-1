import { AppShell } from "../components/app-shell";
import { getCourseManifest } from "../lib/course-data";

export const dynamic = "force-dynamic";

export default async function NotebooksPage() {
  const course = await getCourseManifest();
  return (
    <AppShell currentPath="/notebooks" courseName={course.name}>
      <section className="page-heading">
        <span className="eyebrow">NOTEBOOKLM INDEX</span>
        <h1>강의록별 노트북</h1>
        <p>한 강의록에 한 노트북. 범위 차시와 제목을 고정 이름으로 사용합니다.</p>
      </section>
      <section className="notebook-grid">
        {course.sourceGroups.map((group) => (
          <article className="notebook-card" key={group.id}>
            <div className="notebook-topline">
              <span>{group.sessionSequences.join(" · ")}차시</span>
              <span className={`status status-${group.materialStatus}`}>
                {{ waiting: "강의록 대기", ready: "생성 대기", "notebook-ready": "사용 가능", review: "확인 필요" }[group.materialStatus]}
              </span>
            </div>
            <h2>{group.notebookName}</h2>
            <p>{group.professor}</p>
            <div className="artifact-list" aria-label="노트북 생성 항목">
              <span>표준 카드 수 · 표준 난이도 플래시카드</span>
              <span>중간 난이도 · 질문 많이</span>
              <span>어려움 · 질문 많이</span>
            </div>
            {group.notebookUrl ? (
              <a className="primary-link" href={group.notebookUrl} target="_blank" rel="noreferrer">노트북 열기 ↗</a>
            ) : (
              <span className="disabled-link">링크 생성 대기</span>
            )}
          </article>
        ))}
        {!course.sourceGroups.length ? <p className="empty-inline">연결된 강의록이 아직 없습니다.</p> : null}
      </section>
    </AppShell>
  );
}

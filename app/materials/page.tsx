import { AppShell } from "../components/app-shell";
import { getCourseManifest } from "../lib/course-data";

export const dynamic = "force-dynamic";

const materialKinds = [
  { key: "warmup", label: "수업 전 예열", description: "구조 지도 · 선수 지식 · 수업에서 답을 찾을 질문" },
  { key: "recall", label: "직후 회상", description: "빈 종이 회상용 질문 · 핵심 연결 · 3분 요약" },
  { key: "noteGuide", label: "필기 정리 보조", description: "강의록 기반 구조화 요약 · 혼동 포인트 · 정리 골격" },
] as const;

export default async function MaterialsPage() {
  const course = await getCourseManifest();
  return (
    <AppShell currentPath="/materials" courseName={course.name}>
      <section className="page-heading">
        <span className="eyebrow">STUDY BRIEF ARCHIVE</span>
        <h1>수업 전후 학습 자료</h1>
        <p>알림으로 받은 자료를 놓쳐도 이곳에서 차시 순서대로 다시 볼 수 있습니다.</p>
      </section>
      <section className="material-stack">
        {course.sourceGroups.map((group) => (
          <article className="material-group" key={group.id}>
            <header>
              <span>{group.sessionSequences[0]}–{group.sessionSequences.at(-1)}차시</span>
              <div>
                <h2>{group.title}</h2>
                <p>{group.professor}</p>
              </div>
            </header>
            <div className="material-grid">
              {materialKinds.map((kind) => {
                const material = group[kind.key];
                return (
                  <section className="material-card" key={kind.key}>
                    <div>
                      <span className="material-type">{kind.label}</span>
                      <p>{kind.description}</p>
                    </div>
                    {material ? (
                      <details>
                        <summary>자료 펼치기</summary>
                        <div className="material-content">{material.content}</div>
                      </details>
                    ) : <span className="material-wait">자료 생성 대기</span>}
                  </section>
                );
              })}
            </div>
          </article>
        ))}
        {!course.sourceGroups.length ? <p className="empty-inline">강의록이 감지되면 예열·회상·필기 자료가 여기에 쌓입니다.</p> : null}
      </section>
    </AppShell>
  );
}

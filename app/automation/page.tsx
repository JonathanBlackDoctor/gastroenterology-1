import { AppShell } from "../components/app-shell";
import { ManifestUploader } from "../components/manifest-uploader";
import { getCourseManifest } from "../lib/course-data";

export const dynamic = "force-dynamic";

const steps = [
  { time: "06:00", title: "강의록 동기화", body: "Drive 새 파일과 수정본을 확인하고 고정 차시에 연결합니다." },
  { time: "06:30", title: "아침 브리핑", body: "오늘 일정, 준비 상태, 첫 수업 핵심 지도를 ChatGPT와 Telegram으로 보냅니다." },
  { time: "T−10", title: "수업 예열", body: "3분 안에 읽을 구조 지도와 수업 중 답을 찾을 질문을 보냅니다." },
  { time: "T+00", title: "직후 회상", body: "수업 종료에 맞춰 빈 종이 회상과 연결 질문을 보냅니다." },
  { time: "PC ON", title: "NotebookLM 보강", body: "Chrome이 가능한 시점에 노트북·플래시카드·퀴즈 생성을 따라잡습니다." },
];

export default async function AutomationPage() {
  const course = await getCourseManifest();
  return (
    <AppShell currentPath="/automation" courseName={course.name}>
      <section className="page-heading automation-heading">
        <span className="eyebrow">AUTOMATION PULSE</span>
        <h1>손대지 않아도 흐르는 학습 주기</h1>
        <p>시간표 변경은 차시 번호를 건드리지 않고 알림 시각과 예습 일정에만 반영합니다.</p>
      </section>
      <section className="automation-layout">
        <ol className="timeline">
          {steps.map((step, index) => (
            <li key={step.time}>
              <div className="timeline-index">{String(index + 1).padStart(2, "0")}</div>
              <div className="timeline-copy"><span>{step.time}</span><h2>{step.title}</h2><p>{step.body}</p></div>
            </li>
          ))}
        </ol>
        <aside className="rule-card">
          <span className="eyebrow">NON-NEGOTIABLE</span>
          <h2>차시는 신원,<br />시간은 일정.</h2>
          <p>새 시간표를 받아도 기존 수업은 제목·교수·원래 날짜로 매칭합니다. 날짜가 바뀌면 알림만 이동하고 번호는 그대로 둡니다.</p>
          <dl>
            <div><dt>고정</dt><dd>1–{course.sessions.length || "N"}차시</dd></div>
            <div><dt>변경</dt><dd>현재 수업 시각</dd></div>
            <div><dt>애매함</dt><dd>자동 변경 금지</dd></div>
          </dl>
        </aside>
      </section>
      <ManifestUploader />
    </AppShell>
  );
}

import { AppShell } from "../components/app-shell";
import { getCourseManifest } from "../lib/course-data";

export const dynamic = "force-dynamic";

const syncWindows = ["06:00", "12:30", "18:30", "22:30"];

export default async function UploadPage() {
  const course = await getCourseManifest();
  const folderUrl = course.driveFolderUrl;

  return (
    <AppShell currentPath="/upload" courseName={course.name}>
      <section className="page-heading upload-heading">
        <span className="eyebrow">LECTURE DROP</span>
        <h1>받은 PDF는<br />여기에 두세요.</h1>
        <p>파일을 따로 정리하거나 이름을 바꿀 필요 없이, 받은 강의록 그대로 업로드하면 차시 연결과 예습 자료 생성을 이어갑니다.</p>
      </section>

      <section className="upload-layout">
        <div className="drop-card">
          <span className="drop-card-mark" aria-hidden="true">PDF</span>
          <div>
            <span className="eyebrow">ONE-CLICK ROUTE</span>
            <h2>강의록 보관함 열기</h2>
            <p>Google Drive 폴더가 열리면 PDF를 끌어다 놓거나, 새로 만들기 → 파일 업로드를 선택하세요.</p>
          </div>
          {folderUrl ? (
            <a className="drop-link" href={folderUrl} target="_blank" rel="noreferrer">
              Drive에서 올리기 <span aria-hidden="true">↗</span>
            </a>
          ) : (
            <span className="drop-link disabled-link" aria-disabled="true">폴더 연결 대기</span>
          )}
        </div>

        <div className="upload-guide-grid">
          <article>
            <span>01</span>
            <h2>원본 파일명 유지</h2>
            <p>날짜·교시·교수명이 들어 있는 이름이 차시 자동 매칭에 가장 유용합니다.</p>
          </article>
          <article>
            <span>02</span>
            <h2>PDF만 올리기</h2>
            <p>한 파일이 여러 차시를 포함해도 괜찮습니다. 같은 자료의 수정본도 그대로 올려주세요.</p>
          </article>
          <article>
            <span>03</span>
            <h2>나머지는 자동</h2>
            <p>차시가 애매한 경우에만 확인을 요청하고, 확실한 자료는 예열·회상·필기 자료로 이어집니다.</p>
          </article>
        </div>

        <aside className="sync-strip" aria-label="강의록 확인 시각">
          <div>
            <span className="eyebrow">SYNC WINDOWS</span>
            <strong>매일 네 번 확인</strong>
          </div>
          <div className="sync-times">
            {syncWindows.map((time) => <time key={time}>{time}</time>)}
          </div>
          <p>전날 23:00까지 올해 강의록이 없으면 작년 후보를 함께 알리고, 당일 01:00에도 없으면 작년 자료를 대신 사용합니다.</p>
        </aside>
      </section>
    </AppShell>
  );
}

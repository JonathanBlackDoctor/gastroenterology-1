"use client";

import { useState } from "react";

export function ManifestUploader() {
  const [message, setMessage] = useState("JSON 파일을 선택하면 소유자 전용 D1에 저장됩니다.");
  const [busy, setBusy] = useState(false);

  async function upload(file: File) {
    setBusy(true);
    setMessage("데이터를 검증하고 동기화하는 중…");
    try {
      const manifest = JSON.parse(await file.text());
      const response = await fetch("/api/course-manifest", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(manifest),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "동기화에 실패했습니다.");
      setMessage("동기화 완료. 새로고침하면 최신 시간표와 자료가 반영됩니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "동기화에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="manifest-uploader">
      <div>
        <span className="eyebrow">OWNER DATA SYNC</span>
        <h2>비공개 학습 데이터 동기화</h2>
        <p>{message}</p>
      </div>
      <label className={busy ? "upload-button disabled" : "upload-button"}>
        {busy ? "동기화 중" : "매니페스트 선택"}
        <input
          accept="application/json,.json"
          disabled={busy}
          type="file"
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            if (file) void upload(file);
            event.currentTarget.value = "";
          }}
        />
      </label>
    </section>
  );
}

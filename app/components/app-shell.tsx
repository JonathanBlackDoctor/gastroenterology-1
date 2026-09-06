import Link from "next/link";
import type { ReactNode } from "react";

const navigation = [
  { href: "/", label: "진도" },
  { href: "/upload", label: "강의록 올리기" },
  { href: "/notebooks", label: "노트북 LM" },
  { href: "/materials", label: "학습 자료" },
  { href: "/automation", label: "자동화" },
];

export function AppShell({
  children,
  currentPath,
  courseName,
}: {
  children: ReactNode;
  currentPath: string;
  courseName: string;
}) {
  return (
    <div className="site-frame">
      <header className="topbar">
        <Link className="brand" href="/" aria-label="진도실 홈">
          <span className="brand-mark" aria-hidden="true">進</span>
          <span>
            <strong>진도실</strong>
            <small>{courseName}</small>
          </span>
        </Link>
        <nav className="nav" aria-label="주요 메뉴">
          {navigation.map((item) => (
            <Link
              className={currentPath === item.href ? "nav-link active" : "nav-link"}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main>{children}</main>
      <footer>
        <span>개인 학습용 · ChatGPT 로그인으로 보호됨</span>
        <span>Asia/Seoul</span>
      </footer>
    </div>
  );
}

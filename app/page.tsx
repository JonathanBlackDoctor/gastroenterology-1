import { getCourseManifest } from "./lib/course-data";
import { AppShell } from "./components/app-shell";
import { StudyTracker } from "./components/study-tracker";

export const dynamic = "force-dynamic";

export default async function Home() {
  const course = await getCourseManifest();

  return (
    <AppShell currentPath="/" courseName={course.name}>
      <StudyTracker course={course} now={new Date().toISOString()} />
    </AppShell>
  );
}

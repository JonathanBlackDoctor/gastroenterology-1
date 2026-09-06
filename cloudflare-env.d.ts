declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    COURSE_MANIFEST_JSON?: string;
    COURSE_MANIFEST_BASE64?: string;
    GITHUB_DATA_TOKEN?: string;
    GITHUB_DATA_REPOSITORY?: string;
    GITHUB_DATA_PATH?: string;
  }
}

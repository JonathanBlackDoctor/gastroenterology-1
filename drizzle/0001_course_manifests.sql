CREATE TABLE `course_manifests` (
	`course_slug` text PRIMARY KEY NOT NULL,
	`manifest_json` text NOT NULL,
	`updated_by` text NOT NULL,
	`updated_at` text NOT NULL
);

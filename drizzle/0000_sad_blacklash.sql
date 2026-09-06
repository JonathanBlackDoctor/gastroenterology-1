CREATE TABLE `progress_counts` (
	`user_id` text NOT NULL,
	`course_slug` text NOT NULL,
	`session_id` text NOT NULL,
	`item_key` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`user_id`, `course_slug`, `session_id`, `item_key`)
);

CREATE TABLE `lookups` (
	`id` text PRIMARY KEY NOT NULL,
	`vin` text NOT NULL,
	`type` text NOT NULL,
	`email` text,
	`make` text,
	`model` text,
	`year` integer,
	`country` text,
	`ip_hash` text,
	`records_found` integer,
	`status` text DEFAULT 'ok',
	`test_mode` integer DEFAULT false,
	`request_id` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE INDEX `lookups_vin_idx` ON `lookups` (`vin`);--> statement-breakpoint
CREATE INDEX `lookups_type_idx` ON `lookups` (`type`);--> statement-breakpoint
CREATE INDEX `lookups_email_idx` ON `lookups` (`email`);--> statement-breakpoint
CREATE INDEX `lookups_created_idx` ON `lookups` (`created_at`);
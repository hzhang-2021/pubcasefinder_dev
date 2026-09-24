DROP TABLE IF EXISTS `panelsearch_nando_panel_version_root_trace`;
CREATE TABLE `panelsearch_nando_panel_version_root_trace` (
  `panel_id` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `root_panel_id` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  KEY `idx_pvr_pid_rpid` (`panel_id`, `root_panel_id`),
  KEY `idx_pvr_pid` (`panel_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

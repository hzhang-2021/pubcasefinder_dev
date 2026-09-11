CREATE TABLE `panelsearch_nando_panel_version` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `panel_id` int(11) NOT NULL,
  `panel_version` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_type` enum('1','2','3','4') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '3',
  `isValid` enum('YES','NO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'YES',
  `modified_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_panel_version_latest` (`panel_id`,`isValid`,`created_at`),
  KEY `idx_panel_version_id_valid` (`id`,`isValid`),
  CONSTRAINT `panelsearch_nando_panel_version_ibfk_1` FOREIGN KEY (`panel_id`) REFERENCES `panelsearch_nando_panel` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci

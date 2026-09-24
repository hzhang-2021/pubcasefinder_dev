DROP TABLE IF EXISTS `panelsearch_nando_panel_version`;
CREATE TABLE `panelsearch_nando_panel_version` (

  `panel_version_id` bigint NOT NULL AUTO_INCREMENT,

  `root_panel_id` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,

  `ontology_id`         int(11) NOT NULL,

  `major_version` int NOT NULL,

  `minor_version` int NOT NULL,

  `comment` text COLLATE utf8mb4_unicode_ci,

  `is_deleted` enum('YES','NO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NO',

  `is_latest`  enum('YES','NO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'YES',

  `update_type` enum('major','minor','ontology') COLLATE utf8mb4_unicode_ci NOT NULL,

  `status` enum('draft','released') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',

  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,

  `modified_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`panel_version_id`),
  UNIQUE KEY (`root_panel_id`, `major_version`, `minor_version`),
  KEY `idx_panel_version_id_valid` (`root_panel_id`,`is_deleted`),
  KEY `idx_panel_version_latest` (`root_panel_id`,`is_latest`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

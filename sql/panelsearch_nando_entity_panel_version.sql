
DROP TABLE IF EXISTS `panelsearch_nando_entity_panel_version`;
CREATE TABLE `panelsearch_nando_entity_panel_version` (
  `entity_id`        bigint NOT NULL,
  `panel_version_id` bigint NOT NULL,
  `created_at`       timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`entity_id`,`panel_version_id`),
  KEY idx_entity_id (`entity_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

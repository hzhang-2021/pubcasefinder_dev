

DROP TABLE IF EXISTS `panelsearch_nando_entity_review_panel_version`;
CREATE TABLE `panelsearch_nando_entity_review_panel_version` (
  `review_id` bigint NOT NULL,
  `panel_version_id` bigint NOT NULL,
  `created_at`       timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`review_id`,`panel_version_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

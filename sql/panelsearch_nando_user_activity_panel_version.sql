DROP TABLE IF EXISTS `panelsearch_nando_user_activity_panel_version`;
CREATE TABLE `panelsearch_nando_user_activity_panel_version` (
  `activity_id`  bigint NOT NULL,
  `panel_version_id` bigint NOT NULL,
  PRIMARY KEY (`activity_id`,`panel_version_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

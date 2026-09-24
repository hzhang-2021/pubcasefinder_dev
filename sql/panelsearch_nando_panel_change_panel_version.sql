DROP TABLE IF EXISTS `panelsearch_nando_panel_change_panel_version`;
CREATE TABLE `panelsearch_nando_panel_change_panel_version` (
  `panel_change_id`  bigint NOT NULL,
  `panel_version_id` bigint NOT NULL,
  PRIMARY KEY (`panel_change_id`,`panel_version_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

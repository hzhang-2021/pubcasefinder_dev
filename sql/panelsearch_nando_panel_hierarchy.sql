
DROP TABLE IF EXISTS `panelsearch_nando_panel_hierarchy`;
CREATE TABLE `panelsearch_nando_panel_hierarchy` (
  `panel_id` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `parent_panel_id` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  UNIQUE KEY `X_psn_panel_hierarchy` (`panel_id`,`parent_panel_id`),
  KEY `idx_hierarchy_parent_panel` (`parent_panel_id`,`panel_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

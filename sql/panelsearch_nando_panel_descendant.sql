

DROP TABLE IF EXISTS `panelsearch_nando_panel_descendant`;
CREATE TABLE `panelsearch_nando_panel_descendant` (
  `panel_id` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descendant_panel_id` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  UNIQUE KEY `X_psn_panel_descendant` (`panel_id`,`descendant_panel_id`),
  KEY `X_psn_panel_id` (`panel_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

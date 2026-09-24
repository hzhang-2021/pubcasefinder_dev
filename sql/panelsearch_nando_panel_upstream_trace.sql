
DROP TABLE IF EXISTS `panelsearch_nando_panel_upstream_trace`;
CREATE TABLE `panelsearch_nando_panel_upstream_trace` (
  `panel_id` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `trace` json,
  PRIMARY KEY (`panel_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

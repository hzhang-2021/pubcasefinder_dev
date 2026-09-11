CREATE TABLE `panelsearch_nando_panel_hierarchy` (
  `panel_id` int(10) NOT NULL,
  `parent_panel_id` int(10) NOT NULL,
  UNIQUE KEY `X_psn_panel_hierarchy` (`panel_id`,`parent_panel_id`),
  KEY `idx_hierarchy_parent_panel` (`parent_panel_id`,`panel_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
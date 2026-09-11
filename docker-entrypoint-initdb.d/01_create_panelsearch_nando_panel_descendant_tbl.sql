CREATE TABLE `panelsearch_nando_panel_descendant` (
  `panel_id` int(10) NOT NULL,
  `descendant_panel_id` int(10) NOT NULL,
  UNIQUE KEY `X_psn_panel_descendant` (`panel_id`,`descendant_panel_id`),
  KEY `panel_id_2` (`panel_id`),
  KEY `idx_descendant_panel` (`panel_id`,`descendant_panel_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
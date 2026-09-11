CREATE TABLE `panelsearch_nando_group_panel` (
  `group_id` int(11) NOT NULL,
  `panel_id` int(11) NOT NULL,
  PRIMARY KEY (`group_id`,`panel_id`),
  KEY `panelsearch_nando_group_panel_ibfk_1` (`panel_id`),
  KEY `idx_group_panel_group_id` (`group_id`),
  CONSTRAINT `panelsearch_nando_group_panel_ibfk_1` FOREIGN KEY (`panel_id`) REFERENCES `panelsearch_nando_panel` (`id`),
  CONSTRAINT `panelsearch_nando_group_panel_ibfk_2` FOREIGN KEY (`group_id`) REFERENCES `panelsearch_nando_group` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
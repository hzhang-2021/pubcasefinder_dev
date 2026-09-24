
DROP TABLE IF EXISTS `panelsearch_nando_group_panel`;
CREATE TABLE `panelsearch_nando_group_panel` (
  `group_id` int(11) NOT NULL,
  `panel_id` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`group_id`,`panel_id`),
  KEY `idx_group_panel_group_id` (`group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

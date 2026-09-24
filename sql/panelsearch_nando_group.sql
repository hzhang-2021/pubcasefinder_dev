
DROP TABLE IF EXISTS `panelsearch_nando_group`;
CREATE TABLE `panelsearch_nando_group` (
  `group_id` int(11) NOT NULL AUTO_INCREMENT,
  `group_title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `isValid` enum('YES','NO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'YES',
  PRIMARY KEY (`group_id`),
  KEY `created_by` (`created_by`),
  KEY `idx_group_valid_title_id` (`isValid`,`group_title`,`group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

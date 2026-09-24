
DROP TABLE IF EXISTS `panelsearch_nando_group_user`;
CREATE TABLE `panelsearch_nando_group_user` (
  `group_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `user_role` enum('reviewer','curator') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'reviewer',
  PRIMARY KEY (`group_id`,`user_id`),
  KEY `idx_group_user_group_id` (`group_id`),
  KEY `idx_gu_user` (`user_id`),
  KEY `idx_gu_user_role` (`user_id`,`user_role`),
  KEY `idx_group_user_user_role_group` (`user_id`,`user_role`,`group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

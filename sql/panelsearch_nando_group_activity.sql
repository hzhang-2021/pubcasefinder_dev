
DROP TABLE IF EXISTS `panelsearch_nando_group_activity`;
CREATE TABLE `panelsearch_nando_group_activity` (
  `group_activity_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `group_id` int(11) NOT NULL,
  `target_user_id` int(11) NOT NULL,
  `admin_user_id` int(11) NOT NULL,
  `action` enum('add','change','remove') NOT NULL DEFAULT 'add',
  `user_role_from` enum('reviewer','curator') DEFAULT NULL,
  `user_role_to` enum('reviewer','curator') DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`group_activity_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

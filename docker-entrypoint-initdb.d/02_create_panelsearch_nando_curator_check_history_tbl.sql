CREATE TABLE `panelsearch_nando_curator_check_history` (
  `user_id` int(11) NOT NULL,
  `activity_id` bigint(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`activity_id`),
  KEY `activity_id` (`activity_id`),
  CONSTRAINT `panelsearch_nando_curator_check_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user_info_psn` (`id`),
  CONSTRAINT `panelsearch_nando_curator_check_history_ibfk_2` FOREIGN KEY (`activity_id`) REFERENCES `panelsearch_nando_user_activity` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
DROP TABLE IF EXISTS `panelsearch_nando_curator_check_history`;
CREATE TABLE `panelsearch_nando_curator_check_history` (
  `user_id` int(11) NOT NULL,
  `activity_id` bigint(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`activity_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--

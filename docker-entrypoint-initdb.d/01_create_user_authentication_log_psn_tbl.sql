CREATE TABLE `user_authentication_log_psn` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `result` enum('success','fail') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'success',
  `action` enum('login','logout') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'login',
  `reason` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

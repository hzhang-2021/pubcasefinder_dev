CREATE TABLE `user_status` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status_group` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `group_label` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed data from utils/init_auth_tables.py.
INSERT IGNORE INTO `user_status` (`id`, `name`, `status_group`, `group_label`) VALUES
(5, 'status-deleted', '5,10', '削除'),
(10, 'status-deleted_to_go', '5,10', '削除'),
(12, 'status-blocked', '12,14', '停止'),
(14, 'status-blocked_to_go', '12,14', '停止'),
(15, 'status-rejected', '15,20', '拒否'),
(20, 'status-rejected_to_go', '15,20', '拒否'),
(25, 'status-cancelled', '25,30', '退会'),
(30, 'status-cancelled_to_go', '25,20', '退会'),
(35, 'status-expired', '35', '無効'),
(40, 'status-registed', '40,45,50', '承認'),
(45, 'status-reset_expired_date', '40,45,50', '承認'),
(50, 'status-authenticated', '40,45,50', '承認'),
(55, 'status-passed', '55,60', '承認'),
(60, 'status-passed_to_go', '55,60', '承認');

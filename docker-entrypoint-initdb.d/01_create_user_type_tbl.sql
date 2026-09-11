CREATE TABLE `user_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed data from utils/init_auth_tables.py.
SET @OLD_SQL_MODE=@@SESSION.SQL_MODE;
SET SESSION SQL_MODE=IF(
  FIND_IN_SET('NO_AUTO_VALUE_ON_ZERO', @@SESSION.SQL_MODE),
  @@SESSION.SQL_MODE,
  IF(@@SESSION.SQL_MODE = '', 'NO_AUTO_VALUE_ON_ZERO', CONCAT(@@SESSION.SQL_MODE, ',NO_AUTO_VALUE_ON_ZERO'))
);

INSERT IGNORE INTO `user_type` (`id`, `name`, `description`) VALUES
(0, 'public user', 'Guest user'),
(1, 'reviewer', 'User can input review for entity'),
(2, 'curator', 'User can modify entity definition'),
(3, 'administrator', 'System administrator'),
(4, 'researcher', 'Reasearcher user'),
(5, 'provider', 'Provider user');

SET SESSION SQL_MODE=@OLD_SQL_MODE;

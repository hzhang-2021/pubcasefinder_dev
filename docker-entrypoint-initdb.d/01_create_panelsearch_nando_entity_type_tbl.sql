CREATE TABLE `panelsearch_nando_entity_type` (
  `entity_type_id` int(10) NOT NULL,
  `entity_type_name` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`entity_type_id`),
  UNIQUE KEY `X_psn_entity_type_id` (`entity_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `panelsearch_nando_entity_type` 
(`entity_type_id`, `entity_type_name`)
VALUES 
(1,'Gene'),
(2,'STR'),
(3,'Region');


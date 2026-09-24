

DROP TABLE IF EXISTS `panelsearch_nando_entity_rating`;
CREATE TABLE `panelsearch_nando_entity_rating` (
  `rating_id` int(11) NOT NULL,
  `rating_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`rating_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES `panelsearch_nando_entity_rating` WRITE;
INSERT INTO `panelsearch_nando_entity_rating` 
VALUES 
(10,'Definitive'),
(20,'Strong'),
(30,'Moderate'),
(40,'Supportive'),
(50,'Limited'),
(60,'Disputed'),
(70,'Refuted'),
(80,'Animal'),
(90,'No known'),
(100,'No rating');
UNLOCK TABLES;

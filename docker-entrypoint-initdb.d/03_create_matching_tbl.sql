CREATE TABLE `matching` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `source_submission_id` int(11) NOT NULL,
  `target_submission_id` int(11) NOT NULL,
  `medical_rule` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phenotype_rule` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ignored',
  `genotype_rule` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `medical_match` tinyint(1) NOT NULL,
  `phenotype_match` tinyint(1) NOT NULL DEFAULT 0,
  `genotype_match` tinyint(1) NOT NULL,
  `score` int(11) NOT NULL,
  `date` date NOT NULL,
  `is_read` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `source_submission_id` (`source_submission_id`),
  KEY `target_submission_id` (`target_submission_id`),
  CONSTRAINT `matching_ibfk_1` FOREIGN KEY (`source_submission_id`) REFERENCES `submission` (`id`),
  CONSTRAINT `matching_ibfk_2` FOREIGN KEY (`target_submission_id`) REFERENCES `submission` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=397 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

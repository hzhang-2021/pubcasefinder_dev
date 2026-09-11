CREATE TABLE `panelsearch_nando_entity_review_comment` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `review_id` bigint(20) NOT NULL,
  `original_review_id` bigint(20) NOT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modified_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `isValid` enum('YES','NO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'YES',
  PRIMARY KEY (`id`),
  KEY `idx_review_comment_entity_valid` (`review_id`,`isValid`),
  KEY `idx_comment_ori_valid` (`original_review_id`,`isValid`),
  KEY `idx_comment_valid_review_created` (`isValid`,`review_id`,`created_at`),
  CONSTRAINT `panelsearch_nando_entity_review_comment_ibfk_1` FOREIGN KEY (`review_id`) REFERENCES `panelsearch_nando_entity_review` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
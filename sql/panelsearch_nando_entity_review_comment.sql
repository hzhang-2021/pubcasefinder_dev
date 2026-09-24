DROP TABLE IF EXISTS `panelsearch_nando_entity_review_comment`;
CREATE TABLE `panelsearch_nando_entity_review_comment` (
  `review_comment_id`  bigint(20) NOT NULL AUTO_INCREMENT,
  `review_id`          bigint(20) NOT NULL,
  `original_review_id` bigint(20) NOT NULL,
  `comment`            text COLLATE utf8mb4_unicode_ci,
  `created_at`         timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modified_at`        timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_latest`          enum('YES','NO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'YES',  
  `is_deleted`         enum('YES','NO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NO',
  `user_id`            int(11) NOT NULL,
  `user_id_change`     int(11) NOT NULL,
  PRIMARY KEY (`review_comment_id`),
  KEY `idx_review_comment_entity_valid` (`review_id`,`is_latest`),
  KEY `idx_comment_ori_valid` (`original_review_id`,`is_latest`),
  KEY `idx_comment_valid_review_created` (`is_latest`,`review_id`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `panelsearch_nando_user_activity`;
CREATE TABLE `panelsearch_nando_user_activity` (
  `activity_id`              bigint  NOT NULL AUTO_INCREMENT,
  `panel_id`                 varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `panel_type`               enum('SPECIFIED','UNSPECIFIED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `gene_symbol`              varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gene_id`                  int NOT NULL,
  `entity_type_id`           int NOT NULL,
  `entity_name`              varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_from_user`             enum('YES','NO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NO',
  `user_id`                  int     NOT NULL,
  `user_id_change`           int     NOT NULL,
  `entity_id`                bigint  DEFAULT NULL,
  `review_id`                bigint  DEFAULT NULL,
  `original_review_id`       bigint  DEFAULT NULL,
  `review_comment_id`        bigint  DEFAULT NULL,
  `former_entity_id`         bigint  DEFAULT NULL,
  `former_review_id`         bigint  DEFAULT NULL,
  `former_review_comment_id` bigint  DEFAULT NULL,
  `target`                   enum('review','definition') NOT NULL DEFAULT 'review',
  `action`                   enum('add','change','delete','classify') NOT NULL DEFAULT 'change',
  `difference`               json NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`activity_id`),
  KEY idx_activity_panel_version_entity_created (panel_id, entity_name, created_at),
  KEY idx_activity_group_fields (panel_id, gene_id, entity_type_id, entity_name, user_id, target, original_review_id, activity_id),
  KEY idx_activity_user_id (user_id),
  KEY idx_activity_multi_filter (panel_id, gene_id, entity_type_id, entity_name, user_id, target, original_review_id)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


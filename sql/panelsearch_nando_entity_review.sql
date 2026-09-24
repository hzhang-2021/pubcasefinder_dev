

DROP TABLE IF EXISTS `panelsearch_nando_entity_review`;
CREATE TABLE `panelsearch_nando_entity_review` (

  `review_id`          bigint(20) NOT NULL AUTO_INCREMENT,

  `original_review_id` bigint(20),

  `panel_id`                  varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `panel_type`                enum('SPECIFIED','UNSPECIFIED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `gene_symbol`               varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gene_id`                   int(11) NOT NULL,
  `entity_type_id`            int(11) NOT NULL,
  `entity_name`               varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_from_user`              enum('YES','NO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NO',

  `user_id`                   int(11) NOT NULL,
  `user_id_change`            int(11) NOT NULL,

  `created_at`                timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modified_at`               timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_latest`                 enum('YES','NO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'YES',  
  `is_deleted`                enum('YES','NO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NO',

  `rating_id`                 int(11) NOT NULL DEFAULT '100',
  `phenotypes`             varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `publications`           varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `mode_of_inheritances`   varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `position_chromosome`    varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `position_grch37_start`  varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `position_grch37_end`    varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `position_grch38_start`  varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `position_grch38_end`    varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `str_repeated_sequence`  varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `str_normal_repeats`     varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `str_pathogenic_repeats` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `region_haploinsufficiency_score`    varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `region_triplosensitivity_score`     varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `region_required_overlap_percentage` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `region_variant_type`    varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `region_verbose_name`    varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '',
  PRIMARY KEY (`review_id`),
  KEY `idx_review_user` (`user_id`,`review_id`),
  KEY `idx_review_panel_entity` (`panel_id`,`entity_type_id`,`entity_name`,`review_id`),
  KEY `idx_review_original_id` (`original_review_id`,`review_id`),
  KEY `idx_review_panel_valid_created` (`panel_id`,`is_latest`),
  KEY `idx_review_user_valid` (`user_id`,`is_latest`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

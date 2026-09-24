

DROP TABLE IF EXISTS `panelsearch_nando_entity`;
CREATE TABLE `panelsearch_nando_entity` (
  `entity_id`      bigint(20) NOT NULL AUTO_INCREMENT,
  `panel_id`       varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `panel_type`     enum('SPECIFIED','UNSPECIFIED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `gene_symbol`    varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gene_id`        int(11) NOT NULL,
  `entity_type_id` int(11) NOT NULL,
  `entity_name`    varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_from_user`   enum('YES','NO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NO',
  `user_id`        int(11) NULL,
  `user_id_change` int(11) NULL,
  `created_at`     timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modified_at`    timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_latest`      enum('YES','NO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'YES',
  `is_deleted`     enum('YES','NO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NO',
  `rating_id`      int(11) NOT NULL DEFAULT '100',
  `phenotypes`     text COLLATE utf8mb4_unicode_ci,
  `publications`   text COLLATE utf8mb4_unicode_ci,
  `mode_of_inheritances` text COLLATE utf8mb4_unicode_ci,
  `source`               text COLLATE utf8mb4_unicode_ci,
  `comment`              text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`entity_id`),
  KEY `idx_psn_entity_definition_grouping` (`entity_type_id`,`entity_name`,`panel_id`,`user_id`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

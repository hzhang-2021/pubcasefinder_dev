DROP TABLE IF EXISTS `panelsearch_nando_panel`;
CREATE TABLE `panelsearch_nando_panel` (
  `panel_id`            varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nando_id`            varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ontology_id`         int(11) NOT NULL,
  `panel_name_en`       varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `panel_synonym_en`    varchar(3000) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `panel_name_ja`       varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `panel_synonym_ja`    varchar(3000) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `descendant_cnt`      int(11) NOT NULL DEFAULT '0',
  `gene_symbols`        text COLLATE utf8mb4_unicode_ci,
  `gene_cnt`            int(11) NOT NULL DEFAULT '0',
  `notification_number` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `type`                enum('SPECIFIED','UNSPECIFIED', 'ROOT') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SPECIFIED',
  `depth`               int NOT NULL,
  `is_valid`            enum('YES','NO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'YES',
  `created_at`          timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`          timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`panel_id`),
  KEY `X_psn_panel_nando_id` (`nando_id`),
  KEY `X_psn_panel_name_en` (`panel_name_en`),
  KEY `X_psn_panel_name_ja` (`panel_name_ja`),
  KEY `X_psn_panel_cover` (`panel_id`,`panel_name_en`,`panel_name_ja`,`descendant_cnt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

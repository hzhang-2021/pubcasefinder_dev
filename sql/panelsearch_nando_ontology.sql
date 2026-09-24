DROP TABLE IF EXISTS `panelsearch_nando_ontology`;
CREATE TABLE `panelsearch_nando_ontology` (
  `ontology_id`          int(11) NOT NULL AUTO_INCREMENT,
  `ontology_file`        varchar(2000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `md5`                  varchar(100) NOT NULL,
  `ontology_json`        JSON NOT NULL,
  `treeview_json`        JSON NOT NULL,
  `specified_node_cnt`   int(11) NOT NULL DEFAULT '0',
  `unspecified_node_cnt` int(11) NOT NULL DEFAULT '0',
  `description`          varchar(3000) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `is_valid`             enum('YES','NO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'YES',
  `created_at`           timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ontology_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

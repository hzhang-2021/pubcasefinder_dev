DROP TABLE IF EXISTS `panelsearch_nando_panel_change`;

CREATE TABLE panelsearch_nando_panel_change (

    `panel_change_id` BIGINT AUTO_INCREMENT PRIMARY KEY,

    `panel_id` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,

    `ontology_id`         int(11) NOT NULL,

    `panel_type` enum('SPECIFIED','UNSPECIFIED', 'ROOT') COLLATE utf8mb4_unicode_ci NOT NULL,

    `change_category` ENUM('panel','relation','entity','subpanel','ontology') NOT NULL,

    `difference`  json NULL,

    `changed_by`  int NULL,

    `target_change_id` bigint NULL,

    `comment` text COLLATE utf8mb4_unicode_ci,

    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP

)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

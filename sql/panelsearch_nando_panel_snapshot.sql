
DROP TABLE IF EXISTS `panelsearch_nando_panel_snapshot`;

CREATE TABLE panelsearch_nando_panel_snapshot (
    `panel_snapshot_id`   BIGINT AUTO_INCREMENT PRIMARY KEY,
    `panel_id`            varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
    `panel_change_id`     BIGINT NOT NULL,
    `snapshot_json`       JSON,
    `created_at`          timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `panelsearch_nando_panel_upstream_trace` (
  `panel_id` int(10) NOT NULL,
  `trace_en` json DEFAULT NULL,
  `trace_ja` json DEFAULT NULL,
  PRIMARY KEY (`panel_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
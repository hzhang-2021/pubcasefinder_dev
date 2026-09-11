CREATE TABLE `ps_OntoTermMONDO_all_upstream_trace` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `OntoID` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `OntoName` varchar(300) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `OntoDescendantNum` int(10) unsigned NOT NULL DEFAULT 0,
  `trace_en` json DEFAULT NULL,
  `trace_ja` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `X_ps_OntoTermMONDO_all_upstream_trace_OntoID` (`OntoID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

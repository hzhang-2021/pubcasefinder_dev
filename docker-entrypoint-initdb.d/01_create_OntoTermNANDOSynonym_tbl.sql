CREATE TABLE `OntoTermNANDOSynonym` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `OntoVersion` varchar(30) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `OntoID` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `OntoSynonym` varchar(1000) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `X_OntoTermNANDOSynonym_OntoVersion` (`OntoVersion`),
  KEY `X_OntoTermNANDOSynonym_OntoID` (`OntoID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8
CREATE TABLE `OntoTermMONDOSynonym` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `OntoVersion` varchar(30) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `OntoID` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `OntoSynonym` varchar(1000) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `X_OntoTermMONDOSynonym_OntoVersion` (`OntoVersion`),
  KEY `X_OntoTermMONDOSynonym_OntoID` (`OntoID`)
) ENGINE=MyISAM AUTO_INCREMENT=93627 DEFAULT CHARSET=utf8
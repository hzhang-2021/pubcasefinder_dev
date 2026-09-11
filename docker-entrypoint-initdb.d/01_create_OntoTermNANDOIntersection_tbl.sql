CREATE TABLE `OntoTermNANDOIntersection` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `OntoVersion` varchar(30) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `OntoID` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `OntoIntType` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `OntoIntID` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `X_OntoTermNANDOIntersection_Unique` (`OntoVersion`,`OntoID`,`OntoIntType`,`OntoIntID`),
  KEY `X_OntoTermNANDOIntersection_OntoVersion` (`OntoVersion`),
  KEY `X_OntoTermNANDOIntersection_OntoID` (`OntoID`),
  KEY `X_OntoTermNANDOIntersection_OntoIntType` (`OntoIntType`),
  KEY `X_OntoTermNANDOIntersection_OntoIntID` (`OntoIntID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8
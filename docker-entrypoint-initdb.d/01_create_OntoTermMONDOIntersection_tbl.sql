CREATE TABLE `OntoTermMONDOIntersection` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `OntoVersion` varchar(30) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `OntoID` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `OntoIntType` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `OntoIntID` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `X_OntoTermMONDOIntersection_Unique` (`OntoVersion`,`OntoID`,`OntoIntType`,`OntoIntID`),
  KEY `X_OntoTermMONDOIntersection_OntoVersion` (`OntoVersion`),
  KEY `X_OntoTermMONDOIntersection_OntoID` (`OntoID`),
  KEY `X_OntoTermMONDOIntersection_OntoIntType` (`OntoIntType`),
  KEY `X_OntoTermMONDOIntersection_OntoIntID` (`OntoIntID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8
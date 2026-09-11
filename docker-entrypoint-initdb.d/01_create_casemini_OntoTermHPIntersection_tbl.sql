CREATE TABLE `casemini_OntoTermHPIntersection` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `OntoVersion` varchar(30) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `OntoID` varchar(100) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `OntoIntType` varchar(100) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `OntoIntID` varchar(100) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `X_casemini_OntoTermHPIntersection_Unique` (`OntoVersion`,`OntoID`,`OntoIntType`,`OntoIntID`),
  KEY `X_casemini_OntoTermHPIntersection_OntoVersion` (`OntoVersion`),
  KEY `X_casemini_OntoTermHPIntersection_OntoID` (`OntoID`),
  KEY `X_casemini_OntoTermHPIntersection_OntoIntType` (`OntoIntType`),
  KEY `X_casemini_OntoTermHPIntersection_OntoIntID` (`OntoIntID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8
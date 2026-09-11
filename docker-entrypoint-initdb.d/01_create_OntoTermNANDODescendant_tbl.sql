CREATE TABLE `OntoTermNANDODescendant` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `OntoVersion` varchar(30) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `OntoID` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `OntoDescendantID` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `X_OntoTermNANDODescendant_OntoVersion_OntoID_OntoDescendantID` (`OntoVersion`,`OntoID`,`OntoDescendantID`),
  KEY `X_OntoTermNANDODescendant_OntoVersion` (`OntoVersion`),
  KEY `X_OntoTermNANDODescendant_OntoID` (`OntoID`),
  KEY `X_OntoTermNANDODescendant_OntoDescendantID` (`OntoDescendantID`)
) ENGINE=MyISAM AUTO_INCREMENT=11897 DEFAULT CHARSET=utf8
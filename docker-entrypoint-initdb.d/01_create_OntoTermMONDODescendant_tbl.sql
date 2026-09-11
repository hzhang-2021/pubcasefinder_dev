CREATE TABLE `OntoTermMONDODescendant` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `OntoVersion` varchar(30) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `OntoID` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `OntoDescendantID` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `X_OntoTermMONDODescendant_OntoVersion_OntoID_OntoDescendantID` (`OntoVersion`,`OntoID`,`OntoDescendantID`),
  KEY `X_OntoTermMONDODescendant_OntoVersion` (`OntoVersion`),
  KEY `X_OntoTermMONDODescendant_OntoID` (`OntoID`),
  KEY `X_OntoTermMONDODescendant_OntoDescendantID` (`OntoDescendantID`)
) ENGINE=MyISAM AUTO_INCREMENT=687736 DEFAULT CHARSET=utf8
CREATE TABLE `casemini_OntoTermHPDescendant` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `OntoVersion` varchar(30) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `OntoID` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `OntoDescendantID` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `X_casemini_OntoTermHPDescendant_Version_ID_Descendant` (`OntoVersion`,`OntoID`,`OntoDescendantID`),
  KEY `X_casemini_OntoTermHPDescendant_OntoVersion` (`OntoVersion`),
  KEY `X_casemini_OntoTermHPDescendant_OntoID` (`OntoID`),
  KEY `X_casemini_OntoTermHPDescendant_OntoDescendantID` (`OntoDescendantID`)
) ENGINE=MyISAM AUTO_INCREMENT=197081 DEFAULT CHARSET=utf8
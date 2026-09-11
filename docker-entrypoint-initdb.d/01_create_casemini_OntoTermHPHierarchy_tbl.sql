CREATE TABLE `casemini_OntoTermHPHierarchy` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `OntoVersion` varchar(30) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `OntoID` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `OntoParentID` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `X_casemini_OntoTermHPHierarchy_OntoVersion_OntoID_OntoParentID` (`OntoVersion`,`OntoID`,`OntoParentID`),
  KEY `X_casemini_OntoTermHPHierarchy_OntoVersion` (`OntoVersion`),
  KEY `X_casemini_OntoTermHPHierarchy_OntoID` (`OntoID`),
  KEY `X_casemini_OntoTermHPHierarchy_OntoParentID` (`OntoParentID`)
) ENGINE=MyISAM AUTO_INCREMENT=23678 DEFAULT CHARSET=utf8
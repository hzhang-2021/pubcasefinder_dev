CREATE TABLE `ps_OntoTermMONDOHierarchy` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `OntoVersion` varchar(30) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `OntoID` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `OntoParentID` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `X_ps_OntoTermMONDOHierarchy_OntoVersion_OntoID_OntoParentID` (`OntoVersion`,`OntoID`,`OntoParentID`),
  KEY `X_ps_OntoTermMONDOHierarchy_OntoVersion` (`OntoVersion`),
  KEY `X_ps_OntoTermMONDOHierarchy_OntoID` (`OntoID`),
  KEY `X_ps_OntoTermMONDOHierarchy_OntoParentID` (`OntoParentID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

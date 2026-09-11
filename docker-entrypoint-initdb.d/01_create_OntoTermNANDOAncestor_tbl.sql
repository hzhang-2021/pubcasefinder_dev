CREATE TABLE `OntoTermNANDOAncestor` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `OntoVersion` varchar(30) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `OntoID` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `OntoAncestorID` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `X_OntoTermNANDOAncestor_OntoVersion_OntoID_OntoAncestorID` (`OntoVersion`,`OntoID`,`OntoAncestorID`),
  KEY `X_OntoTermNANDOAncestor_OntoVersion` (`OntoVersion`),
  KEY `X_OntoTermNANDOAncestor_OntoID` (`OntoID`),
  KEY `X_OntoTermNANDOAncestor_OntoAncestorID` (`OntoAncestorID`)
) ENGINE=MyISAM AUTO_INCREMENT=11836 DEFAULT CHARSET=utf8
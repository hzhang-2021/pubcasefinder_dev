CREATE TABLE `OntoTermMONDOAncestor` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `OntoVersion` varchar(30) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `OntoID` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `OntoAncestorID` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `X_OntoTermMONDOAncestor_OntoVersion_OntoID_OntoAncestorID` (`OntoVersion`,`OntoID`,`OntoAncestorID`),
  KEY `X_OntoTermMONDOAncestor_OntoVersion` (`OntoVersion`),
  KEY `X_OntoTermMONDOAncestor_OntoID` (`OntoID`),
  KEY `X_OntoTermMONDOAncestor_OntoAncestorID` (`OntoAncestorID`)
) ENGINE=MyISAM AUTO_INCREMENT=688150 DEFAULT CHARSET=utf8
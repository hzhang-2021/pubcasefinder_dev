CREATE TABLE `OntoTermMONDODbxref` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `OntoVersion` varchar(30) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `OntoID` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `OntoDbxrefName` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `OntoDbxrefDb` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `OntoDbxrefAcc` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `OntoDbxrefDescription` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `OntoDbxrefModifier` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `X_OntoTermMONDODbxref_Unique` (`OntoVersion`,`OntoID`,`OntoDbxrefName`),
  KEY `X_OntoTermMONDODbxref_OntoVersion` (`OntoVersion`),
  KEY `X_OntoTermMONDODbxref_OntoID` (`OntoID`)
) ENGINE=MyISAM AUTO_INCREMENT=146760 DEFAULT CHARSET=utf8
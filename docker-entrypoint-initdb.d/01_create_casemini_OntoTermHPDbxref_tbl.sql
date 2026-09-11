CREATE TABLE `casemini_OntoTermHPDbxref` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `OntoVersion` varchar(30) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `OntoID` varchar(100) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `OntoDbxrefName` varchar(100) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `OntoDbxrefDb` varchar(100) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `OntoDbxrefAcc` varchar(100) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `OntoDbxrefDescription` varchar(100) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `OntoDbxrefModifier` varchar(100) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `X_casemini_OntoTermHPDbxref_Unique` (`OntoVersion`,`OntoID`,`OntoDbxrefName`),
  KEY `X_casemini_OntoTermHPDbxref_OntoVersion` (`OntoVersion`),
  KEY `X_casemini_OntoTermHPDbxref_OntoID` (`OntoID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8
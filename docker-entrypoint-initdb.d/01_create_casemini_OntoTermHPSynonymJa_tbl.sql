CREATE TABLE `casemini_OntoTermHPSynonymJa` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `OntoVersion` varchar(30) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `OntoID` varchar(100) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `OntoSynonym` varchar(300) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `X_casemini_OntoTermHPSynonymJa_OntoVersion` (`OntoVersion`),
  KEY `X_casemini_OntoTermHPSynonymJa_OntoID` (`OntoID`),
  KEY `X_casemini_OntoTermHPSynonymJa_OntoSynonym` (`OntoSynonym`)
) ENGINE=MyISAM AUTO_INCREMENT=35046 DEFAULT CHARSET=utf8
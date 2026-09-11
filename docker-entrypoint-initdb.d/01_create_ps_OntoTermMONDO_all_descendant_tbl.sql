CREATE TABLE `ps_OntoTermMONDO_all_descendant` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `OntoID` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `OntoDescendantID` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `X_ps_OntoTermMONDO_all_descendant_OntoID_OntoDescendantID` (`OntoID`,`OntoDescendantID`),
  KEY `X_ps_OntoTermMONDO_all_descendant_OntoID` (`OntoID`),
  KEY `X_ps_OntoTermMONDO_all_descendant_OntoDescendantID` (`OntoDescendantID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

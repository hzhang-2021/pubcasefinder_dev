CREATE TABLE `ps_Panel` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `MondoID` varchar(30) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `MondoTerm` varchar(300) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `MondoTermSynonym` varchar(4000) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT '',
  `MondoTermJa` varchar(300) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT '',
  `GeneSymbolList` text CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `GeneCount` int(10) unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `X_ps_Panel_MondoID` (`MondoID`),
  KEY `X_ps_Panel_MondoTerm` (`MondoTerm`),
  KEY `X_ps_Panel_MondoTermJa` (`MondoTermJa`),
  KEY `X_ps_Panel_GeneCount` (`GeneCount`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

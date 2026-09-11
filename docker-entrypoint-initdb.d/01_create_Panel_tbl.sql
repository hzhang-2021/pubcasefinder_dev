SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `Panel` (
  `id`               int unsigned NOT NULL auto_increment,
  `MondoID`          varchar(30) character set utf8 collate utf8_bin NOT NULL,
  `MondoTerm`        varchar(300) character set utf8 collate utf8_bin NOT NULL,
  `MondoTermSynonym` varchar(3000) character set utf8 collate utf8_bin default '',
  `MondoTermJa`      varchar(300) character set utf8 collate utf8_bin default '',
  `GeneSymbolList`   text character set utf8 collate utf8_bin NOT NULL,
  `GeneCount`        int unsigned NOT NULL default '0',
   PRIMARY KEY  (`id`),
   KEY `X_Panel_MondoID` (`MondoID`),
   KEY `X_Panel_MondoTerm` (`MondoTerm`),
   KEY `X_Panel_MondoTermJa` (`MondoTermJa`),
   KEY `X_Panel_GeneCount` (`GeneCount`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;;
SET character_set_client = @saved_cs_client;

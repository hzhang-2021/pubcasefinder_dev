SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `IDOMIMOrphanetGene` (
  `id`     int unsigned NOT NULL auto_increment,
  `UniqID` varchar(100) character set utf8 collate utf8_bin NOT NULL,
   PRIMARY KEY  (`id`),
   KEY `X_IDOMIMOrphanetGene_UniqID` (`UniqID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;;
SET character_set_client = @saved_cs_client;

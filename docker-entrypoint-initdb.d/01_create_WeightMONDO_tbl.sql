SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `WeightMONDO` (
  `id`      int unsigned NOT NULL auto_increment,
  `MONDOID` varchar(300) character set utf8 collate utf8_bin NOT NULL,
  `HPOID`   varchar(300) character set utf8 collate utf8_bin NOT NULL,
   PRIMARY KEY  (`id`),
   KEY `X_WeightMONDO_MONDOID` (`MONDOID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;;
SET character_set_client = @saved_cs_client;

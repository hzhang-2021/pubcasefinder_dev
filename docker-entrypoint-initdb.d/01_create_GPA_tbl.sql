SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `GPA` (
  `id`         int unsigned NOT NULL auto_increment,
  `NCBIGeneID` varchar(30) character set utf8 collate utf8_bin NOT NULL,
  `HPOID`      varchar(30) character set utf8 collate utf8_bin NOT NULL,
  `MONDOID`    varchar(30) character set utf8 collate utf8_bin NOT NULL,
  `Disease`    varchar(30) character set utf8 collate utf8_bin NOT NULL,
  `Source`     varchar(30) character set utf8 collate utf8_bin NOT NULL,
   PRIMARY KEY  (`id`),
   KEY `X_GPA_NCBIGeneID` (`NCBIGeneID`),
   KEY `X_GPA_HPOID` (`HPOID`),
   KEY `X_GPA_MONDOID` (`MONDOID`),
   KEY `X_GPA_Disease` (`Disease`),
   KEY `X_GPA_Source` (`Source`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;;
SET character_set_client = @saved_cs_client;

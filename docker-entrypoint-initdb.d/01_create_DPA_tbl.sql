SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `DPA` (
  `id`        int unsigned NOT NULL auto_increment,
  `DiseaseID` varchar(30) character set utf8 collate utf8_bin NOT NULL,
  `HPOID`     varchar(30) character set utf8 collate utf8_bin NOT NULL,
  `Disease`   varchar(30) character set utf8 collate utf8_bin NOT NULL,
  `Source`    varchar(30) character set utf8 collate utf8_bin NOT NULL,
   PRIMARY KEY  (`id`),
   KEY `X_DPA_DiseaseID` (`DiseaseID`),
   KEY `X_DPA_HPOID` (`HPOID`),
   KEY `X_DPA_Disease` (`Disease`),
   KEY `X_DPA_Source` (`Source`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;;
SET character_set_client = @saved_cs_client;

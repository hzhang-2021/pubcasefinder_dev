SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `CasePheno` (
  `id`         int unsigned NOT NULL auto_increment,
  `CaseID`     varchar(300) character set utf8 collate utf8_bin NOT NULL,
  `OntoIDHP`   varchar(300) character set utf8 collate utf8_bin NOT NULL,
  `Frequency`  varchar(30) character set utf8 collate utf8_bin,
  `Source`     varchar(30) character set utf8 collate utf8_bin NOT NULL,
   PRIMARY KEY  (`id`),
   KEY `X_CasePheno_CaseID` (`CaseID`),
   KEY `X_CasePheno_OntoIDHP` (`OntoIDHP`),
   KEY `X_CasePheno_Frequency` (`Frequency`),
   KEY `X_CasePheno_Source` (`Source`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;;
SET character_set_client = @saved_cs_client;

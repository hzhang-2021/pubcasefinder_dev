SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `OpenCase` (
  `id`                  int unsigned NOT NULL auto_increment,
  `CaseID`              varchar(300) character set utf8 collate utf8_bin NOT NULL,
  `Source`              varchar(3000) character set utf8 collate utf8_bin NOT NULL,
  `AnnotationHPONum`    int unsigned NOT NULL default '0',
  `AnnotationHPOSumIC`  float unsigned NOT NULL default '0',
   PRIMARY KEY  (`id`),
   KEY `X_Case_OntoID` (`CaseID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;;
SET character_set_client = @saved_cs_client;

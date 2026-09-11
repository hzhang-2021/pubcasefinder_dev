DROP TABLE IF EXISTS `casemini_OntoTermHPIntersection`;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `casemini_OntoTermHPIntersection` (
  `id`                       int unsigned NOT NULL auto_increment,
  `OntoVersion`              varchar(30)   character set utf8 collate utf8_bin NOT NULL,
  `OntoID`                   varchar(100)  character set utf8 collate utf8_bin NOT NULL,
  `OntoIntType`              varchar(100)  character set utf8 collate utf8_bin NOT NULL,
  `OntoIntID`                varchar(100)  character set utf8 collate utf8_bin NOT NULL,
   PRIMARY KEY  (`id`),
   KEY `X_casemini_OntoTermHPIntersection_OntoVersion` (`OntoVersion`),
   KEY `X_casemini_OntoTermHPIntersection_OntoID` (`OntoID`),
   KEY `X_casemini_OntoTermHPIntersection_OntoIntType` (`OntoIntType`),
   KEY `X_casemini_OntoTermHPIntersection_OntoIntID` (`OntoIntID`),
   UNIQUE `X_casemini_OntoTermHPIntersection_Unique` (`OntoVersion`,`OntoID`,`OntoIntType`,`OntoIntID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;;
SET character_set_client = @saved_cs_client;

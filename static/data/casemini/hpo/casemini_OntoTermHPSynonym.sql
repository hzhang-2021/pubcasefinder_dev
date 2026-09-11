DROP TABLE IF EXISTS `casemini_OntoTermHPSynonym`;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `casemini_OntoTermHPSynonym` (
  `id`                       int unsigned NOT NULL auto_increment,
  `OntoVersion`              varchar(30)   character set utf8 collate utf8_bin NOT NULL,
  `OntoID`                   varchar(100)  character set utf8 collate utf8_bin NOT NULL,
  `OntoSynonym`              varchar(300)  NOT NULL,
   PRIMARY KEY  (`id`),
   KEY `X_casemini_OntoTermHPSynonym_OntoVersion` (`OntoVersion`),
   KEY `X_casemini_OntoTermHPSynonym_OntoID` (`OntoID`),
   KEY `X_casemini_OntoTermHPSynonym_OntoSynonym` (`OntoSynonym`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;;
SET character_set_client = @saved_cs_client;

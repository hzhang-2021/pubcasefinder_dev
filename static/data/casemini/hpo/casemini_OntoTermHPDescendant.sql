DROP TABLE IF EXISTS `casemini_OntoTermHPDescendant`;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `casemini_OntoTermHPDescendant` (
  `id`                       int unsigned NOT NULL auto_increment,
  `OntoVersion`              varchar(30)   character set utf8 collate utf8_unicode_ci NOT NULL,
  `OntoID`                   varchar(100)  character set utf8 collate utf8_unicode_ci NOT NULL,
  `OntoDescendantID`         varchar(100)  character set utf8 collate utf8_unicode_ci NOT NULL,
   PRIMARY KEY  (`id`),
   KEY `X_casemini_OntoTermHPDescendant_OntoVersion` (`OntoVersion`),
   KEY `X_casemini_OntoTermHPDescendant_OntoID` (`OntoID`),
   KEY `X_casemini_OntoTermHPDescendant_OntoDescendantID` (`OntoDescendantID`),
   UNIQUE `X_casemini_OntoTermHPDescendant_Version_ID_Descendant` (`OntoVersion`,`OntoID`,`OntoDescendantID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;;
SET character_set_client = @saved_cs_client;

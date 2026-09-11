DROP TABLE IF EXISTS `casemini_OntoTermHPHierarchy`;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `casemini_OntoTermHPHierarchy` (
  `id`                       int unsigned NOT NULL auto_increment,
  `OntoVersion`              varchar(30)   character set utf8 collate utf8_unicode_ci NOT NULL,
  `OntoID`                   varchar(100)  character set utf8 collate utf8_unicode_ci NOT NULL,
  `OntoParentID`             varchar(100)  character set utf8 collate utf8_unicode_ci NOT NULL,
   PRIMARY KEY  (`id`),
   KEY `X_casemini_OntoTermHPHierarchy_OntoVersion` (`OntoVersion`),
   KEY `X_casemini_OntoTermHPHierarchy_OntoID` (`OntoID`),
   KEY `X_casemini_OntoTermHPHierarchy_OntoParentID` (`OntoParentID`),
   UNIQUE `X_casemini_OntoTermHPHierarchy_OntoVersion_OntoID_OntoParentID` (`OntoVersion`,`OntoID`,`OntoParentID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;;
SET character_set_client = @saved_cs_client;

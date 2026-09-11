DROP TABLE IF EXISTS `casemini_OntoTermHPAncestor`;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `casemini_OntoTermHPAncestor` (
  `id`                       int unsigned NOT NULL auto_increment,
  `OntoVersion`              varchar(30)   character set utf8 collate utf8_unicode_ci NOT NULL,
  `OntoID`                   varchar(100)  character set utf8 collate utf8_unicode_ci NOT NULL,
  `OntoAncestorID`           varchar(100)  character set utf8 collate utf8_unicode_ci NOT NULL,
   PRIMARY KEY  (`id`),
   KEY `X_casemini_OntoTermHPAncestor_OntoVersion` (`OntoVersion`),
   KEY `X_casemini_OntoTermHPAncestor_OntoID` (`OntoID`),
   KEY `X_casemini_OntoTermHPAncestor_OntoAncestorID` (`OntoAncestorID`),
   UNIQUE `X_casemini_OntoTermHPAncestor_OntoVersion_OntoID_OntoAncestorID` (`OntoVersion`,`OntoID`,`OntoAncestorID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;;
SET character_set_client = @saved_cs_client;

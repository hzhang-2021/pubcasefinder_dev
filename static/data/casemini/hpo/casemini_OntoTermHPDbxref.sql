DROP TABLE IF EXISTS `casemini_OntoTermHPDbxref`;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `casemini_OntoTermHPDbxref` (
  `id`                       int unsigned NOT NULL auto_increment,
  `OntoVersion`              varchar(30)   character set utf8 collate utf8_bin NOT NULL,
  `OntoID`                   varchar(100)  character set utf8 collate utf8_bin NOT NULL,
  `OntoDbxrefName`           varchar(100)  character set utf8 collate utf8_bin NOT NULL,
  `OntoDbxrefDb`             varchar(100)  character set utf8 collate utf8_bin NOT NULL,
  `OntoDbxrefAcc`            varchar(100)  character set utf8 collate utf8_bin NOT NULL,
  `OntoDbxrefDescription`    varchar(100)  character set utf8 collate utf8_bin NOT NULL,
  `OntoDbxrefModifier`       varchar(100)  character set utf8 collate utf8_bin NOT NULL,
   PRIMARY KEY  (`id`),
   KEY `X_casemini_OntoTermHPDbxref_OntoVersion` (`OntoVersion`),
   KEY `X_casemini_OntoTermHPDbxref_OntoID` (`OntoID`),
   UNIQUE `X_casemini_OntoTermHPDbxref_Unique` (`OntoVersion`,`OntoID`,`OntoDbxrefName`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;;
SET character_set_client = @saved_cs_client;

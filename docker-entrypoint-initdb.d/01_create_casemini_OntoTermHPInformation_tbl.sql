SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `casemini_OntoTermHPInformation` (
  `id`                       int unsigned NOT NULL auto_increment,
  `OntoVersion`              varchar(30)   character set utf8 collate utf8_bin NOT NULL,
  `OntoID`                   varchar(100)  character set utf8 collate utf8_bin NOT NULL,
  `OntoName`                 varchar(300)  character set utf8 collate utf8_bin NOT NULL,
  `OntoSynonym`              varchar(3000) character set utf8 collate utf8_bin NOT NULL,
  `OntoDefinition`           varchar(3000) character set utf8 collate utf8_bin NOT NULL,
  `OntoComment`              varchar(3000) character set utf8 collate utf8_bin NOT NULL,
  `OntoAltIDs`               varchar(3000) character set utf8 collate utf8_bin NOT NULL,
  `OntoParentNum`            int unsigned NOT NULL default 0,
  `OntoChildNum`             int unsigned NOT NULL default 0,
  `OntoNameJa`               varchar(300)  character set utf8 collate utf8_bin NOT NULL,
  `OntoSynonymJa`            text  character set utf8 collate utf8_bin NULL ,
  `OntoDefinitionJa`         text  character set utf8 collate utf8_bin NULL ,
  `OntoCommentJa`            text  character set utf8 collate utf8_bin NULL ,
   PRIMARY KEY  (`id`),
   KEY `X_casemini_OntoTermHPInformation_OntoVersion` (`OntoVersion`),
   KEY `X_casemini_OntoTermHPInformation_OntoID` (`OntoID`),
   UNIQUE `X_casemini_OntoTermHPInformation_OntoVersion_OntoID` (`OntoVersion`,`OntoID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;;
SET character_set_client = @saved_cs_client;

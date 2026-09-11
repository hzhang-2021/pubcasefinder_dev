#ALTER TABLE OntoTermNANDO MODIFY COLUMN OntoTerm varchar(3000) character set utf8 collate utf8_unicode_ci NOT NULL;
#ALTER TABLE OntoTermNANDO MODIFY COLUMN OntoIDTerm varchar(3030) character set utf8 collate utf8_unicode_ci NOT NULL;

SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `OntoTermNANDOInformation` (
  `id`                       int unsigned NOT NULL auto_increment,
  `OntoVersion`              varchar(30)   character set utf8 collate utf8_unicode_ci NOT NULL,
  `OntoID`                   varchar(100)  character set utf8 collate utf8_unicode_ci NOT NULL,
  `OntoName`                 varchar(300)  character set utf8 collate utf8_unicode_ci NOT NULL,
  `OntoSynonym`              varchar(4000) character set utf8 collate utf8_unicode_ci NOT NULL,
  `OntoDefinition`           varchar(3000) character set utf8 collate utf8_unicode_ci NOT NULL,
  `OntoComment`              varchar(3000) character set utf8 collate utf8_unicode_ci NOT NULL,
  `OntoAltIDs`               varchar(3000) character set utf8 collate utf8_unicode_ci NOT NULL,
  `OntoParentNum`            int unsigned NOT NULL default 0,
  `OntoChildNum`             int unsigned NOT NULL default 0,
  `OntoNameJa`               varchar(400)  character set utf8 collate utf8_unicode_ci NOT NULL,
  `OntoSynonymJa`            TEXT character set utf8 collate utf8_unicode_ci NOT NULL,
  `OntoDefinitionJa`         TEXT character set utf8 collate utf8_unicode_ci NOT NULL,
  `OntoCommentJa`            TEXT character set utf8 collate utf8_unicode_ci NOT NULL,
   PRIMARY KEY  (`id`),
   KEY `X_OntoTermNANDOInformation_OntoVersion` (`OntoVersion`),
   KEY `X_OntoTermNANDOInformation_OntoID` (`OntoID`),
   UNIQUE `X_OntoTermNANDOInformation_OntoVersion_OntoID` (`OntoVersion`,`OntoID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;;
SET character_set_client = @saved_cs_client;

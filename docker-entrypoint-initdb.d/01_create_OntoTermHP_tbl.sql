SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `OntoTermHP` (
  `id`                       int unsigned NOT NULL auto_increment,
  `OntoVersion`              varchar(30) character set utf8 collate utf8_bin NOT NULL,
  `OntoID`                   varchar(300) character set utf8 collate utf8_bin NOT NULL,
  `OntoTerm`                 varchar(300) character set utf8 collate utf8_bin NOT NULL,
  `OntoIDTerm`               varchar(330) character set utf8 NOT NULL,
  `OntoType`                 varchar(30) character set utf8 collate utf8_bin NOT NULL,
  `OntoAllAnc`               varchar(3000) character set utf8 collate utf8_bin NOT NULL,
  `StopFlg`                  boolean NOT NULL default '0',
  `AbbrFlg`                  boolean NOT NULL default '0',
  `ObsoleteFlg`              boolean NOT NULL default '0',
  `PhenotypicAbnormalityFlg` boolean NOT NULL default '0',
   PRIMARY KEY  (`id`),
   KEY `X_OntoTermHP_OntoID` (`OntoID`),
   KEY `X_OntoTermHP_OntoTerm` (`OntoTerm`),
   KEY `X_OntoTermHP_OntoIDTerm` (`OntoIDTerm`),
   KEY `X_OntoTermHP_OntoType` (`OntoType`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;;
SET character_set_client = @saved_cs_client;

SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `OntoTermMONDO` (
  `id`          int unsigned NOT NULL auto_increment,
  `OntoVersion` varchar(30) character set utf8 collate utf8_bin NOT NULL,
  `OntoID`      varchar(300) character set utf8 collate utf8_bin NOT NULL,
  `OntoTerm`    varchar(3000) character set utf8 collate utf8_bin NOT NULL,
  `OntoIDTerm`  varchar(500) character set utf8 NOT NULL,
  `OntoType`    varchar(30) character set utf8 collate utf8_bin NOT NULL,
  `OntoAllAnc`  varchar(3000) character set utf8 collate utf8_bin NOT NULL,
  `StopFlg`     boolean NOT NULL default '0',
  `AbbrFlg`     boolean NOT NULL default '0',
  `ObsoleteFlg` boolean NOT NULL default '0',
  `OntoIDOMIM` varchar(300) character set utf8 collate utf8_bin,
  `OntoIDORDO` varchar(300) character set utf8 collate utf8_bin,
   PRIMARY KEY  (`id`),
   KEY `X_OntoTermMONDO_OntoID` (`OntoID`),
  # KEY `X_OntoTermMONDO_OntoIDTerm` (`OntoIDTerm`),
   KEY `X_OntoTermMONDO_OntoType` (`OntoType`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;;
SET character_set_client = @saved_cs_client;

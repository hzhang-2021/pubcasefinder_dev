SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `PMID_MESH` (
  `id`    int unsigned NOT NULL auto_increment,
  `PMID`  varchar(30) character set utf8 collate utf8_bin NOT NULL,
  `CUI`   varchar(30) character set utf8 collate utf8_bin NOT NULL,
  `SDUI`  varchar(30) character set utf8 collate utf8_bin NOT NULL,
  `STR`   varchar(1000) character set utf8 collate utf8_bin NOT NULL,
  `crFlg` boolean NOT NULL default '0',
   PRIMARY KEY  (`id`),
   KEY `X_PMID_MESH_PMID` (`PMID`),
   KEY `X_PMID_MESH_CUI` (`CUI`),
   KEY `X_PMID_MESH_SDUI` (`SDUI`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;;
SET character_set_client = @saved_cs_client;

SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `GeneName2ID` (
  `id`          int unsigned NOT NULL auto_increment,
  `GeneName`    varchar(300) character set utf8 collate utf8_bin NOT NULL,
  `ApprovedFlg` boolean NOT NULL default '0',
  `EntrezID`    int unsigned NOT NULL default '0',
  `MIM`         int unsigned NOT NULL default '0',
   PRIMARY KEY  (`id`),
   KEY `X_GeneName2ID_GeneName` (`GeneName`),
   KEY `X_GeneName2ID_EntrezID` (`EntrezID`),
   KEY `X_GeneName2ID_MIM` (`MIM`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;;
SET character_set_client = @saved_cs_client;

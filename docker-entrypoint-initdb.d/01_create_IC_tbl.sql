SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `IC` (
  `id`                int unsigned NOT NULL auto_increment,
  `CR`                varchar(30) character set utf8 collate utf8_bin NOT NULL,
  `OntoName`          varchar(30) character set utf8 collate utf8_bin NOT NULL,
  `OntoVersion`       varchar(30) character set utf8 collate utf8_bin NOT NULL,
  `OntoID`            varchar(300) character set utf8 collate utf8_bin NOT NULL,
  `NumAllDec`         int unsigned NOT NULL default '0',
  `FreqAll`           int unsigned NOT NULL default '0',
  `FreqSelf`          int unsigned NOT NULL default '0',
  `FreqAllDec`        int unsigned NOT NULL default '0',
  `FreqSelfAndAllDec` int unsigned NOT NULL default '0',
  `Prob`              float unsigned NOT NULL default '0',
  `IC`                float unsigned NOT NULL default '0',
   PRIMARY KEY  (`id`),
   KEY `X_IC_OntoName` (`OntoName`),
   KEY `X_IC_OntoID` (`OntoID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;;
SET character_set_client = @saved_cs_client;

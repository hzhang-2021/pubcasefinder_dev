SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `CaseReports` (
  `PMID`    int unsigned NOT NULL default '0',
  `PMCID`   int unsigned NOT NULL default '0',
  `absFlg`  boolean NOT NULL default '0',
  `title`   varchar(3000) character set utf8 collate utf8_bin NOT NULL,
  `authors` varchar(3000) character set utf8 collate utf8_bin NOT NULL,
  `so`      varchar(3000) character set utf8 collate utf8_bin NOT NULL,
  `pyear`   int unsigned NOT NULL default '0',
  `journal` varchar(256) character set utf8 collate utf8_bin NOT NULL,
  `country` varchar(256) character set utf8 collate utf8_bin NOT NULL,
  `species` varchar(256) character set utf8 collate utf8_bin,
  `sex`     varchar(256) character set utf8 collate utf8_bin,
  `age`     varchar(256) character set utf8 collate utf8_bin,
  `inheritanceMode` varchar(256) character set utf8 collate utf8_bin,
   PRIMARY KEY  (`PMID`),
   KEY `X_CaseReports_PMCID` (`PMCID`),
   KEY `X_CaseReports_pyear` (`pyear`),
   KEY `X_CaseReports_journal` (`journal`),
   KEY `X_CaseReports_country` (`country`),
   KEY `X_CaseReports_species` (`species`),
   KEY `X_CaseReports_sex` (`sex`),
   KEY `X_CaseReports_age` (`age`),
   KEY `X_CaseReports_inheritanceMode` (`inheritanceMode`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;;
SET character_set_client = @saved_cs_client;

SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `BibText` (
  `id`            int unsigned NOT NULL auto_increment,
  `PMID`          int unsigned NOT NULL default '0',
  `BibType`       boolean NOT NULL default '0',
  `SentenceNo`    int unsigned NOT NULL default '0',
  `Sentence`      varchar(3000) character set utf8 collate utf8_bin NOT NULL,
  `SentenceStart` int unsigned NOT NULL default '0',
  `SentenceEnd`   int unsigned NOT NULL default '0',
   PRIMARY KEY  (`id`),
   KEY `X_BibText_PMID` (`PMID`),
   KEY `X_BibText_BibType` (`BibType`),
   KEY `X_BibText_SentenceStart` (`SentenceStart`),
   KEY `X_BibText_SentenceEnd` (`SentenceEnd`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;;
SET character_set_client = @saved_cs_client;

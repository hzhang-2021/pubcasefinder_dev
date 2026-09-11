SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `AnnotOntoHP` (
  `id`                       int unsigned NOT NULL auto_increment,
  `PMID`                     int unsigned NOT NULL default '0',
  `OntoID`                   varchar(300) character set utf8 collate utf8_bin NOT NULL,
  `OntoFlg`                  boolean NOT NULL default '0',
  `PhenotypicAbnormalityFlg` boolean NOT NULL default '0',
  `BibType`                  boolean NOT NULL default '0',
  `OntoStart`                int unsigned NOT NULL default '0',
  `OntoEnd`                  int unsigned NOT NULL default '0',
  `SentenceNo`               int unsigned NOT NULL default '0',
  `OntoStartInSentence`      int unsigned NOT NULL default '0',
  `OntoEndInSentence`        int unsigned NOT NULL default '0',
  `ConceptRecognizer`        varchar(30) character set utf8 collate utf8_bin NOT NULL,
   PRIMARY KEY  (`id`),
   KEY `X_AnnotOntoHP_PMID` (`PMID`),
   KEY `X_AnnotOntoHP_OntoID` (`OntoID`),
   KEY `X_AnnotOntoHP_ConceptRecognizer` (`ConceptRecognizer`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;;
SET character_set_client = @saved_cs_client;

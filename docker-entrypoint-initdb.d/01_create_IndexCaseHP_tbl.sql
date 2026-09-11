SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `IndexCaseHP` (
  `id`                    int unsigned NOT NULL auto_increment,
  `CaseID`                varchar(300) character set utf8 collate utf8_bin NOT NULL,
  `CaseOntoIDHP`       varchar(300) character set utf8 collate utf8_bin NOT NULL,
  `CaseOntoIDHPSource` varchar(30) character set utf8 collate utf8_bin NOT NULL,
  `IndexOntoIDHP`         varchar(300) character set utf8 collate utf8_bin NOT NULL,
  `CommonRootHP`          varchar(300) character set utf8 collate utf8_bin NOT NULL,
  `CommonRootHPIC`        varchar(300) character set utf8 collate utf8_bin NOT NULL,
   PRIMARY KEY  (`id`),
   KEY `X_IndexCaseHP_CaseID` (`CaseID`),
   KEY `X_IndexCaseHP_CaseOntoIDHP` (`CaseOntoIDHP`),
   KEY `X_IndexCaseHP_CaseOntoIDHPSource` (`CaseOntoIDHPSource`),
   KEY `X_IndexCaseHP_IndexOntoIDHP` (`IndexOntoIDHP`),
   KEY `X_IndexCaseHP_CommonRootHP` (`CommonRootHP`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;;
SET character_set_client = @saved_cs_client;

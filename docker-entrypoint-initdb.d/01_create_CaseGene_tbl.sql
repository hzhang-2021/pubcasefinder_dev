SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `CaseGene` (
  `id`            int unsigned NOT NULL auto_increment,
  `CaseID`        varchar(300) character set utf8 collate utf8_bin NOT NULL,
  `Name`          varchar(300) character set utf8 collate utf8_bin NOT NULL,
  `SymbolSynonym` varchar(300) character set utf8 NOT NULL,
  `Symbol`        varchar(300) character set utf8 collate utf8_bin,
  `Synonym`       varchar(300) character set utf8 collate utf8_bin,
  `Source`        varchar(30) character set utf8 collate utf8_bin NOT NULL,
  `EntrezID`      varchar(30) character set utf8 collate utf8_bin NOT NULL,
   PRIMARY KEY  (`id`),
   KEY `X_CaseGene_CaseID` (`CaseID`),
   KEY `X_CaseGene_Name` (`Name`),
   KEY `X_CaseGene_SymbolSynonym` (`SymbolSynonym`),
   KEY `X_CaseGene_Symbol` (`Symbol`),
   KEY `X_CaseGene_Synonym` (`Synonym`),
   KEY `X_CaseGene_Source` (`Source`),
   KEY `X_CaseGene_EntrezID` (`EntrezID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;;
SET character_set_client = @saved_cs_client;

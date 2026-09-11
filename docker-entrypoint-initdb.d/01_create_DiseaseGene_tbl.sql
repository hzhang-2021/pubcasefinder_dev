SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `DiseaseGene` (
  `id`            int unsigned NOT NULL auto_increment,
  `OntoIDORDO`    varchar(300) character set utf8 collate utf8_bin NOT NULL,
  `OrphaNumber`   varchar(300) character set utf8 collate utf8_bin NOT NULL,
  `Name`          varchar(300) character set utf8 collate utf8_bin NOT NULL,
  `SymbolSynonym` varchar(300) character set utf8 NOT NULL,
  `Symbol`        varchar(300) character set utf8 collate utf8_bin,
  `Synonym`       varchar(300) character set utf8 collate utf8_bin,
  `Source`        varchar(30) character set utf8 collate utf8_bin NOT NULL,
  `EntrezID`      varchar(30) character set utf8 collate utf8_bin NOT NULL,
   PRIMARY KEY  (`id`),
   KEY `X_DiseaseGene_OntoIDORDO` (`OntoIDORDO`),
   KEY `X_DiseaseGene_OrphaNumber` (`OrphaNumber`),
   KEY `X_DiseaseGene_Name` (`Name`),
   KEY `X_DiseaseGene_SymbolSynonym` (`SymbolSynonym`),
   KEY `X_DiseaseGene_Symbol` (`Symbol`),
   KEY `X_DiseaseGene_Synonym` (`Synonym`),
   KEY `X_DiseaseGene_Source` (`Source`),
   KEY `X_DiseaseGene_EntrezID` (`EntrezID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;;
SET character_set_client = @saved_cs_client;

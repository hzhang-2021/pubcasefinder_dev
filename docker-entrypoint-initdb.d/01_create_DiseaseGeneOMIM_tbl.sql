SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `DiseaseGeneOMIM` (
  `id`            int unsigned NOT NULL auto_increment,
  `OntoIDOMIM`    varchar(300) character set utf8 collate utf8_bin NOT NULL,
  `MedGenCUI`     varchar(300) character set utf8 collate utf8_bin NOT NULL,
  `Name`          varchar(300) character set utf8 collate utf8_bin NOT NULL,
  `SymbolSynonym` varchar(300) character set utf8 NOT NULL,
  `Symbol`        varchar(300) character set utf8 collate utf8_bin,
  `Synonym`       varchar(300) character set utf8 collate utf8_bin,
  -- 以下のデータが投入できなかったため
  -- 213300  56623   phenotype        GeneMap; GeneReviews; NCBI curation    C4551568        -
  `Source`        varchar(64) character set utf8 collate utf8_bin NOT NULL,
  `EntrezID`      varchar(30) character set utf8 collate utf8_bin NOT NULL,
   PRIMARY KEY  (`id`),
   KEY `X_DiseaseGeneOMIM_OntoIDOMIM` (`OntoIDOMIM`),
   KEY `X_DiseaseGeneOMIM_MedGenCUI` (`MedGenCUI`),
   KEY `X_DiseaseGeneOMIM_Name` (`Name`),
   KEY `X_DiseaseGeneOMIM_SymbolSynonym` (`SymbolSynonym`),
   KEY `X_DiseaseGeneOMIM_Symbol` (`Symbol`),
   KEY `X_DiseaseGeneOMIM_Synonym` (`Synonym`),
   KEY `X_DiseaseGeneOMIM_Source` (`Source`),
   KEY `X_DiseaseGeneOMIM_EntrezID` (`EntrezID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;;
SET character_set_client = @saved_cs_client;

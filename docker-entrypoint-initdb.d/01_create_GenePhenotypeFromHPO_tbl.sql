SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `GenePhenotypeFromHPO` (
  `id`            int unsigned NOT NULL auto_increment,
  `EntrezID`      varchar(30) character set utf8 collate utf8_bin NOT NULL,
  `Name`          varchar(300) character set utf8 collate utf8_bin NOT NULL,
  `SymbolSynonym` varchar(300) character set utf8 NOT NULL,
  `Symbol`        varchar(300) character set utf8 collate utf8_bin,
  `Synonym`       varchar(300) character set utf8 collate utf8_bin,
  `OntoIDHP`      varchar(300) character set utf8 collate utf8_bin NOT NULL,
  `Source`        varchar(30) character set utf8 collate utf8_bin NOT NULL,
  `DiseaseID`     varchar(300) character set utf8 collate utf8_bin,
   PRIMARY KEY  (`id`),
   KEY `X_GenePhenotypeFromHPO_EntrezID` (`EntrezID`),
   KEY `X_GenePhenotypeFromHPO_Name` (`Name`),
   KEY `X_GenePhenotypeFromHPO_SymbolSynonym` (`SymbolSynonym`),
   KEY `X_GenePhenotypeFromHPO_Symbol` (`Symbol`),
   KEY `X_GenePhenotypeFromHPO_Synonym` (`Synonym`),
   KEY `X_GenePhenotypeFromHPO_OntoIDHP` (`OntoIDHP`),
   KEY `X_GenePhenotypeFromHPO_Source` (`Source`),
   KEY `X_GenePhenotypeFromHPO_DiseaseID` (`DiseaseID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;;
SET character_set_client = @saved_cs_client;

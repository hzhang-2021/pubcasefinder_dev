SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `GeneFromHPO` (
  `id`                  int unsigned NOT NULL auto_increment,
  `EntrezID`            varchar(300) character set utf8 collate utf8_bin NOT NULL,
  `Symbol`              varchar(300) character set utf8 collate utf8_bin,
  `Source`              varchar(30) character set utf8 collate utf8_bin NOT NULL,
  `DiseaseID`           varchar(300) character set utf8 collate utf8_bin,
  `AnnotationHPONum`    int unsigned NOT NULL default '0',
  `AnnotationHPOSumIC`  float unsigned NOT NULL default '0',
   PRIMARY KEY  (`id`),
   KEY `X_GeneFromHPO_EntrezID` (`EntrezID`),
   KEY `X_GenePhenotypeFromHPO_Symbol` (`Symbol`),
   KEY `X_GenePhenotypeFromHPO_Source` (`Source`),
   KEY `X_GenePhenotypeFromHPO_DiseaseID` (`DiseaseID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;;
SET character_set_client = @saved_cs_client;

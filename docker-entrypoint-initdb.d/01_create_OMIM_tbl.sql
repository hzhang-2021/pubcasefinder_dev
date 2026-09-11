SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `OMIM` (
  `id`                              int unsigned NOT NULL auto_increment,
  `OntoID`                          varchar(300) character set utf8 collate utf8_bin NOT NULL,
  `OntoTerm`                        varchar(3000) character set utf8 collate utf8_bin NOT NULL,
  `OntoTermJa`                      varchar(3000) character set utf8 collate utf8_bin,
  `Synonym`                         varchar(3000) character set utf8 collate utf8_bin,
  `SynonymJa`                       varchar(3000) character set utf8 collate utf8_bin,
  `DiseaseDefinition`               varchar(5000) character set utf8 collate utf8_bin,
  `InheritanceTypeOf`               varchar(3000) character set utf8 collate utf8_bin,
  `AnnotationHPONum`                int unsigned NOT NULL default '0',
  `AnnotationHPOSumIC`              float unsigned NOT NULL default '0',
   PRIMARY KEY  (`id`),
   KEY `X_OMIM_OntoID` (`OntoID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;;
SET character_set_client = @saved_cs_client;

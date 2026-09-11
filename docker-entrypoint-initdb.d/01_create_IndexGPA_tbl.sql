SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `IndexGPA` (
  `id`                 int unsigned NOT NULL auto_increment,
  `NCBIGeneID_MONDOID` varchar(100) character set utf8 collate utf8_bin NOT NULL,
  `GeneOntoIDHP`       varchar(100) character set utf8 collate utf8_bin NOT NULL,
  `GeneOntoIDHPSource` varchar(30) character set utf8 collate utf8_bin NOT NULL,
  `IndexOntoIDHP`      varchar(100) character set utf8 collate utf8_bin NOT NULL,
  `CommonRootHP`       varchar(100) character set utf8 collate utf8_bin NOT NULL,
  `CommonRootHPIC`     varchar(100) character set utf8 collate utf8_bin NOT NULL,
   PRIMARY KEY  (`id`),
   KEY `X_IndexGPA_NCBIGeneID_MONDOID` (`NCBIGeneID_MONDOID`),
   KEY `X_IndexGPA_GeneOntoIDHP` (`GeneOntoIDHP`),
   KEY `X_IndexGPA_GeneOntoIDHPSource` (`GeneOntoIDHPSource`),
   KEY `X_IndexGPA_IndexOntoIDHP` (`IndexOntoIDHP`),
   KEY `X_IndexGPA_CommonRootHP` (`CommonRootHP`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;;
SET character_set_client = @saved_cs_client;

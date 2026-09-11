SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `IndexDPAOMIM` (
  `id`                    int unsigned NOT NULL auto_increment,
  `DiseaseID`             varchar(100) character set utf8 collate utf8_bin NOT NULL,
  `DiseaseOntoIDHP`       varchar(100) character set utf8 collate utf8_bin NOT NULL,
  `DiseaseOntoIDHPSource` varchar(30) character set utf8 collate utf8_bin NOT NULL,
  `IndexOntoIDHP`         varchar(100) character set utf8 collate utf8_bin NOT NULL,
  `CommonRootHP`          varchar(100) character set utf8 collate utf8_bin NOT NULL,
  `CommonRootHPIC`        varchar(100) character set utf8 collate utf8_bin NOT NULL,
   PRIMARY KEY  (`id`),
   KEY `X_IndexDPAOMIM_DiseaseID` (`DiseaseID`),
   KEY `X_IndexDPAOMIM_DiseaseOntoIDHP` (`DiseaseOntoIDHP`),
   KEY `X_IndexDPAOMIM_DiseaseOntoIDHPSource` (`DiseaseOntoIDHPSource`),
   KEY `X_IndexDPAOMIM_IndexOntoIDHP` (`IndexOntoIDHP`),
   KEY `X_IndexDPAOMIM_CommonRootHP` (`CommonRootHP`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;;
SET character_set_client = @saved_cs_client;

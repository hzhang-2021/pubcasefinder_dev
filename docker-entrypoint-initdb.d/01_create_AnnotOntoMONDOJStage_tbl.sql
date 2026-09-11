SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `AnnotOntoMONDOJStage` (
  `id`        int unsigned NOT NULL auto_increment,
  `id_jstage` varchar(300) character set utf8 collate utf8_bin NOT NULL,
  `id_mondo`  varchar(300) character set utf8 collate utf8_bin NOT NULL,
   PRIMARY KEY (`id`),
   KEY `X_AnnotOntoMONDOJStage_id_jstage` (`id_jstage`),
   KEY `X_AnnotOntoMONDOJStage_id_mondo` (`id_mondo`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;;
SET character_set_client = @saved_cs_client;

SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `JStage` (
  `id`        int unsigned NOT NULL auto_increment,
  `id_jstage` varchar(256) character set utf8 collate utf8_bin NOT NULL,
  `title_ja`  varchar(3000) character set utf8 collate utf8_bin,
  `title_en`  varchar(3000) character set utf8 collate utf8_bin,
  `url_ja`    varchar(1000) character set utf8 collate utf8_bin,
  `url_en`    varchar(1000) character set utf8 collate utf8_bin,
  `pdate`     varchar(256) character set utf8 collate utf8_bin,
  `doi`       varchar(256) character set utf8 collate utf8_bin,
  `id_jglobal` varchar(256) character set utf8 collate utf8_bin,
  `journal_ja` varchar(1000) character set utf8 collate utf8_bin,
  `journal_en` varchar(1000) character set utf8 collate utf8_bin,
   PRIMARY KEY (`id`),
   KEY `X_JStage_id_jstage` (`id_jstage`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;;
SET character_set_client = @saved_cs_client;

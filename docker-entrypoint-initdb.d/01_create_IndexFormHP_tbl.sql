SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `IndexFormHP` (
  `id`        int unsigned NOT NULL auto_increment,
  `uid`       varchar(30) character set utf8 collate utf8_bin NOT NULL,
  `value`     varchar(330) character set utf8 NOT NULL,
  `uid_value` varchar(330) character set utf8 NOT NULL,
  `index_uid_value` varchar(3300) character set utf8 NOT NULL,
  `source`    varchar(30) character set utf8 collate utf8_bin NOT NULL,
   PRIMARY KEY  (`id`),
   KEY `X_IndexFormHP_uid` (`uid`),
   KEY `X_IndexFormHP_value` (`value`),
   KEY `X_IndexFormHP_uid_value` (`uid_value`),
   KEY `X_IndexFormHP_source` (`source`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;;
SET character_set_client = @saved_cs_client;

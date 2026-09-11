
DROP TABLE IF EXISTS `OntoTermMONDO_all_upstream_trace`;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `OntoTermMONDO_all_upstream_trace` (
  `id`                       int unsigned NOT NULL auto_increment,
  `OntoID`                   varchar(100)  character set utf8 collate utf8_unicode_ci NOT NULL,
  `OntoName`                 varchar(300)  character set utf8 collate utf8_unicode_ci NOT NULL,
  `OntoDescendantNum`        int unsigned NOT NULL default 0,
  `trace`                    json NULL,
   PRIMARY KEY  (`id`),
   UNIQUE KEY `X_OntoTermMONDO_all_upstream_trace_OntoID` (`OntoID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;;
SET character_set_client = @saved_cs_client;



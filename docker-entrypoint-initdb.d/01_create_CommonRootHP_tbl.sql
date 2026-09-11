SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `CommonRootHP` (
  `id`                   int unsigned NOT NULL auto_increment,
  `OntoIDHP1`            varchar(300) character set utf8 collate utf8_bin NOT NULL,
  `OntoIDHP2`            varchar(300) character set utf8 collate utf8_bin NOT NULL,
  `CommonRootOntoIDHP`   varchar(300) character set utf8 collate utf8_bin NOT NULL,
  `CommonRootOntoIDHPIC` varchar(300) character set utf8 collate utf8_bin NOT NULL,
   PRIMARY KEY  (`id`),
   KEY `X_CommonRootHP_OntoIDHP1` (`OntoIDHP1`),
   KEY `X_CommonRootHP_OntoIDHP2` (`OntoIDHP2`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;;
SET character_set_client = @saved_cs_client;

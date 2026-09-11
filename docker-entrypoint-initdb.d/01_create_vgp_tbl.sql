SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `vgp` (
  `panel_id` varchar(10) NOT NULL,
  `panel_name` varchar(100) NOT NULL,
  PRIMARY KEY (`panel_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
SET character_set_client = @saved_cs_client;

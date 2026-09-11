SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `vgpau_genes` (
  `panel_id` varchar(10) NOT NULL,
  `gene_id` varchar(20) NOT NULL,
  `gene_name` varchar(50) NOT NULL,
  PRIMARY KEY (`panel_id`,`gene_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
SET character_set_client = @saved_cs_client;

DROP TABLE IF EXISTS `casemini_omim_orpha`;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `casemini_omim_orpha` (
  `Mondo` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `disease_name_en` varchar(200) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL default '',
  `disease_name_synonym_en` varchar(3000) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL default '',
  `disease_name_ja` varchar(200) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL default '',
  `disease_name_synonym_ja` varchar(1000) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL default '',
  `OMIM` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL default '',
  `Orphanet` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL default '',
  KEY `X_casemini_omim_orpha_mondo` (`Mondo`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
SET character_set_client = @saved_cs_client;

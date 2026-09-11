SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `casemini_nando` (
  `NANDO` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `notification_number` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `disease_name_en` varchar(200) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `disease_name_synonym_en` varchar(1000) CHARACTER SET utf8 COLLATE utf8_unicode_ci NULL,
  `disease_name_ja` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `disease_name_synonym_ja` varchar(1000) CHARACTER SET utf8 COLLATE utf8_unicode_ci NULL,
  `Mondo` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NULL,
  KEY `X_casemini_nando_mondo` (`NANDO`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
SET character_set_client = @saved_cs_client;

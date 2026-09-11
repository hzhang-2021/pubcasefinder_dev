DROP TABLE IF EXISTS `casemini_icd_10`;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `casemini_icd_10` (
  `ICD-10` varchar(20) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `ICD-10_group` varchar(20) CHARACTER SET utf8 COLLATE utf8_unicode_ci NULL,
  `disease_control_number` varchar(20) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `disease_name` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  KEY `X_casemini_icd_10_ID` (`ICD-10`),
  KEY `X_casemini_icd_10_disease_name` (`disease_name`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
SET character_set_client = @saved_cs_client;

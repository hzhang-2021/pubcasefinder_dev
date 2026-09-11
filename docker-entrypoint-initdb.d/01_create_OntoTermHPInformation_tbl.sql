SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `OntoTermHPInformation` (
  `id`                       int unsigned NOT NULL auto_increment,
  `OntoVersion`              varchar(30)   character set utf8 collate utf8_bin NOT NULL,
  `OntoID`                   varchar(100)  character set utf8 collate utf8_bin NOT NULL,
  `OntoName`                 varchar(300)  character set utf8 collate utf8_bin NOT NULL,
  `OntoSynonym`              varchar(3000) character set utf8 collate utf8_bin NOT NULL,
  `OntoDefinition`           varchar(3000) character set utf8 collate utf8_bin NOT NULL,
  `OntoComment`              varchar(3000) character set utf8 collate utf8_bin NOT NULL,
  `OntoAltIDs`               varchar(3000) character set utf8 collate utf8_bin NOT NULL,
  `OntoParentNum`            int unsigned NOT NULL default 0,
  `OntoChildNum`             int unsigned NOT NULL default 0,
  `OntoNameJa`               varchar(300)  character set utf8 collate utf8_bin NOT NULL default '',
  `OntoSynonymJa`            TEXT CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `OntoDefinitionJa`            TEXT CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `OntoCommentJa`            TEXT CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
   PRIMARY KEY  (`id`),
   KEY `X_OntoTermHPInformation_OntoVersion` (`OntoVersion`),
   KEY `X_OntoTermHPInformation_OntoID` (`OntoID`),
   UNIQUE `X_OntoTermHPInformation_OntoVersion_OntoID` (`OntoVersion`,`OntoID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;;
SET character_set_client = @saved_cs_client;


SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `OntoTermHPHierarchy` (
  `id`                       int unsigned NOT NULL auto_increment,
  `OntoVersion`              varchar(30)   character set utf8 collate utf8_unicode_ci NOT NULL,
  `OntoID`                   varchar(100)  character set utf8 collate utf8_unicode_ci NOT NULL,
  `OntoParentID`             varchar(100)  character set utf8 collate utf8_unicode_ci NOT NULL,
   PRIMARY KEY  (`id`),
   KEY `X_OntoTermHPHierarchy_OntoVersion` (`OntoVersion`),
   KEY `X_OntoTermHPHierarchy_OntoID` (`OntoID`),
   KEY `X_OntoTermHPHierarchy_OntoParentID` (`OntoParentID`),
   UNIQUE `X_OntoTermHPHierarchy_OntoVersion_OntoID_OntoParentID` (`OntoVersion`,`OntoID`,`OntoParentID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;;
SET character_set_client = @saved_cs_client;


SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `OntoTermHPAncestor` (
  `id`                       int unsigned NOT NULL auto_increment,
  `OntoVersion`              varchar(30)   character set utf8 collate utf8_unicode_ci NOT NULL,
  `OntoID`                   varchar(100)  character set utf8 collate utf8_unicode_ci NOT NULL,
  `OntoAncestorID`           varchar(100)  character set utf8 collate utf8_unicode_ci NOT NULL,
   PRIMARY KEY  (`id`),
   KEY `X_OntoTermHPAncestor_OntoVersion` (`OntoVersion`),
   KEY `X_OntoTermHPAncestor_OntoID` (`OntoID`),
   KEY `X_OntoTermHPAncestor_OntoAncestorID` (`OntoAncestorID`),
   UNIQUE `X_OntoTermHPAncestor_OntoVersion_OntoID_OntoAncestorID` (`OntoVersion`,`OntoID`,`OntoAncestorID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;;
SET character_set_client = @saved_cs_client;


SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `OntoTermHPDescendant` (
  `id`                       int unsigned NOT NULL auto_increment,
  `OntoVersion`              varchar(30)   character set utf8 collate utf8_unicode_ci NOT NULL,
  `OntoID`                   varchar(100)  character set utf8 collate utf8_unicode_ci NOT NULL,
  `OntoDescendantID`         varchar(100)  character set utf8 collate utf8_unicode_ci NOT NULL,
   PRIMARY KEY  (`id`),
   KEY `X_OntoTermHPDescendant_OntoVersion` (`OntoVersion`),
   KEY `X_OntoTermHPDescendant_OntoID` (`OntoID`),
   KEY `X_OntoTermHPDescendant_OntoDescendantID` (`OntoDescendantID`),
   UNIQUE `X_OntoTermHPDescendant_OntoVersion_OntoID_OntoDescendantID` (`OntoVersion`,`OntoID`,`OntoDescendantID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;;
SET character_set_client = @saved_cs_client;


SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `OntoTermHPIntersection` (
  `id`                       int unsigned NOT NULL auto_increment,
  `OntoVersion`              varchar(30)   character set utf8 collate utf8_bin NOT NULL,
  `OntoID`                   varchar(100)  character set utf8 collate utf8_bin NOT NULL,
  `OntoIntType`              varchar(100)  character set utf8 collate utf8_bin NOT NULL,
  `OntoIntID`                varchar(100)  character set utf8 collate utf8_bin NOT NULL,
   PRIMARY KEY  (`id`),
   KEY `X_OntoTermHPIntersection_OntoVersion` (`OntoVersion`),
   KEY `X_OntoTermHPIntersection_OntoID` (`OntoID`),
   KEY `X_OntoTermHPIntersection_OntoIntType` (`OntoIntType`),
   KEY `X_OntoTermHPIntersection_OntoIntID` (`OntoIntID`),
   UNIQUE `X_OntoTermHPIntersection_Unique` (`OntoVersion`,`OntoID`,`OntoIntType`,`OntoIntID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;;
SET character_set_client = @saved_cs_client;


SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `OntoTermHPDbxref` (
  `id`                       int unsigned NOT NULL auto_increment,
  `OntoVersion`              varchar(30)   character set utf8 collate utf8_bin NOT NULL,
  `OntoID`                   varchar(100)  character set utf8 collate utf8_bin NOT NULL,
  `OntoDbxrefName`           varchar(100)  character set utf8 collate utf8_bin NOT NULL,
  `OntoDbxrefDb`             varchar(100)  character set utf8 collate utf8_bin NOT NULL,
  `OntoDbxrefAcc`            varchar(100)  character set utf8 collate utf8_bin NOT NULL,
  `OntoDbxrefDescription`    varchar(100)  character set utf8 collate utf8_bin NOT NULL,
  `OntoDbxrefModifier`       varchar(100)  character set utf8 collate utf8_bin NOT NULL,
   PRIMARY KEY  (`id`),
   KEY `X_OntoTermHPDbxref_OntoVersion` (`OntoVersion`),
   KEY `X_OntoTermHPDbxref_OntoID` (`OntoID`),
   UNIQUE `X_OntoTermHPDbxref_Unique` (`OntoVersion`,`OntoID`,`OntoDbxrefName`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;;
SET character_set_client = @saved_cs_client;


SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `OntoTermHPSynonym` (
  `id`                       int unsigned NOT NULL auto_increment,
  `OntoVersion`              varchar(30)   character set utf8 collate utf8_bin NOT NULL,
  `OntoID`                   varchar(100)  character set utf8 collate utf8_bin NOT NULL,
  `OntoSynonym`              varchar(300)  NOT NULL,
   PRIMARY KEY  (`id`),
   KEY `X_OntoTermHPSynonym_OntoVersion` (`OntoVersion`),
   KEY `X_OntoTermHPSynonym_OntoID` (`OntoID`),
   KEY `X_OntoTermHPSynonym_OntoSynonym` (`OntoSynonym`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;;
SET character_set_client = @saved_cs_client;


SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `OntoTermHPSynonymJa` (
  `id`                      int(10) unsigned NOT NULL AUTO_INCREMENT,
  `OntoVersion`             varchar(30) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `OntoID`                  varchar(100) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `OntoSynonym`             varchar(300) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `X_OntoTermHPSynonymJa_OntoVersion` (`OntoVersion`),
  KEY `X_OntoTermHPSynonymJa_OntoID` (`OntoID`),
  KEY `X_OntoTermHPSynonymJa_OntoSynonym` (`OntoSynonym`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
SET character_set_client = @saved_cs_client;

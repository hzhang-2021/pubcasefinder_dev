-- MySQL dump 10.13  Distrib 5.7.36, for Linux (x86_64)
--
-- Host: localhost    Database: pubcases
-- ------------------------------------------------------
-- Server version	5.7.36

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `casemini_OntoTermHPSynonymJa`
--

DROP TABLE IF EXISTS `casemini_OntoTermHPSynonymJa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `casemini_OntoTermHPSynonymJa` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `OntoVersion` varchar(30) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `OntoID` varchar(100) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `OntoSynonym` varchar(300) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `X_casemini_OntoTermHPSynonymJa_OntoVersion` (`OntoVersion`),
  KEY `X_casemini_OntoTermHPSynonymJa_OntoID` (`OntoID`),
  KEY `X_casemini_OntoTermHPSynonymJa_OntoSynonym` (`OntoSynonym`)
) ENGINE=MyISAM AUTO_INCREMENT=14066 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;


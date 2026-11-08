-- MySQL dump 10.13  Distrib 8.0.39, for Linux (x86_64)
--
-- Host: localhost    Database: sgf
-- ------------------------------------------------------
-- Server version	8.0.39-0ubuntu0.22.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `access_profile_transactions`
--

DROP TABLE IF EXISTS `access_profile_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `access_profile_transactions` (
  `access_profile_id` int unsigned NOT NULL,
  `transaction_id` int unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  UNIQUE KEY `profile_transaction` (`access_profile_id`,`transaction_id`),
  KEY `access_profile_transactions_transaction_id_foreign` (`transaction_id`),
  CONSTRAINT `access_profile_transactions_access_profile_id_foreign` FOREIGN KEY (`access_profile_id`) REFERENCES `access_profiles` (`id`),
  CONSTRAINT `access_profile_transactions_transaction_id_foreign` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `access_profile_transactions`
--

LOCK TABLES `access_profile_transactions` WRITE;
/*!40000 ALTER TABLE `access_profile_transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `access_profile_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `access_profiles`
--

DROP TABLE IF EXISTS `access_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `access_profiles` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(3) NOT NULL,
  `description` varchar(64) NOT NULL,
  `state` int NOT NULL DEFAULT '1',
  `created_by` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_by` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `access_profiles_code_unique` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `access_profiles`
--

LOCK TABLES `access_profiles` WRITE;
/*!40000 ALTER TABLE `access_profiles` DISABLE KEYS */;
INSERT INTO `access_profiles` VALUES (1,'001','Administrador do sistema',1,'2024-10-21 18:07:14','2024-10-21 18:07:14','2024-10-21 18:07:14','2024-10-21 18:07:14'),(2,'002','Administrador de Segurança',1,'2024-10-21 18:07:14','2024-10-21 18:07:14','2024-10-21 18:07:14','2024-10-21 18:07:14'),(3,'003','Apoio funcional',1,'2024-10-21 18:07:14','2024-10-21 18:07:14','2024-10-21 18:07:14','2024-10-21 18:07:14'),(4,'004','Gestor de Finanças',1,'2024-10-21 18:07:14','2024-10-21 18:07:14','2024-10-21 18:07:14','2024-10-21 18:07:14');
/*!40000 ALTER TABLE `access_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `account_plan_budject_entries`
--

DROP TABLE IF EXISTS `account_plan_budject_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `account_plan_budject_entries` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `start_posting_month` int NOT NULL,
  `end_posting_month` int NOT NULL,
  `reserve_percent` int NOT NULL DEFAULT '0',
  `initial_allocation` double NOT NULL,
  `final_allocation` double NOT NULL,
  `account_plan_budject_id` int unsigned NOT NULL,
  `account_plan_id` int unsigned NOT NULL,
  `parent_id` int unsigned DEFAULT NULL,
  `state` int NOT NULL DEFAULT '1',
  `created_by` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_by` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `account_plan_number` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `account_plan_budject_entries_account_plan_budject_id_foreign` (`account_plan_budject_id`),
  KEY `account_plan_budject_entries_account_plan_id_foreign` (`account_plan_id`),
  KEY `account_plan_budject_entries_parent_id_foreign` (`parent_id`),
  CONSTRAINT `account_plan_budject_entries_account_plan_budject_id_foreign` FOREIGN KEY (`account_plan_budject_id`) REFERENCES `account_plan_budjects` (`id`),
  CONSTRAINT `account_plan_budject_entries_account_plan_id_foreign` FOREIGN KEY (`account_plan_id`) REFERENCES `account_plans` (`id`),
  CONSTRAINT `account_plan_budject_entries_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `account_plan_budject_entries` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=69 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account_plan_budject_entries`
--

LOCK TABLES `account_plan_budject_entries` WRITE;
/*!40000 ALTER TABLE `account_plan_budject_entries` DISABLE KEYS */;
INSERT INTO `account_plan_budject_entries` VALUES (26,1,12,0,0,1700,1,120,NULL,1,NULL,'2024-11-04 13:54:37',NULL,'2024-11-08 18:41:11','1.0.0.0.00'),(27,1,12,0,0,1700,1,121,26,1,NULL,'2024-11-04 13:54:37',NULL,'2024-11-08 18:41:11','1.1.0.0.00'),(28,1,12,0,0,1700,1,122,27,1,NULL,'2024-11-04 13:54:37',NULL,'2024-11-08 18:41:11','1.1.1.0.00'),(29,1,12,0,0,1700,1,123,28,1,NULL,'2024-11-04 13:54:37',NULL,'2024-11-08 18:41:11','1.1.1.1.00'),(30,1,12,0,0,0,1,124,NULL,1,NULL,'2024-11-04 13:54:37',NULL,'2024-11-04 13:54:37','1.1.2.0.00'),(31,1,12,0,0,0,1,125,30,1,NULL,'2024-11-04 13:54:37',NULL,'2024-11-04 13:54:37','1.1.2.1.00'),(32,1,12,0,0,0,1,126,NULL,1,NULL,'2024-11-04 13:54:37',NULL,'2024-11-04 13:54:37','1.2.0.0.00'),(33,1,12,0,0,0,1,127,32,1,NULL,'2024-11-04 13:54:37',NULL,'2024-11-04 13:54:37','1.2.1.0.00'),(34,1,12,0,0,500,1,128,NULL,1,NULL,'2024-11-04 13:54:37',NULL,'2024-11-08 18:42:04','1.2.2.0.00'),(35,1,12,0,0,0,1,129,NULL,1,NULL,'2024-11-04 13:54:37',NULL,'2024-11-04 13:54:37','1.4.0.0.00'),(36,1,12,0,0,0,1,130,NULL,1,NULL,'2024-11-04 13:54:37',NULL,'2024-11-04 13:54:37','1.6.0.0.00'),(37,1,12,0,0,0,1,131,36,1,NULL,'2024-11-04 13:54:37',NULL,'2024-11-04 13:54:37','1.6.1.0.00'),(38,1,12,0,0,0,1,132,NULL,1,NULL,'2024-11-04 13:54:37',NULL,'2024-11-04 13:54:37','1.6.2.0.00'),(39,1,12,0,0,1555,1,133,NULL,1,NULL,'2024-11-04 13:54:37',NULL,'2024-11-08 18:43:07','2.0.0.0.00'),(40,1,12,0,0,1555,1,134,39,1,NULL,'2024-11-04 13:54:37',NULL,'2024-11-08 18:43:07','2.1.0.0.00'),(41,1,12,0,0,0,1,135,40,1,NULL,'2024-11-04 13:54:37',NULL,'2024-11-04 13:54:37','2.1.1.0.00'),(42,1,12,0,0,0,1,136,40,1,NULL,'2024-11-04 13:54:37',NULL,'2024-11-04 13:54:37','2.1.2.0.00'),(43,1,12,0,0,1555,1,137,40,1,NULL,'2024-11-04 13:54:37',NULL,'2024-11-08 18:43:07','2.1.3.0.00'),(44,10,12,0,0,1200,1,162,29,1,NULL,'2024-11-04 11:56:17',NULL,'2024-11-08 18:40:45','1.1.1.1.003'),(45,10,12,0,0,500,1,163,29,1,NULL,'2024-11-04 11:57:10',NULL,'2024-11-08 18:41:11','1.1.1.1.004'),(46,10,12,0,0,0,1,164,31,1,NULL,'2024-11-04 12:02:42',NULL,'2024-11-04 12:02:42','1.1.2.1.001'),(47,10,12,0,0,0,1,165,29,1,NULL,'2024-11-04 12:03:51',NULL,'2024-11-07 15:18:30','1.1.1.1.005'),(48,10,12,0,0,0,1,166,29,1,NULL,'2024-11-04 12:08:05',NULL,'2024-11-08 18:34:56','1.1.1.1.006'),(49,10,12,0,0,0,1,167,31,1,NULL,'2024-11-04 12:08:24',NULL,'2024-11-04 12:08:24','1.1.2.1.002'),(50,10,12,0,0,1555,1,168,43,1,NULL,'2024-11-04 12:09:50',NULL,'2024-11-08 18:43:07','2.1.3.0.001'),(51,10,12,0,0,0,1,169,43,1,NULL,'2024-11-04 12:10:51',NULL,'2024-11-04 12:10:51','2.1.3.0.002'),(52,10,12,0,0,0,1,170,42,1,NULL,'2024-11-04 12:11:06',NULL,'2024-11-04 12:11:06','2.1.2.0.001'),(53,10,12,0,0,0,1,171,33,1,NULL,'2024-11-04 12:11:23',NULL,'2024-11-04 12:11:23','1.2.1.0.001'),(54,10,12,0,0,0,1,172,33,1,NULL,'2024-11-04 12:11:31',NULL,'2024-11-04 12:11:31','1.2.1.0.002'),(55,10,12,0,0,0,1,173,37,1,NULL,'2024-11-04 12:11:39',NULL,'2024-11-04 12:11:39','1.6.1.0.001'),(56,10,12,0,0,0,1,174,31,1,NULL,'2024-11-07 15:45:22',NULL,'2024-11-07 15:45:22','1.1.2.1.003'),(57,10,12,0,0,500,1,175,34,1,NULL,'2024-11-07 15:53:08',NULL,'2024-11-08 18:42:04','1.2.2.0.002'),(58,10,12,0,0,0,1,176,37,1,NULL,'2024-11-08 18:49:06',NULL,'2024-11-08 18:49:06','1.6.1.0.002'),(59,10,12,0,0,0,1,177,31,1,NULL,'2024-11-08 18:52:19',NULL,'2024-11-08 18:52:19','1.1.2.1.004'),(60,10,12,0,0,0,1,178,34,1,NULL,'2024-11-08 19:06:06',NULL,'2024-11-08 19:06:06','1.2.2.0.003'),(61,10,12,0,0,0,1,179,43,1,NULL,'2024-11-08 19:07:11',NULL,'2024-11-08 19:07:11','2.1.3.0.003'),(62,10,12,0,0,0,1,180,42,1,NULL,'2024-11-08 19:07:22',NULL,'2024-11-08 19:07:22','2.1.2.0.002'),(63,10,12,0,0,0,1,181,43,1,NULL,'2024-11-08 19:07:39',NULL,'2024-11-08 19:07:39','2.1.3.0.004'),(64,10,12,0,0,0,1,182,41,1,NULL,'2024-11-08 19:07:46',NULL,'2024-11-08 19:07:46','2.1.1.0.001'),(65,10,12,0,0,0,1,183,33,1,NULL,'2024-11-08 19:11:07',NULL,'2024-11-08 19:11:07','1.2.1.0.003'),(66,10,12,0,0,0,1,184,43,1,NULL,'2024-11-08 19:11:14',NULL,'2024-11-08 19:11:14','2.1.3.0.005'),(67,10,12,0,0,0,1,185,42,1,NULL,'2024-11-08 19:11:20',NULL,'2024-11-08 19:11:20','2.1.2.0.003'),(68,10,12,0,0,0,1,186,33,1,NULL,'2024-11-08 19:13:00',NULL,'2024-11-08 19:13:00','1.2.1.0.004');
/*!40000 ALTER TABLE `account_plan_budject_entries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `account_plan_budject_entries_entry`
--

DROP TABLE IF EXISTS `account_plan_budject_entries_entry`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `account_plan_budject_entries_entry` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `type` enum('initial','reinforcement','annulment','redistribuition_reinforcement','redistribuition_annulment','initial_allocation') NOT NULL,
  `operator` enum('debit','credit') NOT NULL,
  `allocation` double NOT NULL,
  `last_final_allocation` double NOT NULL,
  `posting_month` int NOT NULL,
  `posting_date` timestamp NOT NULL,
  `entry_id` int unsigned NOT NULL,
  `target_entrie_entry_id` int unsigned DEFAULT NULL,
  `account_plan_budject_id` int unsigned NOT NULL,
  `state` int NOT NULL DEFAULT '1',
  `created_by` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_by` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_entry_id` (`entry_id`),
  KEY `fk_target_entrie_entry_id` (`target_entrie_entry_id`),
  KEY `fk_account_plan_budject_id` (`account_plan_budject_id`),
  CONSTRAINT `fk_account_plan_budject_id` FOREIGN KEY (`account_plan_budject_id`) REFERENCES `account_plan_budjects` (`id`),
  CONSTRAINT `fk_entry_id` FOREIGN KEY (`entry_id`) REFERENCES `account_plan_budject_entries` (`id`),
  CONSTRAINT `fk_target_entrie_entry_id` FOREIGN KEY (`target_entrie_entry_id`) REFERENCES `account_plan_budject_entries_entry` (`id`),
  CONSTRAINT `account_plan_budject_entries_entry_chk_1` CHECK ((`type` in (_utf8mb4'initial',_utf8mb4'reinforcement',_utf8mb4'annulment',_utf8mb4'redistribuition_reinforcement',_utf8mb4'redistribuition_annulment',_utf8mb4'initial_allocation'))),
  CONSTRAINT `account_plan_budject_entries_entry_chk_2` CHECK ((`operator` in (_utf8mb4'debit',_utf8mb4'credit')))
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account_plan_budject_entries_entry`
--

LOCK TABLES `account_plan_budject_entries_entry` WRITE;
/*!40000 ALTER TABLE `account_plan_budject_entries_entry` DISABLE KEYS */;
INSERT INTO `account_plan_budject_entries_entry` VALUES (20,'initial','credit',0,0,10,'2024-11-04 11:56:17',44,NULL,1,1,NULL,'2024-11-04 11:56:17',NULL,NULL),(21,'initial','credit',0,0,10,'2024-11-04 11:57:10',45,NULL,1,1,NULL,'2024-11-04 11:57:10',NULL,NULL),(22,'initial','credit',0,0,10,'2024-11-04 12:02:42',46,NULL,1,1,NULL,'2024-11-04 12:02:42',NULL,NULL),(23,'initial','credit',0,0,10,'2024-11-04 12:03:51',47,NULL,1,1,NULL,'2024-11-04 12:03:51',NULL,NULL),(24,'initial','credit',0,0,10,'2024-11-04 12:08:05',48,NULL,1,1,NULL,'2024-11-04 12:08:05',NULL,NULL),(25,'initial','credit',0,0,10,'2024-11-04 12:08:24',49,NULL,1,1,NULL,'2024-11-04 12:08:24',NULL,NULL),(26,'initial','credit',0,0,10,'2024-11-04 12:09:50',50,NULL,1,1,NULL,'2024-11-04 12:09:50',NULL,NULL),(27,'initial','credit',0,0,10,'2024-11-04 12:10:51',51,NULL,1,1,NULL,'2024-11-04 12:10:51',NULL,NULL),(28,'initial','credit',0,0,10,'2024-11-04 12:11:06',52,NULL,1,1,NULL,'2024-11-04 12:11:06',NULL,NULL),(29,'initial','credit',0,0,10,'2024-11-04 12:11:23',53,NULL,1,1,NULL,'2024-11-04 12:11:23',NULL,NULL),(30,'initial','credit',0,0,10,'2024-11-04 12:11:31',54,NULL,1,1,NULL,'2024-11-04 12:11:31',NULL,NULL),(31,'initial','credit',0,0,10,'2024-11-04 12:11:39',55,NULL,1,1,NULL,'2024-11-04 12:11:39',NULL,NULL),(32,'initial_allocation','credit',123213,0,10,'2024-11-07 15:18:30',47,NULL,1,1,NULL,'2024-11-07 15:18:30',NULL,NULL),(33,'initial','credit',0,0,10,'2024-11-07 15:45:22',56,NULL,1,1,NULL,'2024-11-07 15:45:22',NULL,NULL),(34,'initial','credit',0,0,10,'2024-11-07 15:53:08',57,NULL,1,1,NULL,'2024-11-07 15:53:08',NULL,NULL),(35,'initial_allocation','credit',21123123,0,10,'2024-11-08 18:34:56',48,NULL,1,1,NULL,'2024-11-08 18:34:56',NULL,NULL),(36,'initial_allocation','credit',1200,0,10,'2024-11-08 18:40:45',44,NULL,1,1,NULL,'2024-11-08 18:40:45',NULL,NULL),(37,'initial_allocation','credit',500,0,10,'2024-11-08 18:41:11',45,NULL,1,1,NULL,'2024-11-08 18:41:11',NULL,NULL),(38,'initial_allocation','credit',500,0,10,'2024-11-08 18:42:04',57,NULL,1,1,NULL,'2024-11-08 18:42:04',NULL,NULL),(39,'initial_allocation','credit',1555,0,10,'2024-11-08 18:43:07',50,NULL,1,1,NULL,'2024-11-08 18:43:07',NULL,NULL),(40,'initial','credit',0,0,10,'2024-11-08 18:49:06',58,NULL,1,1,NULL,'2024-11-08 18:49:06',NULL,NULL),(41,'initial','credit',0,0,10,'2024-11-08 18:52:19',59,NULL,1,1,NULL,'2024-11-08 18:52:19',NULL,NULL),(42,'initial','credit',0,0,10,'2024-11-08 19:06:06',60,NULL,1,1,NULL,'2024-11-08 19:06:06',NULL,NULL),(43,'initial','credit',0,0,10,'2024-11-08 19:07:11',61,NULL,1,1,NULL,'2024-11-08 19:07:11',NULL,NULL),(44,'initial','credit',0,0,10,'2024-11-08 19:07:22',62,NULL,1,1,NULL,'2024-11-08 19:07:22',NULL,NULL),(45,'initial','credit',0,0,10,'2024-11-08 19:07:39',63,NULL,1,1,NULL,'2024-11-08 19:07:39',NULL,NULL),(46,'initial','credit',0,0,10,'2024-11-08 19:07:46',64,NULL,1,1,NULL,'2024-11-08 19:07:46',NULL,NULL),(47,'initial','credit',0,0,10,'2024-11-08 19:11:07',65,NULL,1,1,NULL,'2024-11-08 19:11:07',NULL,NULL),(48,'initial','credit',0,0,10,'2024-11-08 19:11:14',66,NULL,1,1,NULL,'2024-11-08 19:11:14',NULL,NULL),(49,'initial','credit',0,0,10,'2024-11-08 19:11:20',67,NULL,1,1,NULL,'2024-11-08 19:11:20',NULL,NULL),(50,'initial','credit',0,0,10,'2024-11-08 19:13:00',68,NULL,1,1,NULL,'2024-11-08 19:13:00',NULL,NULL);
/*!40000 ALTER TABLE `account_plan_budject_entries_entry` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `account_plan_budjects`
--

DROP TABLE IF EXISTS `account_plan_budjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `account_plan_budjects` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `year` int NOT NULL,
  `description` varchar(255) NOT NULL,
  `state` int NOT NULL DEFAULT '1',
  `created_by` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_by` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `account_plan_budjects_year_unique` (`year`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account_plan_budjects`
--

LOCK TABLES `account_plan_budjects` WRITE;
/*!40000 ALTER TABLE `account_plan_budjects` DISABLE KEYS */;
INSERT INTO `account_plan_budjects` VALUES (1,2024,'Plano de orçamento do ano 2024',1,NULL,'2024-10-26 10:16:45',NULL,NULL);
/*!40000 ALTER TABLE `account_plan_budjects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `account_plans`
--

DROP TABLE IF EXISTS `account_plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `account_plans` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `number` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `writable` enum('moviment','controll') NOT NULL,
  `type` enum('budject','financial') NOT NULL,
  `class` enum('A','B','C','D','E') NOT NULL,
  `state` int NOT NULL DEFAULT '1',
  `created_by` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_by` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `allocation` double DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `account_plans_number_unique` (`number`),
  CONSTRAINT `account_plans_chk_1` CHECK ((`writable` in (_utf8mb4'moviment',_utf8mb4'controll'))),
  CONSTRAINT `account_plans_chk_2` CHECK ((`type` in (_utf8mb4'budject',_utf8mb4'financial'))),
  CONSTRAINT `account_plans_chk_3` CHECK ((`class` in (_utf8mb4'A',_utf8mb4'B',_utf8mb4'C',_utf8mb4'D',_utf8mb4'E')))
) ENGINE=InnoDB AUTO_INCREMENT=187 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account_plans`
--

LOCK TABLES `account_plans` WRITE;
/*!40000 ALTER TABLE `account_plans` DISABLE KEYS */;
INSERT INTO `account_plans` VALUES (67,'1','MEIOS FINANCEIROS','controll','financial','A',1,NULL,'2024-10-24 16:00:24',NULL,'2024-10-24 16:00:24',NULL),(68,'11','Caixa','controll','financial','A',1,NULL,'2024-10-24 16:00:24',NULL,'2024-10-24 16:00:24',NULL),(69,'12','Bancos','controll','financial','A',1,NULL,'2024-10-24 16:00:24',NULL,'2024-10-24 16:00:24',NULL),(70,'121','Depósitos à ordem','controll','financial','A',1,NULL,'2024-10-24 16:00:24',NULL,'2024-10-24 16:00:24',NULL),(71,'123','Depósitos a prazo','controll','financial','A',1,NULL,'2024-10-24 16:00:24',NULL,'2024-10-24 16:00:24',NULL),(72,'3','INVESTIMENTOS DE CAPITAL','controll','financial','A',1,NULL,'2024-10-24 16:00:24',NULL,'2024-10-24 16:00:24',NULL),(73,'32','Activos tangíveis','controll','financial','A',1,NULL,'2024-10-24 16:00:24',NULL,'2024-10-24 16:00:24',NULL),(74,'33','Activos intangíveis','controll','financial','A',1,NULL,'2024-10-24 16:00:24',NULL,'2024-10-24 16:00:24',NULL),(75,'34','Investimentos em curso','controll','financial','A',1,NULL,'2024-10-24 16:00:24',NULL,'2024-10-24 16:00:24',NULL),(76,'36','Activos tangíveis de investimento','controll','financial','A',1,NULL,'2024-10-24 16:00:24',NULL,'2024-10-24 16:00:24',NULL),(77,'38','Amortizações acumuladas','controll','financial','A',1,NULL,'2024-10-24 16:00:24',NULL,'2024-10-24 16:00:24',NULL),(78,'382','Activos tangíveis','controll','financial','A',1,NULL,'2024-10-24 16:00:24',NULL,'2024-10-24 16:00:24',NULL),(79,'383','Activos intangíveis','controll','financial','A',1,NULL,'2024-10-24 16:00:24',NULL,'2024-10-24 16:00:24',NULL),(80,'4','CONTAS A RECEBER E CONTAS A PAGAR','controll','financial','A',1,NULL,'2024-10-24 16:00:24',NULL,'2024-10-24 16:00:24',NULL),(81,'41','Clientes','controll','financial','A',1,NULL,'2024-10-24 16:00:24',NULL,'2024-10-24 16:00:24',NULL),(82,'411','Clientes c/c','controll','financial','A',1,NULL,'2024-10-24 16:00:24',NULL,'2024-10-24 16:00:24',NULL),(83,'42','Fornecedores','controll','financial','A',1,NULL,'2024-10-24 16:00:24',NULL,'2024-10-24 16:00:24',NULL),(84,'421','Fornecedores c/c','controll','financial','A',1,NULL,'2024-10-24 16:00:24',NULL,'2024-10-24 16:00:24',NULL),(85,'43','Empréstimos obtidos','controll','financial','A',1,NULL,'2024-10-24 16:00:24',NULL,'2024-10-24 16:00:24',NULL),(86,'44','Estado','controll','financial','A',1,NULL,'2024-10-24 16:00:24',NULL,'2024-10-24 16:00:24',NULL),(87,'45','Outros devedores','controll','financial','A',1,NULL,'2024-10-24 16:00:24',NULL,'2024-10-24 16:00:24',NULL),(88,'46','Outros credores','controll','financial','A',1,NULL,'2024-10-24 16:00:24',NULL,'2024-10-24 16:00:24',NULL),(89,'48','Provisões','controll','financial','A',1,NULL,'2024-10-24 16:00:24',NULL,'2024-10-24 16:00:24',NULL),(90,'49','Acréscimos e diferimentos','controll','financial','A',1,NULL,'2024-10-24 16:00:24',NULL,'2024-10-24 16:00:24',NULL),(91,'51','Capital','controll','financial','A',1,NULL,'2024-10-24 16:00:24',NULL,'2024-10-24 16:00:24',NULL),(92,'59','Resultados transitados','controll','financial','A',1,NULL,'2024-10-24 16:00:24',NULL,'2024-10-24 16:00:24',NULL),(93,'6','GASTOS E PERDAS','controll','financial','A',1,NULL,'2024-10-24 16:00:24',NULL,'2024-10-24 16:00:24',NULL),(94,'61','Custo dos inventários','controll','financial','A',1,NULL,'2024-10-24 16:00:24',NULL,'2024-10-24 16:00:24',NULL),(95,'62','Gastos com o pessoal','controll','financial','A',1,NULL,'2024-10-24 16:00:24',NULL,'2024-10-24 16:00:24',NULL),(96,'63','Fornecimentos e serviços de terceiros','controll','financial','A',1,NULL,'2024-10-24 16:00:24',NULL,'2024-10-24 16:00:24',NULL),(97,'632','Fornecimentos e serviços','controll','financial','A',1,NULL,'2024-10-24 16:00:24',NULL,'2024-10-24 16:00:24',NULL),(98,'64','Transferências Correntes','controll','financial','A',1,NULL,'2024-10-24 16:00:24',NULL,'2024-10-24 16:00:24',NULL),(99,'66','Exercicios Findos','controll','financial','A',1,NULL,'2024-10-24 16:00:24',NULL,'2024-10-24 16:00:24',NULL),(100,'661','Retroactivos Salariais do Exercicio Corrente para Pessoal Civil','controll','financial','A',1,NULL,'2024-10-24 16:00:24',NULL,'2024-10-24 16:00:24',NULL),(101,'662','Retroactivos de Bens e Servicos','controll','financial','A',1,NULL,'2024-10-24 16:00:24',NULL,'2024-10-24 16:00:24',NULL),(102,'68','Outros gastos e perdas operacionais','controll','financial','A',1,NULL,'2024-10-24 16:00:24',NULL,'2024-10-24 16:00:24',NULL),(103,'683','Perdas em investimentos de capital','controll','financial','A',1,NULL,'2024-10-24 16:00:24',NULL,'2024-10-24 16:00:24',NULL),(104,'69','Gastos e perdas financeiros','controll','financial','A',1,NULL,'2024-10-24 16:00:24',NULL,'2024-10-24 16:00:24',NULL),(105,'7','RENDIMENTOS E GANHOS','controll','financial','A',1,NULL,'2024-10-24 16:00:24',NULL,'2024-10-24 16:00:24',NULL),(106,'72','Receitas','controll','financial','A',1,NULL,'2024-10-24 16:00:24',NULL,'2024-10-24 16:00:24',NULL),(107,'76','Outros rendimentos e ganhos operacionais','controll','financial','A',1,NULL,'2024-10-24 16:00:24',NULL,'2024-10-24 16:00:24',NULL),(108,'78','Rendimentos e ganhos financeiros','controll','financial','A',1,NULL,'2024-10-24 16:00:24',NULL,'2024-10-24 16:00:24',NULL),(109,'81','Resultados','controll','financial','A',1,NULL,'2024-10-24 16:00:24',NULL,'2024-10-24 16:00:24',NULL),(120,'1.0.0.0.00','Despesas Correntes','controll','budject','A',1,NULL,'2024-10-24 19:28:51',NULL,'2024-10-24 19:28:51',NULL),(121,'1.1.0.0.00','Despesas com o Pessoal','controll','budject','A',1,NULL,'2024-10-24 19:28:51',NULL,'2024-10-24 19:28:51',NULL),(122,'1.1.1.0.00','Salários e Remunerações','controll','budject','A',1,NULL,'2024-10-24 19:28:51',NULL,'2024-10-24 19:28:51',NULL),(123,'1.1.1.1.00','Pessoal Civil','controll','budject','A',1,NULL,'2024-10-24 19:28:51',NULL,'2024-10-24 19:28:51',NULL),(124,'1.1.2.0.00','Demais Despesas com o Pessoal','controll','budject','A',1,NULL,'2024-10-24 19:28:51',NULL,'2024-10-24 19:28:51',NULL),(125,'1.1.2.1.00','Pessoal Civil','controll','budject','D',1,NULL,'2024-10-24 19:28:51',NULL,'2024-10-24 19:28:51',NULL),(126,'1.2.0.0.00','Bens e Serviços','controll','budject','A',1,NULL,'2024-10-24 19:28:51',NULL,'2024-10-24 19:28:51',NULL),(127,'1.2.1.0.00','Bens','controll','budject','D',1,NULL,'2024-10-24 19:28:51',NULL,'2024-10-24 19:28:51',NULL),(128,'1.2.2.0.00','Serviços','controll','budject','D',1,NULL,'2024-10-24 19:28:51',NULL,'2024-10-24 19:28:51',NULL),(129,'1.4.0.0.00','Transferências Correntes','controll','budject','D',1,NULL,'2024-10-24 19:28:51',NULL,'2024-10-24 19:28:51',NULL),(130,'1.6.0.0.00','Exercicios Findos','controll','budject','A',1,NULL,'2024-10-24 19:28:51',NULL,'2024-10-24 19:28:51',NULL),(131,'1.6.1.0.00','Retroactivos Salariais do Exercicio Corrente para Pessoal Civil','controll','budject','D',1,NULL,'2024-10-24 19:28:51',NULL,'2024-10-24 19:28:51',NULL),(132,'1.6.2.0.00','Retroactivos de Bens e Servicos','controll','budject','A',1,NULL,'2024-10-24 19:28:51',NULL,'2024-10-24 19:28:51',NULL),(133,'2.0.0.0.00','Despesas de Capital','controll','budject','A',1,NULL,'2024-10-24 19:28:51',NULL,'2024-10-24 19:28:51',NULL),(134,'2.1.0.0.00','Bens de Capital','controll','budject','A',1,NULL,'2024-10-24 19:28:51',NULL,'2024-10-24 19:28:51',NULL),(135,'2.1.1.0.00','Construções','controll','budject','D',1,NULL,'2024-10-24 19:28:51',NULL,'2024-10-24 19:28:51',NULL),(136,'2.1.2.0.00','Maquinaria, Equipamento e Mobiliario','controll','budject','D',1,NULL,'2024-10-24 19:28:51',NULL,'2024-10-24 19:28:51',NULL),(137,'2.1.3.0.00','Meios de Transporte','controll','budject','D',1,NULL,'2024-10-24 19:28:51',NULL,'2024-10-24 19:28:51',NULL),(145,'1.1.1.1.001','asdsadsad','moviment','budject','B',1,NULL,'2024-10-26 11:01:58',NULL,'2024-10-26 11:01:58',NULL),(146,'1.2.2.0.001','asdsadsadasdasd','moviment','budject','B',1,NULL,'2024-10-26 11:02:15',NULL,'2024-10-26 11:02:15',NULL),(147,'1.1.1.1.002','dsdsasadas','moviment','budject','B',1,NULL,'2024-10-26 14:22:45',NULL,'2024-10-26 14:22:45',NULL),(162,'1.1.1.1.003','112wqewqe','moviment','budject','E',1,NULL,'2024-11-04 11:55:58',NULL,'2024-11-04 11:55:58',NULL),(163,'1.1.1.1.004','112wqewqe','moviment','budject','E',1,NULL,'2024-11-04 11:57:06',NULL,'2024-11-04 11:57:06',NULL),(164,'1.1.2.1.001','asdasdasd','moviment','budject','E',1,NULL,'2024-11-04 12:02:42',NULL,'2024-11-04 12:02:42',NULL),(165,'1.1.1.1.005','sadasdsa','moviment','budject','E',1,NULL,'2024-11-04 12:03:51',NULL,'2024-11-04 12:03:51',NULL),(166,'1.1.1.1.006','qweqweqw','moviment','budject','E',1,NULL,'2024-11-04 12:08:05',NULL,'2024-11-04 12:08:05',NULL),(167,'1.1.2.1.002','qweqweqw','moviment','budject','E',1,NULL,'2024-11-04 12:08:24',NULL,'2024-11-04 12:08:24',NULL),(168,'2.1.3.0.001','123123','moviment','budject','E',1,NULL,'2024-11-04 12:09:50',NULL,'2024-11-04 12:09:50',NULL),(169,'2.1.3.0.002','123123','moviment','budject','E',1,NULL,'2024-11-04 12:10:51',NULL,'2024-11-04 12:10:51',NULL),(170,'2.1.2.0.001','123123','moviment','budject','E',1,NULL,'2024-11-04 12:11:06',NULL,'2024-11-04 12:11:06',NULL),(171,'1.2.1.0.001','123123','moviment','budject','E',1,NULL,'2024-11-04 12:11:23',NULL,'2024-11-04 12:11:23',NULL),(172,'1.2.1.0.002','123123','moviment','budject','E',1,NULL,'2024-11-04 12:11:31',NULL,'2024-11-04 12:11:31',NULL),(173,'1.6.1.0.001','123123','moviment','budject','E',1,NULL,'2024-11-04 12:11:39',NULL,'2024-11-04 12:11:39',NULL),(174,'1.1.2.1.003','descricao','moviment','budject','E',1,NULL,'2024-11-07 15:45:22',NULL,'2024-11-07 15:45:22',NULL),(175,'1.2.2.0.002','jhgkjblkj','moviment','budject','E',1,NULL,'2024-11-07 15:53:08',NULL,'2024-11-07 15:53:08',NULL),(176,'1.6.1.0.002','descricao','moviment','budject','E',1,NULL,'2024-11-08 18:49:06',NULL,'2024-11-08 18:49:06',NULL),(177,'1.1.2.1.004','Depositos','moviment','budject','E',1,NULL,'2024-11-08 18:52:19',NULL,'2024-11-08 18:52:19',NULL),(178,'1.2.2.0.003','Conta Mae','moviment','budject','E',1,NULL,'2024-11-08 19:06:06',NULL,'2024-11-08 19:06:06',NULL),(179,'2.1.3.0.003','assad','moviment','budject','E',1,NULL,'2024-11-08 19:07:11',NULL,'2024-11-08 19:07:11',NULL),(180,'2.1.2.0.002','assad','moviment','budject','E',1,NULL,'2024-11-08 19:07:22',NULL,'2024-11-08 19:07:22',NULL),(181,'2.1.3.0.004','sadasd','moviment','budject','E',1,NULL,'2024-11-08 19:07:39',NULL,'2024-11-08 19:07:39',NULL),(182,'2.1.1.0.001','sadasd','moviment','budject','E',1,NULL,'2024-11-08 19:07:46',NULL,'2024-11-08 19:07:46',NULL),(183,'1.2.1.0.003','123123','moviment','budject','E',1,NULL,'2024-11-08 19:11:07',NULL,'2024-11-08 19:11:07',NULL),(184,'2.1.3.0.005','123123','moviment','budject','E',1,NULL,'2024-11-08 19:11:14',NULL,'2024-11-08 19:11:14',NULL),(185,'2.1.2.0.003','123123','moviment','budject','E',1,NULL,'2024-11-08 19:11:20',NULL,'2024-11-08 19:11:20',NULL),(186,'1.2.1.0.004','213wqee','moviment','budject','E',1,NULL,'2024-11-08 19:13:00',NULL,'2024-11-08 19:13:00',NULL);
/*!40000 ALTER TABLE `account_plans` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`sgf`@`localhost`*/ /*!50003 TRIGGER `validate_account_number_before_insert` BEFORE INSERT ON `account_plans` FOR EACH ROW BEGIN
    DECLARE parent_count INT;

    -- Verifica se é uma conta filha (movimentável)
    IF NEW.writable = 'moviment' THEN
        -- Procurar a conta mãe que corresponde à sequência numérica
        SELECT COUNT(*) INTO parent_count
        FROM account_plans
        WHERE NEW.number LIKE CONCAT(number, '%')
          AND writable = 'controll'
        LIMIT 1;

        -- Se não encontrar a conta mãe, lançar um erro
        IF parent_count = 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Conta mãe não encontrada ou não é uma conta controladora';
        END IF;
    END IF;

END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `adonis_schema`
--

DROP TABLE IF EXISTS `adonis_schema`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adonis_schema` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `batch` int NOT NULL,
  `migration_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adonis_schema`
--

LOCK TABLES `adonis_schema` WRITE;
/*!40000 ALTER TABLE `adonis_schema` DISABLE KEYS */;
INSERT INTO `adonis_schema` VALUES (1,'database/migrations/planbudject/1728944402387_create_account_plans_table',1,'2024-10-21 17:08:18'),(2,'database/migrations/planbudject/1728944410575_create_account_plan_budjects_table',1,'2024-10-21 17:08:19'),(3,'database/migrations/planbudject/1728944441045_create_account_plan_budject_entries_table',1,'2024-10-21 17:08:26'),(4,'database/migrations/planbudject/1728944447342_create_account_plan_budject_entry_entries_table',1,'2024-10-21 17:08:34'),(5,'database/migrations/security/1724106407808_create_applications_table',1,'2024-10-21 17:08:36'),(6,'database/migrations/security/1724106411096_create_menus_table',1,'2024-10-21 17:08:43'),(7,'database/migrations/security/1724106428997_create_accessprofiles_table',1,'2024-10-21 17:08:44'),(8,'database/migrations/security/1724106453737_create_organics_table',1,'2024-10-21 17:08:45'),(9,'database/migrations/security/1724276343707_create_users_table',1,'2024-10-21 17:08:54'),(10,'database/migrations/security/1724276343708_create_access_tokens_table',1,'2024-10-21 17:08:57'),(11,'database/migrations/security/1724706400717_create_transactions_table',1,'2024-10-21 17:09:00'),(12,'database/migrations/security/1724708215096_create_accessprofiletransactions_table',1,'2024-10-21 17:09:10');
/*!40000 ALTER TABLE `adonis_schema` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `adonis_schema_versions`
--

DROP TABLE IF EXISTS `adonis_schema_versions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adonis_schema_versions` (
  `version` int unsigned NOT NULL,
  PRIMARY KEY (`version`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adonis_schema_versions`
--

LOCK TABLES `adonis_schema_versions` WRITE;
/*!40000 ALTER TABLE `adonis_schema_versions` DISABLE KEYS */;
INSERT INTO `adonis_schema_versions` VALUES (2);
/*!40000 ALTER TABLE `adonis_schema_versions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `applications`
--

DROP TABLE IF EXISTS `applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `applications` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(3) NOT NULL,
  `description` varchar(64) NOT NULL,
  `type` varchar(6) NOT NULL,
  `state` int NOT NULL DEFAULT '1',
  `created_by` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_by` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `applications_code_unique` (`code`),
  CONSTRAINT `applications_chk_1` CHECK ((`type` in (_utf8mb4'SYSTEM',_utf8mb4'MODULE')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `applications`
--

LOCK TABLES `applications` WRITE;
/*!40000 ALTER TABLE `applications` DISABLE KEYS */;
/*!40000 ALTER TABLE `applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_access_tokens`
--

DROP TABLE IF EXISTS `auth_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_access_tokens` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_id` int unsigned NOT NULL,
  `type` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `hash` varchar(255) NOT NULL,
  `abilities` text NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `auth_access_tokens_tokenable_id_foreign` (`tokenable_id`),
  CONSTRAINT `auth_access_tokens_tokenable_id_foreign` FOREIGN KEY (`tokenable_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_access_tokens`
--

LOCK TABLES `auth_access_tokens` WRITE;
/*!40000 ALTER TABLE `auth_access_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menus`
--

DROP TABLE IF EXISTS `menus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menus` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(4) NOT NULL,
  `description` varchar(64) NOT NULL,
  `type` varchar(4) NOT NULL,
  `application_id` int unsigned NOT NULL,
  `parent_id` int unsigned DEFAULT NULL,
  `state` int NOT NULL DEFAULT '1',
  `created_by` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_by` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `menus_code_unique` (`code`),
  KEY `menus_application_id_foreign` (`application_id`),
  KEY `menus_parent_id_foreign` (`parent_id`),
  CONSTRAINT `menus_application_id_foreign` FOREIGN KEY (`application_id`) REFERENCES `applications` (`id`),
  CONSTRAINT `menus_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `menus` (`id`),
  CONSTRAINT `menus_chk_1` CHECK ((`type` in (_utf8mb4'root',_utf8mb4'sub_menu',_utf8mb4'item')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menus`
--

LOCK TABLES `menus` WRITE;
/*!40000 ALTER TABLE `menus` DISABLE KEYS */;
/*!40000 ALTER TABLE `menus` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `organics`
--

DROP TABLE IF EXISTS `organics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organics` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(3) NOT NULL,
  `name` varchar(20) NOT NULL,
  `description` varchar(64) NOT NULL,
  `state` int NOT NULL DEFAULT '1',
  `created_by` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_by` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `organics_code_unique` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organics`
--

LOCK TABLES `organics` WRITE;
/*!40000 ALTER TABLE `organics` DISABLE KEYS */;
/*!40000 ALTER TABLE `organics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transactions` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(4) NOT NULL,
  `description` varchar(64) NOT NULL,
  `menu_item_id` int unsigned DEFAULT NULL,
  `state` int NOT NULL DEFAULT '1',
  `created_by` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_by` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `transactions_code_unique` (`code`),
  KEY `transactions_menu_item_id_foreign` (`menu_item_id`),
  CONSTRAINT `transactions_menu_item_id_foreign` FOREIGN KEY (`menu_item_id`) REFERENCES `menus` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `full_name` varchar(255) DEFAULT NULL,
  `email` varchar(254) NOT NULL,
  `password` varchar(255) NOT NULL,
  `organic_id` int unsigned DEFAULT NULL,
  `access_profile_id` int unsigned NOT NULL,
  `state` int NOT NULL DEFAULT '1',
  `created_by` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_by` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_organic_id_foreign` (`organic_id`),
  KEY `users_access_profile_id_foreign` (`access_profile_id`),
  CONSTRAINT `users_access_profile_id_foreign` FOREIGN KEY (`access_profile_id`) REFERENCES `access_profiles` (`id`),
  CONSTRAINT `users_organic_id_foreign` FOREIGN KEY (`organic_id`) REFERENCES `organics` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (2,'Root User','root@gmail.com','sebadora123',NULL,1,1,NULL,'2024-10-21 18:09:42',NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-11-11 18:55:52

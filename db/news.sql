-- MySQL dump 10.13  Distrib 5.7.26, for Linux (x86_64)
--
-- Host: localhost    Database: news
-- ------------------------------------------------------
-- Server version	5.7.26-0ubuntu0.16.04.1-log

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
-- Table structure for table `info_category`
--

DROP TABLE IF EXISTS `info_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `info_category` (
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间' ,
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(64) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `info_category`
--

LOCK TABLES `info_category` WRITE;
/*!40000 ALTER TABLE `info_category` DISABLE KEYS */;
/*!40000 ALTER TABLE `info_category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `info_comment`
--

DROP TABLE IF EXISTS `info_comment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `info_comment` (
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间' ,
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `news_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `like_count` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `news_id` (`news_id`),
  KEY `parent_id` (`parent_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `info_comment_ibfk_1` FOREIGN KEY (`news_id`) REFERENCES `info_news` (`id`),
  CONSTRAINT `info_comment_ibfk_2` FOREIGN KEY (`parent_id`) REFERENCES `info_comment` (`id`),
  CONSTRAINT `info_comment_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `info_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `info_comment`
--

LOCK TABLES `info_comment` WRITE;
/*!40000 ALTER TABLE `info_comment` DISABLE KEYS */;
/*!40000 ALTER TABLE `info_comment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `info_comment_like`
--

DROP TABLE IF EXISTS `info_comment_like`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `info_comment_like` (
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间' ,
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `comment_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  PRIMARY KEY (`comment_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `info_comment_like_ibfk_1` FOREIGN KEY (`comment_id`) REFERENCES `info_comment` (`id`),
  CONSTRAINT `info_comment_like_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `info_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `info_comment_like`
--

LOCK TABLES `info_comment_like` WRITE;
/*!40000 ALTER TABLE `info_comment_like` DISABLE KEYS */;
/*!40000 ALTER TABLE `info_comment_like` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `info_news`
--

DROP TABLE IF EXISTS `info_news`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `info_news` (
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间' ,
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(256) NOT NULL,
  `source` varchar(64) NOT NULL,
  `digest` varchar(512) NOT NULL,
  `content` text NOT NULL,
  `clicks` int(11) DEFAULT NULL,
  `comments_count` int(11) DEFAULT NULL,
  `index_image_url` varchar(256) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `status` int(11) DEFAULT NULL,
  `reason` varchar(256) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `info_news_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `info_category` (`id`),
  CONSTRAINT `info_news_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `info_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `info_news`
--

LOCK TABLES `info_news` WRITE;
/*!40000 ALTER TABLE `info_news` DISABLE KEYS */;
/*!40000 ALTER TABLE `info_news` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `info_user`
--

DROP TABLE IF EXISTS `info_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `info_user` (
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间' ,
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nick_name` varchar(32) NOT NULL,
  `password_hash` varchar(128) NOT NULL,
  `username` varchar(11) NOT NULL,
  `avatar_url` varchar(256) DEFAULT NULL,
  `last_login` datetime DEFAULT NULL,
  `is_admin` tinyint(1) DEFAULT NULL,
  `signature` varchar(512) DEFAULT NULL,
  `gender` enum('MAN','WOMAN') DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `nick_name` (`nick_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `info_user`
--

LOCK TABLES `info_user` WRITE;
/*!40000 ALTER TABLE `info_user` DISABLE KEYS */;
/*!40000 ALTER TABLE `info_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `info_user_collection`
--

DROP TABLE IF EXISTS `info_user_collection`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `info_user_collection` (
  `user_id` int(11) NOT NULL,
  `news_id` int(11) NOT NULL,
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间' ,
  PRIMARY KEY (`user_id`,`news_id`),
  KEY `news_id` (`news_id`),
  CONSTRAINT `info_user_collection_ibfk_1` FOREIGN KEY (`news_id`) REFERENCES `info_news` (`id`),
  CONSTRAINT `info_user_collection_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `info_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `info_user_collection`
--

LOCK TABLES `info_user_collection` WRITE;
/*!40000 ALTER TABLE `info_user_collection` DISABLE KEYS */;
/*!40000 ALTER TABLE `info_user_collection` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `info_user_fans`
--

DROP TABLE IF EXISTS `info_user_fans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `info_user_fans` (
  `follower_id` int(11) NOT NULL,
  `followed_id` int(11) NOT NULL,
  PRIMARY KEY (`follower_id`,`followed_id`),
  KEY `followed_id` (`followed_id`),
  CONSTRAINT `info_user_fans_ibfk_1` FOREIGN KEY (`followed_id`) REFERENCES `info_user` (`id`),
  CONSTRAINT `info_user_fans_ibfk_2` FOREIGN KEY (`follower_id`) REFERENCES `info_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `info_user_fans`
--

LOCK TABLES `info_user_fans` WRITE;
/*!40000 ALTER TABLE `info_user_fans` DISABLE KEYS */;
/*!40000 ALTER TABLE `info_user_fans` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2020-03-25 22:29:45

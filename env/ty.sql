/*
 Navicat Premium Data Transfer

 Source Server         : test
 Source Server Type    : MySQL
 Source Server Version : 100138
 Source Host           : localhost:3306
 Source Schema         : ty

 Target Server Type    : MySQL
 Target Server Version : 100138
 File Encoding         : 65001

 Date: 15/09/2020 10:48:34
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for ty_share
-- ----------------------------
DROP TABLE IF EXISTS `ty_share`;
CREATE TABLE `ty_share`  (
  `id` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `fileName` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `fileType` char(10) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `user` char(11) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `expired` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `add_time` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `pass` char(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `category` enum('个人云','家庭云') CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `fileName`(`fileName`, `user`, `category`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for ty_user
-- ----------------------------
DROP TABLE IF EXISTS `ty_user`;
CREATE TABLE `ty_user`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uid` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '0',
  `pass` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '天翼密码',
  `cookie` text CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '天翼cookie',
  `total` bigint(255) NOT NULL,
  `size` bigint(255) NOT NULL,
  `add_time` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
  `sessionKey_family` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `accessToken` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `sessionKey` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `sessionSecret` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  PRIMARY KEY (`id`, `uid`) USING BTREE,
  UNIQUE INDEX `id`(`id`, `uid`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

SET FOREIGN_KEY_CHECKS = 1;

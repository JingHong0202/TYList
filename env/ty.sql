/*
 Navicat Premium Data Transfer

 Source Server         : mysql
 Source Server Type    : MySQL
 Source Server Version : 50562
 Source Host           : localhost:3306
 Source Schema         : ty

 Target Server Type    : MySQL
 Target Server Version : 50562
 File Encoding         : 65001

 Date: 04/06/2020 20:13:53
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for ty_share
-- ----------------------------
DROP TABLE IF EXISTS `ty_share`;
CREATE TABLE `ty_share`  (
  `id` char(16) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
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
  `uid` varchar(11) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '0',
  `pass` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '天翼密码',
  `cookie` text CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '天翼cookie',
  `total` bigint(255) NOT NULL,
  `size` bigint(255) NOT NULL,
  `add_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `sessionKey_family` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `accessToken` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `sessionKey` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `sessionSecret` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  PRIMARY KEY (`id`, `uid`) USING BTREE,
  UNIQUE INDEX `id`(`id`, `uid`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of ty_user
-- ----------------------------
INSERT INTO `ty_user` VALUES (4, '17725764985', 'U2FsdGVkX1/It5mVIAgzMjTUufE9OLrsq2VJK0t4HJ4=', 'apm_ua=95BDEFAAB6055E7C4189C62CF3653251; expires=Mon, 21-Jun-2088 15:31:34 GMT;apm_ip=58.248.77.69; expires=Mon, 21-Jun-2088 15:31:34 GMT;apm_ct=20200603201727574; expires=Mon, 21-Jun-2088 15:31:34 GMT;apm_uid=C03EF3BFF236A338DDD4C61AEEC0982D; expires=Mon, 21-Jun-2088 15:31:34 GMT;apm_sid=4E79D53AE6E585EA75F433A01C736CA5;COOKIE_LOGIN_USER=996D1BDEF3E33E8E311CE38375CF8E98F8048E5AA4DDD22708B47185631BE4BB7A622D04ECBF7F958964AABA93C51BE7786F2B5E50045EC19CB20669; domain=cloud.189.cn; path=/;JSESSIONID=aaaD7ClmzbuYmefhuwxjx', 4418853404672, 210919094463, '2020-05-17 15:20:55', 'd9f0a477-95f4-49a4-81d9-1f0c5b618305_family', '421d4b26203649aebd85eb892234a8eb', 'b7d87f11-bdbd-45b7-8ba9-1ed4331eff89', '65B94F3E09503DB2D7F3475557449203');
INSERT INTO `ty_user` VALUES (7, '18922813555', 'U2FsdGVkX1/krFhQaWNBAFhdiQyzfx0eRQFehxczQbw=', 'apm_ua=95BDEFAAB6055E7C4189C62CF3653251; expires=Mon, 21-Jun-2088 15:31:39 GMT;apm_ip=58.248.77.69; expires=Mon, 21-Jun-2088 15:31:39 GMT;apm_ct=20200603201732026; expires=Mon, 21-Jun-2088 15:31:39 GMT;apm_uid=F59268910EB2EF54987843D0F07F3042; expires=Mon, 21-Jun-2088 15:31:39 GMT;apm_sid=2AF479B56EB919A3A7ACBC62AEA5A82C;COOKIE_LOGIN_USER=6C650F57435F5A8067BCF3A7C3C8C3734EE961822279A66AF598504F43103C200DB682768CD94CE31E1A80FA0561EE46194D45028C5B26A12DD4EE4D; domain=cloud.189.cn; path=/;JSESSIONID=aaaG-QTxPSBaQcXiuwxjx', 15412486995968, 7653741786489, '2020-06-02 20:21:47', '32f41d7a-074e-4ca8-a7f7-c1dadd35869e_family', 'd51aea8d6a2d4af4a9793cd5c6f4d0b5', 'e6ea3976-c326-4afc-9348-3413418425e6', '8574694475AC5719AA3ED4545477A054');
INSERT INTO `ty_user` VALUES (8, '18023200462', 'U2FsdGVkX1/rZ9kwbUvq8xbyJ6M82D5iMKro4AKyqlU=', 'apm_ua=95BDEFAAB6055E7C4189C62CF3653251; expires=Mon, 21-Jun-2088 15:30:22 GMT;apm_ip=58.248.77.69; expires=Mon, 21-Jun-2088 15:30:22 GMT;apm_ct=20200603201615634; expires=Mon, 21-Jun-2088 15:30:22 GMT;apm_uid=C6A538A679E0611F15531F9188D7332E; expires=Mon, 21-Jun-2088 15:30:22 GMT;apm_sid=DDCF1D0EC296F85B671074EDE21C8CFE;COOKIE_LOGIN_USER=E3F48B8129CDD05FD14408D873A29C9F890278DC1718DE464D7B583EC67F160C76BA7A0D4CB8FEF8B01BBAFB5969A923BC12A0E57DD3DBDB3E12BB1F; domain=cloud.189.cn; path=/;JSESSIONID=aaapsDTA2-iV1_fzSvxjx', 11011431071744, 8036418689, '2020-06-02 20:32:42', '47b06b64-60d9-49a2-95ee-4b9993efd271_family', 'd8527106c31a4264885673ccb82d8e99', 'e08dcf27-429c-4e74-9eb9-411193a626a9', 'A8BC0A7D54BAAE92D85C0EBDAFE9A42C');

SET FOREIGN_KEY_CHECKS = 1;

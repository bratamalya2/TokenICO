use dbs;
select * from dbs.users;CREATE TABLE `admin` (
  `adminId` int unsigned NOT NULL AUTO_INCREMENT,
  `pwd` varchar(200) NOT NULL,
  PRIMARY KEY (`adminId`),
  UNIQUE KEY `adminId_UNIQUE` (`adminId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `adminpayments` (
  `title` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `description` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ethWalletStatus` tinyint NOT NULL DEFAULT '0',
  `bitcoinWalletStatus` tinyint NOT NULL DEFAULT '0',
  `ethGasPrice` int unsigned NOT NULL,
  `ethGasLimit` int unsigned NOT NULL,
  `tokenID` int unsigned NOT NULL,
  `adminId` int unsigned NOT NULL,
  PRIMARY KEY (`title`),
  UNIQUE KEY `title_UNIQUE` (`title`),
  UNIQUE KEY `tokenID_UNIQUE` (`tokenID`),
  UNIQUE KEY `adminId_UNIQUE` (`adminId`),
  CONSTRAINT `admin_id2` FOREIGN KEY (`adminId`) REFERENCES `admin` (`adminId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `token_id2` FOREIGN KEY (`tokenID`) REFERENCES `token` (`tokenID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_as_ci;

CREATE TABLE `kyc` (
  `userName` varchar(30) NOT NULL,
  `id` int unsigned NOT NULL,
  `docType` varchar(45) NOT NULL,
  `docLink` varchar(60) NOT NULL,
  `submittedTimestamp` datetime NOT NULL,
  `status` enum('Pending','Verified') NOT NULL,
  PRIMARY KEY (`id`,`docType`,`docLink`),
  UNIQUE KEY `docLink_UNIQUE` (`docLink`),
  UNIQUE KEY `id_UNIQUE` (`id`,`docType`,`docLink`) /*!80000 INVISIBLE */,
  CONSTRAINT `id` FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `token` (
  `tokenID` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(15) NOT NULL,
  `symbol` varchar(5) NOT NULL,
  `decimalMin` int unsigned NOT NULL,
  `decimalMax` int unsigned NOT NULL,
  `kycBeforePurchase` tinyint NOT NULL DEFAULT '0',
  `adminId` int unsigned NOT NULL,
  PRIMARY KEY (`tokenID`),
  UNIQUE KEY `tokenID_UNIQUE` (`tokenID`),
  UNIQUE KEY `symbol_UNIQUE` (`symbol`),
  UNIQUE KEY `name_UNIQUE` (`name`),
  UNIQUE KEY `adminId_UNIQUE` (`adminId`),
  CONSTRAINT `admin_Id` FOREIGN KEY (`adminId`) REFERENCES `admin` (`adminId`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=armscii8;

CREATE TABLE `tokensales` (
  `tokenId` int unsigned NOT NULL,
  `tokenIssued` int unsigned NOT NULL,
  `endTimestamp` datetime NOT NULL,
  `currentlySold` int unsigned NOT NULL DEFAULT '0',
  `softCap` int unsigned NOT NULL,
  `hardCap` int unsigned NOT NULL,
  `stageName` varchar(45) NOT NULL,
  `startTimestamp` datetime NOT NULL,
  `basePrice` decimal(10,2) unsigned NOT NULL,
  `baseBonus` int unsigned NOT NULL,
  `minTxn` int unsigned NOT NULL,
  `maxTxn` int unsigned NOT NULL,
  PRIMARY KEY (`stageName`),
  UNIQUE KEY `tokenId_UNIQUE` (`tokenId`),
  UNIQUE KEY `stageName_UNIQUE` (`stageName`),
  CONSTRAINT `token_Id` FOREIGN KEY (`tokenId`) REFERENCES `token` (`tokenID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `txn` (
  `no` int unsigned NOT NULL AUTO_INCREMENT,
  `tokensamt` int unsigned NOT NULL,
  `from` varchar(70) NOT NULL,
  `to` varchar(70) NOT NULL,
  `type` enum('Purchase','Sell','Transfer') NOT NULL DEFAULT 'Purchase',
  `timestamp` datetime NOT NULL,
  `status` varchar(45) NOT NULL,
  `tokenID` int unsigned NOT NULL,
  PRIMARY KEY (`no`),
  UNIQUE KEY `no_UNIQUE` (`no`),
  UNIQUE KEY `tokenID_UNIQUE` (`tokenID`),
  CONSTRAINT `tokenID` FOREIGN KEY (`tokenID`) REFERENCES `token` (`tokenID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `users` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `balance` int unsigned NOT NULL DEFAULT '0',
  `emailVerified` tinyint NOT NULL DEFAULT '0',
  `kycVerified` tinyint NOT NULL DEFAULT '0',
  `address` varchar(70) DEFAULT NULL,
  `email` varchar(50) NOT NULL,
  `fullname` varchar(50) NOT NULL,
  `mobile` varchar(15) NOT NULL,
  `DOB` date NOT NULL,
  `nationality` varchar(25) NOT NULL,
  `lastLogin` datetime DEFAULT NULL,
  `pass` varchar(80) NOT NULL,
  `tokenId` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  UNIQUE KEY `tokenId_UNIQUE` (`tokenId`),
  UNIQUE KEY `address_UNIQUE` (`address`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `websettings` (
  `url` varchar(70) NOT NULL,
  `timeZone` varchar(45) NOT NULL,
  `dateFormat` varchar(20) NOT NULL,
  ` maintenanceMode` tinyint NOT NULL DEFAULT '0',
  `adminId` int unsigned NOT NULL,
  `tokenId` int unsigned NOT NULL,
  PRIMARY KEY (`url`),
  UNIQUE KEY `url_UNIQUE` (`url`),
  KEY `adminId_idx` (`adminId`),
  CONSTRAINT `adminId` FOREIGN KEY (`adminId`) REFERENCES `admin` (`adminId`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';


-- -----------------------------------------------------
-- Schema dbs
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema dbs
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `dbs` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci ;
USE `dbs` ;

-- -----------------------------------------------------
-- Table `dbs`.`admin`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `dbs`.`admin` (
  `adminId` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `pass` VARCHAR(200) NOT NULL,
  `email` VARCHAR(40) NOT NULL,
  `adminfullname` VARCHAR(30) NULL DEFAULT NULL,
  PRIMARY KEY (`adminId`),
  UNIQUE INDEX `adminId_UNIQUE` (`adminId` ASC) VISIBLE,
  UNIQUE INDEX `email_UNIQUE` (`email` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 5
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `dbs`.`token`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `dbs`.`token` (
  `tokenID` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(15) NOT NULL,
  `symbol` VARCHAR(5) NOT NULL,
  `decimalMin` INT UNSIGNED NOT NULL,
  `decimalMax` INT UNSIGNED NOT NULL,
  `kycBeforePurchase` TINYINT NOT NULL DEFAULT '0',
  `adminId` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`tokenID`, `adminId`),
  UNIQUE INDEX `symbol_UNIQUE` (`symbol` ASC) VISIBLE,
  UNIQUE INDEX `name_UNIQUE` (`name` ASC) VISIBLE,
  UNIQUE INDEX `adminId_UNIQUE` (`adminId` ASC) VISIBLE,
  CONSTRAINT `admin_Id`
    FOREIGN KEY (`adminId`)
    REFERENCES `dbs`.`admin` (`adminId`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
AUTO_INCREMENT = 3
DEFAULT CHARACTER SET = armscii8;


-- -----------------------------------------------------
-- Table `dbs`.`adminpaymentsconfig`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `dbs`.`adminpaymentsconfig` (
  `title` VARCHAR(20) CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_0900_ai_ci' NOT NULL,
  `description` VARCHAR(60) CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_0900_ai_ci' NULL DEFAULT NULL,
  `ethWalletStatus` TINYINT NOT NULL DEFAULT '0',
  `bitcoinWalletStatus` TINYINT NOT NULL DEFAULT '0',
  `ethGasPrice` INT UNSIGNED NOT NULL,
  `ethGasLimit` INT UNSIGNED NOT NULL,
  `tokenID` INT UNSIGNED NOT NULL,
  `adminId` INT UNSIGNED NOT NULL,
  `ethAddress` VARCHAR(70) NULL DEFAULT NULL,
  `bitcoinAddress` VARCHAR(70) NULL DEFAULT NULL,
  PRIMARY KEY (`title`),
  UNIQUE INDEX `title_UNIQUE` (`title` ASC) VISIBLE,
  UNIQUE INDEX `tokenID_UNIQUE` (`tokenID` ASC) VISIBLE,
  UNIQUE INDEX `adminId_UNIQUE` (`adminId` ASC) VISIBLE,
  UNIQUE INDEX `ethAddress_UNIQUE` (`ethAddress` ASC) VISIBLE,
  UNIQUE INDEX `bitcoinAddress_UNIQUE` (`bitcoinAddress` ASC) VISIBLE,
  CONSTRAINT `admin_id2`
    FOREIGN KEY (`adminId`)
    REFERENCES `dbs`.`admin` (`adminId`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `token_id2`
    FOREIGN KEY (`tokenID`)
    REFERENCES `dbs`.`token` (`tokenID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_as_ci;


-- -----------------------------------------------------
-- Table `dbs`.`users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `dbs`.`users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `balance` INT UNSIGNED NOT NULL DEFAULT '0',
  `emailVerified` TINYINT NOT NULL DEFAULT '0',
  `kycVerified` TINYINT NOT NULL DEFAULT '0',
  `address` VARCHAR(70) NULL DEFAULT NULL,
  `email` VARCHAR(50) NOT NULL,
  `fullname` VARCHAR(50) NOT NULL,
  `mobile` VARCHAR(15) NULL DEFAULT NULL,
  `DOB` DATE NULL DEFAULT NULL,
  `nationality` VARCHAR(25) NULL DEFAULT NULL,
  `lastLogin` VARCHAR(50) NULL DEFAULT NULL,
  `pass` VARCHAR(80) NOT NULL,
  `tokenId` INT UNSIGNED NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE,
  UNIQUE INDEX `email_UNIQUE` (`email` ASC) VISIBLE,
  UNIQUE INDEX `address_UNIQUE` (`address` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 38
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `dbs`.`kyc`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `dbs`.`kyc` (
  `userName` VARCHAR(30) NOT NULL,
  `id` INT UNSIGNED NOT NULL,
  `docType` VARCHAR(45) NOT NULL,
  `docLink` VARCHAR(60) NOT NULL,
  `submittedTimestamp` VARCHAR(35) NOT NULL,
  `status` ENUM('Pending', 'Verified') NOT NULL DEFAULT 'Pending',
  PRIMARY KEY (`id`, `docType`, `docLink`),
  UNIQUE INDEX `docLink_UNIQUE` (`docLink` ASC) VISIBLE,
  UNIQUE INDEX `id_UNIQUE` (`id` ASC, `docType` ASC, `docLink` ASC) INVISIBLE,
  CONSTRAINT `id`
    FOREIGN KEY (`id`)
    REFERENCES `dbs`.`users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `dbs`.`tokensales`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `dbs`.`tokensales` (
  `tokenId` INT UNSIGNED NOT NULL,
  `tokenIssued` INT UNSIGNED NOT NULL,
  `endTimestamp` VARCHAR(25) NOT NULL,
  `currentlySold` INT UNSIGNED NOT NULL DEFAULT '0',
  `softCap` INT UNSIGNED NOT NULL,
  `hardCap` INT UNSIGNED NOT NULL,
  `stageName` VARCHAR(45) NOT NULL,
  `startTimestamp` VARCHAR(25) NOT NULL,
  `basePrice` DECIMAL(10,2) UNSIGNED NOT NULL,
  `baseBonus` INT UNSIGNED NOT NULL,
  `minTxn` INT UNSIGNED NOT NULL,
  `maxTxn` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`tokenId`, `stageName`),
  UNIQUE INDEX `stageName_UNIQUE` (`stageName` ASC) INVISIBLE,
  INDEX `token_Id_idx` (`tokenId` ASC) VISIBLE,
  CONSTRAINT `token_Id`
    FOREIGN KEY (`tokenId`)
    REFERENCES `dbs`.`token` (`tokenID`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `dbs`.`txn`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `dbs`.`txn` (
  `no` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `tokensamt` INT UNSIGNED NOT NULL,
  `fromAddress` VARCHAR(70) NOT NULL,
  `toAddress` VARCHAR(70) NOT NULL,
  `txnType` ENUM('Purchase', 'Sell', 'Transfer') NOT NULL DEFAULT 'Purchase',
  `txnTimestamp` VARCHAR(50) NOT NULL,
  `txnStatus` VARCHAR(45) NOT NULL,
  `tokenID` INT UNSIGNED NOT NULL,
  `payFrom` VARCHAR(45) NULL DEFAULT NULL,
  PRIMARY KEY (`no`),
  UNIQUE INDEX `no_UNIQUE` (`no` ASC) VISIBLE,
  INDEX `tokenID_idx` (`tokenID` ASC) VISIBLE,
  CONSTRAINT `tokenID`
    FOREIGN KEY (`tokenID`)
    REFERENCES `dbs`.`token` (`tokenID`))
ENGINE = InnoDB
AUTO_INCREMENT = 16
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `dbs`.`websettings`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `dbs`.`websettings` (
  `url` VARCHAR(70) NOT NULL,
  `timeZone` VARCHAR(45) NOT NULL,
  `dateFormat` VARCHAR(20) NOT NULL,
  ` maintenanceMode` TINYINT NOT NULL DEFAULT '0',
  `adminId` INT UNSIGNED NOT NULL,
  `tokenId` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`url`),
  UNIQUE INDEX `url_UNIQUE` (`url` ASC) VISIBLE,
  INDEX `adminId_idx` (`adminId` ASC) VISIBLE,
  CONSTRAINT `adminId`
    FOREIGN KEY (`adminId`)
    REFERENCES `dbs`.`admin` (`adminId`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

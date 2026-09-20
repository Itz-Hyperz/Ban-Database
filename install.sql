CREATE DATABASE IF NOT EXISTS bandb;
USE bandb;

CREATE TABLE guilds (
guildid varchar(255),
autobans boolean,
autounbans boolean,
logging varchar(255)
);

CREATE TABLE bannedusers (
banid INT NOT NULL AUTO_INCREMENT,
active boolean,
userid varchar(255),
reason TEXT,
proof TEXT,
bannedby varchar(255),
bannedat varchar(255),
PRIMARY KEY (banid));

CREATE TABLE reports (
reportid INT NOT NULL AUTO_INCREMENT,
userid varchar(255),
reason TEXT,
proof TEXT,
reportedby varchar(255),
PRIMARY KEY(reportid));

CREATE TABLE appeals (
appealid INT NOT NULL AUTO_INCREMENT,
userid varchar(255),
reason TEXT,
PRIMARY KEY(appealid));

CREATE TABLE bannedservers (
guildid varchar(255),
reason TEXT,
type TEXT,
proof TEXT
);

CREATE TABLE stickymsgs (
guildid varchar(255),
channel varchar(255),
response TEXT
);

CREATE TABLE staff(
userid varchar(255)
);

-- Conversions
ALTER DATABASE bandb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci;
ALTER TABLE guilds CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci;
ALTER TABLE bannedusers CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci;
ALTER TABLE reports CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci;
ALTER TABLE appeals CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci;
ALTER TABLE bannedservers CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci;
ALTER TABLE staff CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci;
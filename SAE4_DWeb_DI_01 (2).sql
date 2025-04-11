-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Hôte : sae-mysql
-- Généré le : ven. 11 avr. 2025 à 13:37
-- Version du serveur : 8.4.4
-- Version de PHP : 8.2.27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `SAE4_DWeb_DI_01`
--

-- --------------------------------------------------------

--
-- Structure de la table `doctrine_migration_versions`
--

CREATE TABLE `doctrine_migration_versions` (
  `version` varchar(191) COLLATE utf8mb3_unicode_ci NOT NULL,
  `executed_at` datetime DEFAULT NULL,
  `execution_time` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Déchargement des données de la table `doctrine_migration_versions`
--

INSERT INTO `doctrine_migration_versions` (`version`, `executed_at`, `execution_time`) VALUES
('DoctrineMigrations\\Version20250318150925', '2025-03-18 15:09:41', 87),
('DoctrineMigrations\\Version20250319071813', '2025-03-19 07:18:34', 99),
('DoctrineMigrations\\Version20250319073037', '2025-03-19 07:30:43', 117),
('DoctrineMigrations\\Version20250319100711', '2025-03-19 10:07:16', 421),
('DoctrineMigrations\\Version20250319104306', '2025-03-19 10:43:14', 57),
('DoctrineMigrations\\Version20250319121943', '2025-03-19 12:19:48', 439),
('DoctrineMigrations\\Version20250321104854', '2025-03-21 10:49:15', 264),
('DoctrineMigrations\\Version20250322110437', '2025-03-22 11:04:58', 904),
('DoctrineMigrations\\Version20250323120613', '2025-03-23 12:06:20', 536),
('DoctrineMigrations\\Version20250323154656', '2025-03-23 15:47:01', 126),
('DoctrineMigrations\\Version20250323214349', '2025-03-23 21:44:14', 377),
('DoctrineMigrations\\Version20250324092715', '2025-03-24 09:27:21', 1723),
('DoctrineMigrations\\Version20250324092914', '2025-03-24 09:29:18', 2038),
('DoctrineMigrations\\Version20250324140537', '2025-03-24 14:05:52', 2075),
('DoctrineMigrations\\Version20250324205439', '2025-03-24 20:55:02', 64),
('DoctrineMigrations\\Version20250324214618', '2025-03-24 21:46:45', 52),
('DoctrineMigrations\\Version20250325100410', '2025-03-25 10:04:32', 66),
('DoctrineMigrations\\Version20250325102835', '2025-03-25 10:28:43', 53),
('DoctrineMigrations\\Version20250326073004', '2025-03-26 07:30:24', 108),
('DoctrineMigrations\\Version20250331092404', '2025-03-31 09:24:42', 78),
('DoctrineMigrations\\Version20250401082731', '2025-04-01 08:28:05', 158),
('DoctrineMigrations\\Version20250401083318', '2025-04-01 08:33:24', 127),
('DoctrineMigrations\\Version20250401111948', '2025-04-01 11:20:05', 805),
('DoctrineMigrations\\Version20250401140613', '2025-04-01 14:06:23', 1690),
('DoctrineMigrations\\Version20250401191459', '2025-04-01 19:15:18', 93),
('DoctrineMigrations\\Version20250401193814', '2025-04-01 19:38:21', 1231),
('DoctrineMigrations\\Version20250402142136', '2025-04-02 14:21:58', 3457),
('DoctrineMigrations\\Version20250403080640', '2025-04-03 08:07:34', 72),
('DoctrineMigrations\\Version20250403085242', '2025-04-03 08:52:50', 133),
('DoctrineMigrations\\Version20250403085657', '2025-04-03 08:57:02', 217),
('DoctrineMigrations\\Version20250403130748', '2025-04-03 13:08:04', 49),
('DoctrineMigrations\\Version20250404124341', '2025-04-04 12:43:52', 185),
('DoctrineMigrations\\Version20250404125427', '2025-04-04 12:54:34', 348),
('DoctrineMigrations\\Version20250407121524', '2025-04-07 12:15:36', 1515),
('DoctrineMigrations\\Version20250407140420', '2025-04-07 14:04:26', 3242),
('DoctrineMigrations\\Version20250408081907', '2025-04-08 08:19:20', 238);

-- --------------------------------------------------------

--
-- Structure de la table `notification`
--

CREATE TABLE `notification` (
  `id` int NOT NULL,
  `id_receiver_id` int NOT NULL,
  `id_send` int NOT NULL,
  `content` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_read` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `notification`
--

INSERT INTO `notification` (`id`, `id_receiver_id`, `id_send`, `content`, `is_read`) VALUES
(1, 3, 5, '@suiii vous a mentionné dans un post', 1),
(2, 5, 5, '@suiii a aimé votre post', 1),
(3, 5, 5, '@suiii a aimé votre post', 1),
(4, 5, 5, '@suiii a aimé votre post', 1),
(5, 5, 5, '@suiii a aimé votre post', 1),
(6, 5, 5, '@suiii a aimé votre post', 1),
(7, 5, 5, '@suiii a répondu à votre post', 1),
(8, 5, 5, '@suiii a répondu à votre post', 1),
(9, 3, 5, '@suiii vous a mentionné dans un post', 1),
(10, 3, 5, '@suiii vous a mentionné dans un post', 1),
(11, 3, 5, '@suiii vous a mentionné dans un post', 1),
(12, 5, 5, '@suiii a aimé votre post', 1),
(13, 5, 5, '@suiii a aimé votre post', 1),
(14, 5, 5, '@suiii a aimé votre post', 1),
(15, 3, 5, 'Vous avez été mentionné par @suiii', 1),
(16, 3, 5, 'Vous avez été mentionné par @suiii', 1),
(17, 5, 5, '@suiii a aimé votre post', 1),
(18, 5, 5, '@suiii a retweeté votre post', 1),
(19, 5, 5, '@suiii a commenté votre post', 1),
(20, 3, 5, '@suiii vous suit maintenant', 1),
(21, 3, 5, '@suiii vous suit maintenant', 1),
(22, 5, 12, '@fdsfdsfdsrezrez vous suit maintenant', 1),
(23, 5, 12, '@fdsfdsfdsrezrez vous suit maintenant', 1),
(24, 5, 12, '@fdsfdsfdsrezrez vous suit maintenant', 1),
(25, 5, 12, '@fdsfdsfdsrezrez vous suit maintenant', 1),
(26, 5, 12, '@fdsfdsfdsrezrez vous suit maintenant', 1),
(27, 5, 12, '@fdsfdsfdsrezrez vous suit maintenant', 1),
(28, 5, 12, '@fdsfdsfdsrezrez vous suit maintenant', 1),
(29, 5, 12, '@fdsfdsfdsrezrez vous suit maintenant', 1),
(30, 5, 12, '@fdsfdsfdsrezrez vous suit maintenant', 1),
(31, 5, 12, '@fdsfdsfdsrezrez vous suit maintenant', 1),
(32, 5, 12, '@fdsfdsfdsrezrez vous suit maintenant', 1),
(33, 5, 12, '@fdsfdsfdsrezrez vous suit maintenant', 1),
(34, 5, 12, '@fdsfdsfdsrezrez vous suit maintenant', 1),
(35, 5, 12, '@fdsfdsfdsrezrez vous suit maintenant', 1),
(36, 5, 12, '@fdsfdsfdsrezrez vous suit maintenant', 1),
(37, 5, 12, '@fdsfdsfdsrezrez vous suit maintenant', 1),
(38, 5, 12, '@fdsfdsfdsrezrez vous suit maintenant', 1),
(39, 5, 12, '@fdsfdsfdsrezrez vous suit maintenant', 1),
(40, 5, 12, '@fdsfdsfdsrezrez vous suit maintenant', 1),
(41, 5, 12, '@fdsfdsfdsrezrez vous suit maintenant', 1),
(42, 5, 12, '@fdsfdsfdsrezrez vous suit maintenant', 1),
(43, 5, 12, '@fdsfdsfdsrezrez vous suit maintenant', 1),
(44, 5, 12, '@fdsfdsfdsrezrez vous suit maintenant', 1),
(45, 5, 12, '@fdsfdsfdsrezrez vous suit maintenant', 1),
(46, 5, 12, '@fdsfdsfdsrezrez vous suit maintenant', 1),
(47, 5, 12, '@fdsfdsfdsrezrez vous suit maintenant', 1),
(48, 5, 12, '@fdsfdsfdsrezrez vous suit maintenant', 1),
(49, 5, 12, '@fdsfdsfdsrezrez vous suit maintenant', 1),
(50, 5, 12, '@fdsfdsfdsrezrez vous suit maintenant', 1),
(51, 5, 12, '@fdsfdsfdsrezrez vous suit maintenant', 1),
(52, 5, 12, '@fdsfdsfdsrezrez vous suit maintenant', 1),
(53, 5, 12, '@fdsfdsfdsrezrez vous suit maintenant', 1),
(54, 5, 12, '@fdsfdsfdsrezrez vous suit maintenant', 1),
(55, 5, 12, '@fdsfdsfdsrezrez vous suit maintenant', 1),
(56, 5, 12, '@fdsfdsfdsrezrez vous suit maintenant', 1),
(57, 5, 12, '@fdsfdsfdsrezrez a retweeté votre post', 1),
(59, 12, 5, '@suiii a accepté votre demande d\'abonnement', 1),
(60, 12, 5, '@suiii a refusé votre demande d\'abonnement', 1),
(61, 5, 3, '@Cafipoo vous suit maintenant', 1),
(62, 5, 3, '@Cafipoo a aimé votre post', 1),
(63, 3, 3, '@Cafipoo a commenté votre post', 1),
(64, 5, 3, '@Cafipoo a aimé votre post', 1),
(65, 3, 5, '@suiii a accepté votre demande d\'abonnement', 1),
(66, 3, 5, '@suiii a accepté votre demande d\'abonnement', 1),
(67, 3, 5, '@suiii a accepté votre demande d\'abonnement', 1),
(68, 5, 5, '@suiii a commenté votre post', 1),
(69, 5, 3, '@Cafipoo vous suit maintenant', 1),
(70, 5, 3, '@Cafipoo vous suit maintenant', 1),
(71, 5, 3, '@Cafipoo vous suit maintenant', 1),
(72, 5, 3, '@Cafipoo vous suit maintenant', 1),
(73, 5, 3, '@Cafipoo vous suit maintenant', 1),
(74, 5, 3, '@Cafipoo vous suit maintenant', 1),
(75, 5, 3, '@Cafipoo vous suit maintenant', 1),
(76, 5, 3, '@Cafipoo vous suit maintenant', 1),
(77, 5, 3, '@Cafipoo vous suit maintenant', 1),
(78, 3, 5, '@suiii a refusé votre demande d\'abonnement', 1),
(79, 12, 5, '@suiii vous suit maintenant', 0),
(80, 5, 5, '@suiii a commenté votre post', 1),
(81, 5, 3, '@Cafipoo2 vous suit maintenant', 1),
(82, 5, 3, '@Cafipoo2 vous suit maintenant', 1),
(83, 5, 3, '@Cafipoo2 vous suit maintenant', 1),
(84, 5, 3, '@Cafipoo2 a commenté votre post', 1),
(85, 3, 5, '@suiii vous suit maintenant', 1),
(86, 3, 5, '@suiii vous suit maintenant', 1),
(87, 3, 5, '@suiii vous suit maintenant', 1),
(88, 5, 3, '@Cafipoo2 vous suit maintenant', 1),
(89, 5, 3, '@Cafipoo2 a commenté votre post', 1),
(90, 5, 5, '@suiii a commenté votre post', 1),
(91, 5, 5, '@suiii a retweeté votre post', 1),
(92, 3, 3, '@Cafipoo2 a commenté votre post', 1),
(93, 3, 3, '@Cafipoo a commenté votre post', 1),
(94, 3, 3, '@Cafipoo a aimé votre post', 1),
(95, 3, 3, '@Cafipoo a aimé votre post', 1),
(96, 3, 3, '@Cafipoo a aimé votre post', 1),
(97, 3, 3, '@Cafipoo a aimé votre post', 1),
(98, 3, 3, '@Cafipoo a aimé votre post', 1),
(99, 3, 5, '@suiii vous suit maintenant', 0);

-- --------------------------------------------------------

--
-- Structure de la table `pending`
--

CREATE TABLE `pending` (
  `id` int NOT NULL,
  `user_sending_id` int NOT NULL,
  `user_receive_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `post`
--

CREATE TABLE `post` (
  `id` int NOT NULL,
  `content` varchar(280) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `user_id` int DEFAULT NULL,
  `media` longtext COLLATE utf8mb4_unicode_ci,
  `censored` tinyint(1) DEFAULT NULL,
  `retweet` int DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT NULL,
  `retweet_content` longtext COLLATE utf8mb4_unicode_ci,
  `retweet_media` longtext COLLATE utf8mb4_unicode_ci,
  `is_locked` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `post`
--

INSERT INTO `post` (`id`, `content`, `created_at`, `user_id`, `media`, `censored`, `retweet`, `is_deleted`, `retweet_content`, `retweet_media`, `is_locked`) VALUES
(37, 'Alexis est parti à 14h au lieu de 17h', '2025-03-21 12:56:29', 3, NULL, NULL, NULL, NULL, NULL, NULL, 0),
(151, 'frzerez', '2025-03-31 11:18:50', 5, '[\"67ea7a1a77caf.mp4\",\"67ea7a1a78b17.png\"]', 1, NULL, NULL, NULL, NULL, NULL),
(173, 'yoooo @Cafipoo', '2025-04-01 19:30:47', 12, '[\"67ec3ee75fcc5.webp\"]', NULL, NULL, NULL, NULL, NULL, NULL),
(267, 'rrezrezrezrez', '2025-04-07 07:33:57', 5, '[\"67f387bd0dfa0.png\"]', NULL, NULL, 1, NULL, NULL, NULL),
(276, 'dsfdsfdsfdf #test @Cafipoo  123', '2025-04-07 08:08:42', 5, '[\"67f37fe539936.png\",\"67f387bd0dfa0.png\"]', NULL, 267, NULL, 'rrezrezrezrez', '[\"67f37fe539936.png\",\"67f387bd0dfa0.png\"]', 1),
(278, '@Cafipoo', '2025-04-07 09:03:41', 5, '[]', NULL, NULL, 1, NULL, NULL, 1),
(279, 'dsqdsq', '2025-04-07 09:13:20', 5, '[]', NULL, 278, NULL, '@Cafipoo', '[]', 1),
(280, 'fdsfdsfds', '2025-04-07 13:51:40', 12, '[\"67f387bd0dfa0.png\"]', NULL, 267, NULL, 'rrezrezrezrez', '[\"67f387bd0dfa0.png\"]', NULL),
(281, 'TEST lock tweet', '2025-04-08 12:19:00', 5, '[\"67f51434f17dd.png\",\"67f6668bd9e6d.png\"]', NULL, NULL, NULL, NULL, NULL, 1),
(283, 'test', '2025-04-09 12:22:28', 5, '[\"67f51434f17dd.png\"]', NULL, 281, NULL, 'TEST lock tweet', '[\"67f51434f17dd.png\"]', 0),
(285, 'salut test edit', '2025-04-10 14:45:22', 3, '[\"67f7e3fac0b8e.webp\"]', NULL, NULL, NULL, NULL, NULL, 0);

-- --------------------------------------------------------

--
-- Structure de la table `post_interaction`
--

CREATE TABLE `post_interaction` (
  `id` int NOT NULL,
  `likes` tinyint(1) DEFAULT NULL,
  `post_id` int NOT NULL,
  `user_id` int NOT NULL,
  `comments` longtext COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `post_interaction`
--

INSERT INTO `post_interaction` (`id`, `likes`, `post_id`, `user_id`, `comments`, `created_at`) VALUES
(17, 1, 37, 3, NULL, '2025-04-08 08:51:55'),
(22, 1, 37, 11, NULL, NULL),
(28, 1, 37, 12, NULL, NULL),
(68, 1, 267, 5, NULL, '2025-04-07 08:03:18'),
(73, 1, 278, 5, NULL, NULL),
(74, NULL, 279, 5, 'salut', '2025-04-09 11:37:18'),
(75, 0, 276, 3, 'yo', '2025-04-09 12:15:12'),
(76, 0, 279, 3, NULL, NULL),
(77, NULL, 276, 5, 'yo', '2025-04-09 12:15:19'),
(78, 0, 285, 3, NULL, '2025-04-10 18:36:09');

-- --------------------------------------------------------

--
-- Structure de la table `user`
--

CREATE TABLE `user` (
  `id` int NOT NULL,
  `username` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bio` varchar(280) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `joined_date` datetime NOT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cover` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `birthdate` date DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `roles` json NOT NULL,
  `api_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reloading` int DEFAULT NULL,
  `banned` tinyint(1) DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `site_web` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lecture` tinyint(1) DEFAULT NULL,
  `pin_id` int DEFAULT NULL,
  `is_private` tinyint(1) DEFAULT NULL,
  `is_limited` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `user`
--

INSERT INTO `user` (`id`, `username`, `name`, `bio`, `joined_date`, `avatar`, `cover`, `email`, `birthdate`, `password`, `roles`, `api_token`, `reloading`, `banned`, `is_verified`, `location`, `site_web`, `lecture`, `pin_id`, `is_private`, `is_limited`) VALUES
(3, 'Cafipoo', 'FP', 'yo brad', '2025-03-19 12:37:35', '67e414f9bef9c.webp', '67e414f9cfb58.png', 'fp.lajudie@gmail.com', '0465-05-16', '$2y$13$H3W/Ab5hhIrlN8yD3MGaxOAk2vKDBarm3a6RNzcmF2hQiAqKrywFS', '[\"ROLE_ADMIN\"]', '977a2f25d7dce894c6aae83c82e4387875afb3c3b0368c50f73f49ade0f8acda', 2, 0, 1, 'Limoges', 'https://fp-lajudie.fr', 0, NULL, 0, 0),
(4, 'root2', 'api2', 'gfdgfd', '2025-03-19 13:09:06', NULL, NULL, 'fp.lajudie3@gmail.com', '0495-08-09', '$2y$13$zbl6rLRkcQuTG4NOe8NaMenST7ip9YilKRhqiDr6OAEMKm9BjyGke', '[]', NULL, NULL, 0, 1, NULL, NULL, NULL, NULL, NULL, NULL),
(5, 'suiii', 'suiiiii', 'fdsfdsfdsfdsfs', '2025-03-21 17:11:18', '67ea5cb6cc858.png', '67ea5c85e0c76.png', 'fp.lajudie@gmail.com2', '6456-05-04', '$2y$13$JI.mwfu8CEWE7vKtrs1ltOOl3nlmIDyaZrOvLNxDJKUZJFQ/s80ba', '[]', 'fcec2535cb255b36884fb78254f3e4c4e1d1519dda663808e048f15ed6a20389', 2, 0, 1, 'Limoges', 'https://fp-lajudie.fr', 0, 281, 0, 1),
(6, 'gdfgdf', 'gfdgdf', NULL, '2025-03-24 21:47:25', NULL, NULL, 'francoispierre.lajudie@etu.unilim.fr', '0353-05-31', '$2y$13$TWWswNHTvBM9OGaYfnTEY.1y7uShOAYtKE5gJfuwMuXah1eyJoFz2', '[]', 'dd753b26b4db5964a7d48aa3778d70a03bc31011100ff6b9290e5016dc589964', NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL),
(7, 'fdsfdsfds', 'component', NULL, '2025-03-25 10:24:47', NULL, NULL, 'lojivap500@avulos.com', '2025-03-07', '$2y$13$qgIFM7Cpq327/13jdLOCDe.5gx924i3GQr4bicEymq69qxAb8FBvS', '[]', 'b8c275efe315376edfa2edb620b96194fb218da37a0bc92579cd056a40201498', NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL),
(8, 'ffdsfdsfds', 'fdsfdsfds', NULL, '2025-03-25 10:30:06', NULL, NULL, 'kocawa3890@amgens.com', '2544-07-05', '$2y$13$SyeOhJtbYJH/W.5X2R4FFObRSEOSPYs0uKRcMp3/vIhza/8cMbDSG', '[]', '4cd07556e5e2148621e77e7d27c4469675cdaf842fa2ddb3e3f0ef7b572e8a9e', NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL),
(9, 'fdsfdsfdsfdsfd', 'fdsfs', NULL, '2025-03-25 10:33:30', NULL, NULL, 'gatidis743@avulos.com', '2544-07-05', '$2y$13$klRTX7avYakdjl8.E5pkfeH/GsvyOKFFUF52VpKcQhWrHBrH43VnK', '[]', '4aea9e5b62ea133f11b159bcead625162c8abddd287b0897c4f521907d4d7a3c', NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL),
(10, 'hgfdhgfdhfgd', 'ghgfhgfdhgfd', NULL, '2025-03-25 10:40:55', NULL, NULL, 'sijepo7950@avulos.com', '4545-05-04', '$2y$13$ngne/uTD9G7zItfTgPdaUONvPGq87AVK5yhLjhWH7JzRDw73JINJu', '[]', 'ba1573b49f83c7e6429a117b38a18b247ebf5c5d16935965578681639537965f', 5, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL),
(11, 'fdsfdsfdsfdsf', 'fsqdfdfdsfds', 'ho le nullos', '2025-03-25 10:45:51', NULL, NULL, 'test@gmail.com', '5654-04-06', '$2y$13$WX8WMz/gsp83H2QRngCTEu6AptdfsrPXVU2DZYmEw7Xftpp0u.VIC', '[]', '255c1883db0aa549fec43db6484aae249732db30013691a728b064ba21957187', NULL, 0, 1, NULL, NULL, NULL, NULL, NULL, NULL),
(12, 'fdsfdsfdsrezrez', 'dsfdsfdrezrze', 'retertrete', '2025-03-31 12:30:58', NULL, NULL, 'fp.lajudie@gmail.com3', '6595-05-26', '$2y$13$8npk0pgVfAplhLSr6V/n8Opa2SrwbcSlJUN2ekh3Hh8PkhZC69jUS', '[]', '5243371b16a7616688e2add2111704a3ea8097157bcd6ff7a7d37f7c11f36b48', 1, NULL, 1, 'Limoges', 'https://fp-lajudie.fr', 1, NULL, NULL, NULL),
(46, 'CAFIPO', 'CA', NULL, '2025-04-09 10:43:25', NULL, NULL, 'fp.lajudie@gmail.com4', '6565-06-05', '$2y$13$wFiDTsrAK6gFrdIHdI8WOOX1nwG5HtPjqW/wf7BC8MbuXs1QU39ge', '[]', '6bd158c59bbec84fa9a064875aa9ae4026eeb9e8acc2ee30d60d3c4beaf56b87', NULL, 0, 1, NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `user_interaction`
--

CREATE TABLE `user_interaction` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `second_user_id` int NOT NULL,
  `followed` tinyint(1) DEFAULT NULL,
  `is_banned` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `user_interaction`
--

INSERT INTO `user_interaction` (`id`, `user_id`, `second_user_id`, `followed`, `is_banned`) VALUES
(2, 11, 3, 0, NULL),
(5, 12, 3, 0, 0),
(6, 12, 12, 0, NULL),
(7, 5, 12, 0, 1),
(8, 3, 12, 1, 0),
(27, 5, 12, 1, NULL),
(33, 5, 3, 0, 0),
(35, 5, 3, 1, NULL);

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `doctrine_migration_versions`
--
ALTER TABLE `doctrine_migration_versions`
  ADD PRIMARY KEY (`version`);

--
-- Index pour la table `notification`
--
ALTER TABLE `notification`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_BF5476CAD5412041` (`id_receiver_id`);

--
-- Index pour la table `pending`
--
ALTER TABLE `pending`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_D4D57AB9C3F7CAB3` (`user_sending_id`),
  ADD KEY `IDX_D4D57AB9EBDEAB20` (`user_receive_id`);

--
-- Index pour la table `post`
--
ALTER TABLE `post`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_5A8A6C8DA76ED395` (`user_id`);

--
-- Index pour la table `post_interaction`
--
ALTER TABLE `post_interaction`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_DBCD77884B89032C` (`post_id`),
  ADD KEY `IDX_DBCD7788A76ED395` (`user_id`);

--
-- Index pour la table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UNIQ_8D93D649F85E0677` (`username`),
  ADD UNIQUE KEY `UNIQ_8D93D649E7927C74` (`email`),
  ADD UNIQUE KEY `UNIQ_8D93D6496C3B254C` (`pin_id`);

--
-- Index pour la table `user_interaction`
--
ALTER TABLE `user_interaction`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_9E963432A76ED395` (`user_id`),
  ADD KEY `IDX_9E963432B02C53F8` (`second_user_id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `notification`
--
ALTER TABLE `notification`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=100;

--
-- AUTO_INCREMENT pour la table `pending`
--
ALTER TABLE `pending`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT pour la table `post`
--
ALTER TABLE `post`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=287;

--
-- AUTO_INCREMENT pour la table `post_interaction`
--
ALTER TABLE `post_interaction`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=79;

--
-- AUTO_INCREMENT pour la table `user`
--
ALTER TABLE `user`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT pour la table `user_interaction`
--
ALTER TABLE `user_interaction`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `notification`
--
ALTER TABLE `notification`
  ADD CONSTRAINT `FK_BF5476CAD5412041` FOREIGN KEY (`id_receiver_id`) REFERENCES `user` (`id`);

--
-- Contraintes pour la table `pending`
--
ALTER TABLE `pending`
  ADD CONSTRAINT `FK_D4D57AB9C3F7CAB3` FOREIGN KEY (`user_sending_id`) REFERENCES `user` (`id`),
  ADD CONSTRAINT `FK_D4D57AB9EBDEAB20` FOREIGN KEY (`user_receive_id`) REFERENCES `user` (`id`);

--
-- Contraintes pour la table `post`
--
ALTER TABLE `post`
  ADD CONSTRAINT `FK_5A8A6C8DA76ED395` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);

--
-- Contraintes pour la table `post_interaction`
--
ALTER TABLE `post_interaction`
  ADD CONSTRAINT `FK_DBCD77884B89032C` FOREIGN KEY (`post_id`) REFERENCES `post` (`id`),
  ADD CONSTRAINT `FK_DBCD7788A76ED395` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);

--
-- Contraintes pour la table `user`
--
ALTER TABLE `user`
  ADD CONSTRAINT `FK_8D93D6496C3B254C` FOREIGN KEY (`pin_id`) REFERENCES `post` (`id`);

--
-- Contraintes pour la table `user_interaction`
--
ALTER TABLE `user_interaction`
  ADD CONSTRAINT `FK_9E963432A76ED395` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  ADD CONSTRAINT `FK_9E963432B02C53F8` FOREIGN KEY (`second_user_id`) REFERENCES `user` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

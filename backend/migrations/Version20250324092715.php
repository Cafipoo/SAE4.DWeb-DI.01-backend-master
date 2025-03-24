<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250324092715 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE post_interaction (id INT AUTO_INCREMENT NOT NULL, id_post_id INT NOT NULL, id_user_id INT NOT NULL, likes TINYINT(1) DEFAULT NULL, INDEX IDX_DBCD77889514AA5C (id_post_id), INDEX IDX_DBCD778879F37AE5 (id_user_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE post_interaction ADD CONSTRAINT FK_DBCD77889514AA5C FOREIGN KEY (id_post_id) REFERENCES post (id)');
        $this->addSql('ALTER TABLE post_interaction ADD CONSTRAINT FK_DBCD778879F37AE5 FOREIGN KEY (id_user_id) REFERENCES user (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE post_interaction DROP FOREIGN KEY FK_DBCD77889514AA5C');
        $this->addSql('ALTER TABLE post_interaction DROP FOREIGN KEY FK_DBCD778879F37AE5');
        $this->addSql('DROP TABLE post_interaction');
    }
}

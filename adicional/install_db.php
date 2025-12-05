<?php
// backend/install_db.php

// 1. Cargar Configuración
require_once 'helpers/EnvLoader.php';

try {
  if (file_exists(__DIR__ . '/.env')) {
    EnvLoader::load(__DIR__ . '/.env');
  } else {
    die("❌ Error: No se encuentra el archivo .env. Configúralo primero.");
  }
} catch (Exception $e) {
  die("❌ Error cargando entorno: " . $e->getMessage());
}

$host = getenv('DB_HOST');
$user = getenv('DB_USER');
$pass = getenv('DB_PASS');
$dbname = getenv('DB_NAME');
$appUrl = getenv('FRONTEND_URL');

echo "<h1>🚀 Instalador de Breath Shop</h1>";
echo "<pre>";

try {
  // 2. Conectar a MySQL (Sin seleccionar DB aún)
  echo "Conectando a MySQL... ";
  $pdo = new PDO("mysql:host=$host;charset=utf8mb4", $user, $pass);
  $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  echo "OK\n";

  // 3. Crear Base de Datos si no existe
  echo "Verificando base de datos '$dbname'... ";
  $pdo->exec("CREATE DATABASE IF NOT EXISTS `$dbname` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
  echo "OK (Creada o ya existía)\n";

  // 4. Seleccionar la DB
  $pdo->exec("USE `$dbname`");

  // 5. Estructura de Tablas (SQL)
  echo "Creando tablas... ";

  // Habilitar multi-query simulado
  $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, 1);

  $sql = <<<'SQL'
        SET FOREIGN_KEY_CHECKS = 0;
        DROP TABLE IF EXISTS `reviews`;
        DROP TABLE IF EXISTS `product_variants`;
        DROP TABLE IF EXISTS `products`;
        DROP TABLE IF EXISTS `sizes`;
        DROP TABLE IF EXISTS `users`;

        CREATE TABLE `users` (
          `id` int(11) NOT NULL AUTO_INCREMENT,
          `username` varchar(50) NOT NULL,
          `email` varchar(100) NOT NULL,
          `password` varchar(255) NOT NULL,
          `role` enum('user','admin') DEFAULT 'user',
          `created_at` timestamp DEFAULT current_timestamp(),
          PRIMARY KEY (`id`), UNIQUE KEY `username` (`username`), UNIQUE KEY `email` (`email`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE `products` (
          `id` int(11) NOT NULL AUTO_INCREMENT,
          `name` varchar(100) NOT NULL,
          `description` text DEFAULT NULL,
          `category` varchar(50) NOT NULL,
          `price` decimal(10,2) NOT NULL,
          `discount` int(11) DEFAULT 0,
          `main_image` varchar(255) NOT NULL,
          `hover_image` varchar(255) DEFAULT NULL,
          `created_at` timestamp DEFAULT current_timestamp(),
          PRIMARY KEY (`id`),
          INDEX `idx_category` (`category`),
          INDEX `idx_name` (`name`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE `sizes` (
          `id` int(11) NOT NULL AUTO_INCREMENT,
          `name` varchar(10) NOT NULL,
          PRIMARY KEY (`id`), UNIQUE KEY `name` (`name`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE `product_variants` (
          `id` int(11) NOT NULL AUTO_INCREMENT,
          `product_id` int(11) NOT NULL,
          `size_id` int(11) NOT NULL,
          `stock` int(11) DEFAULT 0,
          PRIMARY KEY (`id`),
          FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
          FOREIGN KEY (`size_id`) REFERENCES `sizes` (`id`) ON DELETE CASCADE,
          UNIQUE KEY `unique_prod_size` (`product_id`, `size_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE `reviews` (
          `id` int(11) NOT NULL AUTO_INCREMENT,
          `user_id` int(11) NOT NULL,
          `product_id` int(11) NOT NULL,
          `rating` int(11) NOT NULL CHECK (`rating` >= 1 AND `rating` <= 5),
          `comment` text DEFAULT NULL,
          `created_at` timestamp DEFAULT current_timestamp(),
          PRIMARY KEY (`id`),
          KEY `user_id` (`user_id`), KEY `product_id` (`product_id`),
          CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
          CONSTRAINT `fk_reviews_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        -- DATOS INICIALES
        INSERT INTO `sizes` (`id`, `name`) VALUES (1,'S'), (2,'M'), (3,'L'), (4,'XL'), (5,'XXL'), (6,'Única');

        INSERT INTO `products` (`id`, `name`, `description`, `category`, `price`, `discount`, `main_image`, `hover_image`) VALUES
        (1, 'HOODIE BREATHE MASK', 'Buzo con capucha diseño máscara y "breathe"', 'buzos', 85.00, 0, 'assets/CARDS/NEWstfu.png', 'assets/CARDS/NEWstfu.png'),
        (2, 'HOODIE BREATHE ASTRONAUT', 'Buzo con capucha diseño "breathe" y astronauta rojo', 'buzos', 90.00, 0, 'assets/CARDS/NEWapollo.png', 'assets/CARDS/NEWapollo.png'),
        (3, 'HOODIE HOPELESS STATUE', 'Buzo con capucha diseño "HOPELESS" y escultura clásica', 'buzos', 95.00, 20, 'assets/CARDS/NEWhopeless.png', 'assets/CARDS/NEWhopeless.png'),
        (4, 'T-SHIRT PARADISE', 'Remera blanca "Another day in Paradise" con paisaje tropical', 'remeras', 40.00, 0, 'assets/CARDS/NEWparadise.png', 'assets/CARDS/NEWparadise.png'),
        (5, 'HOODIE ROSWELL RECORD', 'Buzo con capucha diseño "Roswell Daily Record"', 'buzos', 90.00, 15, 'assets/CARDS/NEWroswell.png', 'assets/CARDS/NEWroswell.png'),
        (6, 'HOODIE TRAGEDY', 'Buzo con capucha "Thank you for the tragedy"', 'buzos', 85.00, 0, 'assets/CARDS/NEWtragedy.png', 'assets/CARDS/NEWtragedy.png'),
        (7, 'T-SHIRT WHO SHOT CUPID WHITE', 'Remera blanca "who shot cupid?" con cupido atravesado', 'remeras', 42.00, 10, 'assets/CARDS/NEWcupidBlanca.png', 'assets/CARDS/NEWcupidBlanca.png'),
        (8, 'T-SHIRT LAST HIT', 'Remera negra "last hit" con pintura renacentista de cupido', 'remeras', 45.00, 0, 'assets/CARDS/NEWlasthit.png', 'assets/CARDS/NEWlasthit.png'),
        (9, 'T-SHIRT WHO SHOT CUPID BLACK', 'Remera negra "who shot cupid?" con cupido atravesado', 'remeras', 42.00, 0, 'assets/CARDS/NEWcupidNegra.png', 'assets/CARDS/NEWcupidNegra.png'),
        (10, 'CAP BREATHE WHITE', 'Gorra blanca con bordado "breathe"', 'gorras', 30.00, 0, 'assets/CARDS/NEWgorraBlanca.png', 'assets/CARDS/NEWgorraBlanca.png'),
        (11, 'CAP BREATHE BLACK', 'Gorra negra con bordado "breathe"', 'gorras', 30.00, 0, 'assets/CARDS/NEWgorraNegra.png', 'assets/CARDS/NEWgorraNegra.png');

        INSERT INTO `product_variants` (`product_id`, `size_id`, `stock`) VALUES
        (1, 1, 7), (1, 2, 11), (1, 3, 9), (1, 4, 5), (2, 1, 6), (2, 2, 10), (2, 3, 8), (2, 4, 4),
        (3, 1, 6), (3, 2, 10), (3, 3, 8), (3, 4, 5), (4, 1, 10), (4, 2, 15), (4, 3, 12), (4, 4, 8),
        (5, 1, 6), (5, 2, 10), (5, 3, 8), (5, 4, 4), (6, 1, 8), (6, 2, 12), (6, 3, 10), (6, 4, 6),
        (7, 1, 12), (7, 2, 18), (7, 3, 14), (7, 4, 10), (8, 1, 10), (8, 2, 16), (8, 3, 12), (8, 4, 8),
        (9, 1, 14), (9, 2, 20), (9, 3, 16), (9, 4, 12), (10, 6, 25), (11, 6, 30);

        SET FOREIGN_KEY_CHECKS = 1;
SQL;
  $pdo->exec($sql);
  echo "OK (Tablas y productos creados)\n";

  // 6. Insertar Admin
  echo "Generando usuario Admin... ";
  // Leemos la contraseña por defecto del .env o usamos la fija
  $adminPassRaw = getenv('DEFAULT_ADMIN_PASS') ?: 'Breathe_Admin2025!';
  $adminPassHash = password_hash($adminPassRaw, PASSWORD_DEFAULT);

  $stmt = $pdo->prepare("INSERT INTO users (username, email, password, role) VALUES (:u, :e, :p, :r)");
  $stmt->execute([
    ':u' => 'admin',
    ':e' => 'admin@breathe.com',
    ':p' => $adminPassHash,
    ':r' => 'admin'
  ]);
  echo "OK\n";

  echo "\n✅ INSTALACIÓN COMPLETADA EXITOSAMENTE\n";
  echo "----------------------------------------\n";
  echo "Usuario:    admin\n";
  echo "Contraseña: $adminPassRaw\n";
  echo "URL:        $appUrl\n";
  echo "----------------------------------------\n";
  echo "IMPORTANTE: Ahora puedes borrar este archivo 'install_db.php'.\n";
  echo "Hash generado (para guardar en reset.sql si quieres): " . $adminPassHash . "\n";

} catch (PDOException $e) {
  echo "\n❌ ERROR CRÍTICO DE BASE DE DATOS:\n" . $e->getMessage();
}
echo "</pre>";
?>
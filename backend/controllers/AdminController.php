<?php
require_once __DIR__ . '/AuthController.php';
require_once __DIR__ . '/../helpers/ApiResponse.php';

class AdminController
{
    private $db;
    private $requestMethod;

    public function __construct($db, $requestMethod)
    {
        $this->db = $db;
        $this->requestMethod = $requestMethod;
    }

    public function processRequest($action = null)
    {

        $auth = new AuthController($this->db, $this->requestMethod);
        $user = $auth->validateToken();

        if (!$user || $user->role !== 'admin') {
            ApiResponse::error("Acceso denegado. Se requiere rol de Admin.", 403);
        }


        if ($action === 'reset-db' && $this->requestMethod == 'POST') {
            $this->resetDatabase();
        } else {
            ApiResponse::error("Acción no encontrada", 404);
        }
    }

    private function resetDatabase()
    {
        try {

            $this->db->setAttribute(PDO::ATTR_EMULATE_PREPARES, 1);


            $sqlStructure = <<<'SQL'
                SET FOREIGN_KEY_CHECKS = 0;

                -- 1. LIMPIEZA
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
                (1, 1, 7), (1, 2, 11), (1, 3, 9), (1, 4, 5),
                (2, 1, 6), (2, 2, 10), (2, 3, 8), (2, 4, 4),
                (3, 1, 6), (3, 2, 10), (3, 3, 8), (3, 4, 5),
                (4, 1, 10), (4, 2, 15), (4, 3, 12), (4, 4, 8),
                (5, 1, 6), (5, 2, 10), (5, 3, 8), (5, 4, 4),
                (6, 1, 8), (6, 2, 12), (6, 3, 10), (6, 4, 6),
                (7, 1, 12), (7, 2, 18), (7, 3, 14), (7, 4, 10),
                (8, 1, 10), (8, 2, 16), (8, 3, 12), (8, 4, 8),
                (9, 1, 14), (9, 2, 20), (9, 3, 16), (9, 4, 12),
                (10, 6, 25),
                (11, 6, 30);

                SET FOREIGN_KEY_CHECKS = 1;
SQL;
            $this->db->exec($sqlStructure);


            $defaultPass = getenv('DEFAULT_ADMIN_PASS') ?: 'Admin_Generico_123';


            $adminPassHash = password_hash($defaultPass, PASSWORD_DEFAULT);

            $sqlUser = "INSERT INTO users (username, email, password, role) VALUES (:user, :email, :pass, :role)";
            $stmt = $this->db->prepare($sqlUser);
            $stmt->execute([
                ':user' => 'admin',
                ':email' => 'admin@breathe.com',
                ':pass' => $adminPassHash,
                ':role' => 'admin'
            ]);


            $this->db->setAttribute(PDO::ATTR_EMULATE_PREPARES, 0);
            $this->cleanUploadsFolder();

            ApiResponse::send(["message" => "DB Reseteada Exitosamente. Admin restaurado."]);

        } catch (PDOException $e) {
            ApiResponse::error("Error SQL al resetear: " . $e->getMessage());
        }
    }

    private function cleanUploadsFolder()
    {
        $folder = __DIR__ . '/../uploads/products/';

        if (!is_dir($folder))
            return;

        $files = glob($folder . '*');
        foreach ($files as $file) {
            if (is_file($file)) {
                unlink($file);
            }
        }
    }
}
?>
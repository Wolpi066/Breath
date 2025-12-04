<?php
class Database
{
    private $conn;

    public function __construct()
    {
        // Asumimos que EnvLoader ya se llamó en index.php
    }

    public function getConnection()
    {
        $this->conn = null;

        try {
            $host = getenv('DB_HOST');
            $db_name = getenv('DB_NAME');
            $username = getenv('DB_USER');
            $password = getenv('DB_PASS');

            $this->conn = new PDO(
                "mysql:host=" . $host . ";dbname=" . $db_name . ";charset=utf8mb4",
                $username,
                $password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

        } catch (PDOException $exception) {
            // Error genérico para no revelar detalles de infraestructura
            error_log("Connection error: " . $exception->getMessage());
            echo json_encode(["error" => "Error de conexión interno."]);
            exit;
        }

        return $this->conn;
    }
}
?>
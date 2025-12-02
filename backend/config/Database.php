<?php
class Database
{
    // Credenciales de conexión
    private $host = "localhost";
    private $db_name = "breath_shop";
    private $username = "breath_admin";
    private $password = "Breath2025Secure!";
    public $conn;

    // Obtener la conexión a la base de datos
    public function getConnection()
    {
        $this->conn = null;

        try {
            // Crear conexión PDO
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4",
                $this->username,
                $this->password
            );

            // Configurar el manejo de errores a Excepciones (muy importante para depurar)
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            // Configurar el modo de fetch por defecto a Array Asociativo
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

        } catch (PDOException $exception) {
            // En producción, no deberías mostrar el mensaje exacto del error al usuario
            echo json_encode(["error" => "Error de conexión a la base de datos: " . $exception->getMessage()]);
            exit;
        }

        return $this->conn;
    }
}
?>
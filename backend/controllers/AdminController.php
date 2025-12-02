<?php
require_once __DIR__ . '/AuthController.php';

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
        // 1. Seguridad: Solo Admins pueden resetear
        $auth = new AuthController($this->db, $this->requestMethod);
        $user = $auth->validateToken();

        if (!$user || $user->role !== 'admin') {
            header("HTTP/1.1 403 Forbidden");
            echo json_encode(["error" => "Acceso denegado. Solo admins."]);
            return;
        }

        // 2. Acción
        if ($action === 'reset-db' && $this->requestMethod == 'POST') {
            $this->resetDatabase();
        } else {
            header("HTTP/1.1 404 Not Found");
            echo json_encode(["error" => "Acción desconocida"]);
        }
    }

    private function resetDatabase()
    {
        try {
            $sqlFile = realpath(__DIR__ . '/../sql/reset.sql');
            if (!$sqlFile || !file_exists($sqlFile)) {
                throw new Exception("Archivo SQL no encontrado");
            }

            $sql = file_get_contents($sqlFile);

            // Ejecutar multi-query (requiere que PDO esté configurado para esto, pero suele funcionar por defecto en XAMPP)
            // Nota: PDO::exec no soporta multiples queries en una llamada en todos los drivers, 
            // pero MySQL suele permitirlo. Si falla, hay que partirlo por ';'.

            $this->db->exec($sql);

            header("HTTP/1.1 200 OK");
            echo json_encode(["message" => "Base de datos restablecida a fábrica."]);
        } catch (Exception $e) {
            header("HTTP/1.1 500 Internal Server Error");
            echo json_encode(["error" => "Error crítico: " . $e->getMessage()]);
        }
    }
}
?>
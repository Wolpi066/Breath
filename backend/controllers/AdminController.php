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
        $auth = new AuthController($this->db, $this->requestMethod);
        $user = $auth->validateToken();

        if (!$user || $user->role !== 'admin') {
            header("HTTP/1.1 403 Forbidden");
            echo json_encode(["error" => "Acceso denegado"]);
            return;
        }

        if ($action === 'reset-db' && $this->requestMethod == 'POST') {
            $this->resetDatabase();
        } else {
            header("HTTP/1.1 404 Not Found");
            echo json_encode(["error" => "Acción no encontrada"]);
        }
    }

    private function resetDatabase()
    {
        try {
            // 1. Ejecutar SQL de reset
            $sqlFile = realpath(__DIR__ . '/../../adicional/reset.sql');
            if (!$sqlFile || !file_exists($sqlFile)) {
                throw new Exception("Archivo SQL no encontrado");
            }

            $sql = file_get_contents($sqlFile);
            $queries = explode(';', $sql);

            foreach ($queries as $query) {
                $query = trim($query);
                if (!empty($query))
                    $this->db->exec($query);
            }

            // 2. LIMPIEZA DE IMÁGENES FÍSICAS
            $this->cleanUploadsFolder();

            header("HTTP/1.1 200 OK");
            echo json_encode(["message" => "DB Reseteada y carpetas de imágenes limpiadas."]);

        } catch (Exception $e) {
            header("HTTP/1.1 500 Internal Server Error");
            echo json_encode(["error" => "Error reset", "details" => $e->getMessage()]);
        }
    }

    private function cleanUploadsFolder()
    {
        $folder = __DIR__ . '/../uploads/products/';

        if (!is_dir($folder))
            return;

        $files = glob($folder . '*'); // Obtener todos los archivos
        foreach ($files as $file) {
            if (is_file($file)) {
                unlink($file); // Borrar archivo
            }
        }
    }
}
?>
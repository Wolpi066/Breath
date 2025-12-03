<?php
// Ajustamos la ruta para incluir AuthController correctamente
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
        // 1. Validar Token y Rol
        $auth = new AuthController($this->db, $this->requestMethod);
        $user = $auth->validateToken();

        // Si no hay usuario o no es admin, error
        if (!$user || $user->role !== 'admin') {
            header("HTTP/1.1 403 Forbidden");
            echo json_encode(["error" => "Acceso denegado. Se requiere nivel Admin."]);
            return;
        }

        // 2. Rutas de Admin
        if ($action === 'reset-db' && $this->requestMethod == 'POST') {
            $this->resetDatabase();
        } else {
            header("HTTP/1.1 404 Not Found");
            echo json_encode(["error" => "Acción no encontrada: " . $action]);
        }
    }

    private function resetDatabase()
    {
        try {
            // ⚠️ CORRECCIÓN DE RUTA:
            // __DIR__ es '.../backend/controllers'
            // Subimos a backend (../), subimos a raiz (../), entramos a adicional
            $sqlFile = realpath(__DIR__ . '/../../adicional/reset.sql');

            if (!$sqlFile || !file_exists($sqlFile)) {
                // Debug: mostramos dónde intentó buscar para que sepas qué pasa
                throw new Exception("No se encuentra el archivo reset.sql. Ruta buscada: " . __DIR__ . '/../../adicional/reset.sql');
            }

            $sql = file_get_contents($sqlFile);

            // Ejecutar consultas múltiples (partimos por punto y coma para mayor compatibilidad)
            $queries = explode(';', $sql);

            foreach ($queries as $query) {
                $query = trim($query);
                if (!empty($query)) {
                    $this->db->exec($query);
                }
            }

            header("HTTP/1.1 200 OK");
            echo json_encode(["message" => "Base de datos restablecida exitosamente desde la carpeta 'adicional'."]);

        } catch (Exception $e) {
            header("HTTP/1.1 500 Internal Server Error");
            echo json_encode([
                "error" => "Error al restaurar DB",
                "details" => $e->getMessage()
            ]);
        }
    }
}
?>
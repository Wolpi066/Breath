<?php
// 1. Cargar Helpers PRIMERO
require_once 'helpers/EnvLoader.php';
require_once 'helpers/ApiResponse.php';

// 2. Cargar Entorno INMEDIATAMENTE
try {
    EnvLoader::load(__DIR__ . '/.env');
} catch (Exception $e) {
    // En producción esto podría ignorarse o loguearse
    error_log("Error cargando .env: " . $e->getMessage());
}

// 3. Configurar CORS (Usando la variable de entorno cargada)
require_once 'config/Cors.php'; // Asegúrate de que Cors.php use getenv('FRONTEND_URL') o lo manejes aquí
// Nota: Si Cors.php ya tiene la lógica de headers, está bien. 
// Si no, asegúrate de que use el $origin correcto.
// Reafirmamos los headers por seguridad si Cors.php no lo hace dinámico:
$origin = getenv('FRONTEND_URL') ?: '*';
header("Access-Control-Allow-Origin: $origin");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 4. Conectar a Base de Datos (AHORA SÍ, porque ya tenemos las variables)
require_once 'config/Database.php';
$database = new Database();
$db = $database->getConnection();

// 5. Enrutamiento
$scriptName = dirname($_SERVER['SCRIPT_NAME']);
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = str_replace($scriptName, '', $requestUri);
$pathParts = explode('/', trim($path, '/'));

$resource = $pathParts[0] ?? null;
$subResource = $pathParts[1] ?? null; // ID o acción secundaria
$requestMethod = $_SERVER["REQUEST_METHOD"];

// Router
switch ($resource) {
    case 'products':
        require_once 'controllers/ProductController.php';
        $controller = new ProductController($db, $requestMethod);
        $controller->processRequest($subResource);
        break;

    case 'auth':
        require_once 'controllers/AuthController.php';
        $controller = new AuthController($db, $requestMethod);
        $controller->processRequest();
        break;

    case 'reviews':
        require_once 'controllers/ReviewController.php';
        $controller = new ReviewController($db, $requestMethod);
        // Si el subResource es un número, es un ID para borrar. Si no, puede ser null para crear/listar.
        $id = is_numeric($subResource) ? (int) $subResource : null;
        $controller->processRequest($id);
        break;

    case 'admin':
        require_once 'controllers/AdminController.php';
        $controller = new AdminController($db, $requestMethod);
        $controller->processRequest($subResource); // 'reset-db'
        break;

    default:
        ApiResponse::error("Endpoint no encontrado: $resource", 404);
        break;
}
?>
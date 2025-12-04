<?php
// 1. Cargar Helpers
require_once 'helpers/EnvLoader.php';
require_once 'helpers/ApiResponse.php';

// 2. Cargar Entorno
try {
    EnvLoader::load(__DIR__ . '/.env');
} catch (Exception $e) {
    error_log("Error cargando .env: " . $e->getMessage());
}

// 3. Configurar CORS
require_once 'config/Cors.php';
$origin = getenv('FRONTEND_URL') ?: '*';
header("Access-Control-Allow-Origin: $origin");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 4. Conectar a Base de Datos
require_once 'config/Database.php';
$database = new Database();
$db = $database->getConnection();

// 5. Enrutamiento
$scriptName = dirname($_SERVER['SCRIPT_NAME']);
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = str_replace($scriptName, '', $requestUri);
$pathParts = explode('/', trim($path, '/'));

$resource = $pathParts[0] ?? null;
$subResource = $pathParts[1] ?? null;
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
        $id = is_numeric($subResource) ? (int) $subResource : null;
        $controller->processRequest($id);
        break;

    case 'admin':
        require_once 'controllers/AdminController.php';
        $controller = new AdminController($db, $requestMethod);
        $controller->processRequest($subResource);
        break;

    default:
        ApiResponse::error("Endpoint no encontrado: $resource", 404);
        break;
}
?>
<?php
require_once 'config/Cors.php';
require_once 'config/Database.php';

$scriptName = dirname($_SERVER['SCRIPT_NAME']);
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = str_replace($scriptName, '', $requestUri);
$pathParts = explode('/', trim($path, '/'));

$resource = $pathParts[0] ?? null;
$subResource = $pathParts[1] ?? null;
$requestMethod = $_SERVER["REQUEST_METHOD"];

$database = new Database();
$db = $database->getConnection();

switch ($resource) {
    case 'products':
        require_once 'controllers/ProductController.php';
        $controller = new ProductController($db, $requestMethod);
        $id = is_numeric($subResource) ? (int) $subResource : null;
        $controller->processRequest($id);
        break;

    case 'auth':
        require_once 'controllers/AuthController.php';
        $controller = new AuthController($db, $requestMethod);
        if ($requestMethod == 'POST') {
            $input = json_decode(file_get_contents('php://input'), true);
            $_POST = $input ?? [];
            if ($subResource == 'register') {
                $_POST['action'] = 'register';
            }
        }
        $controller->processRequest();
        break;

    case 'reviews': // ✅ NUEVO ENDPOINT AGREGADO
        require_once 'controllers/ReviewController.php';
        $controller = new ReviewController($db, $requestMethod);
        // Si hay ID en la URL (ej: /reviews/5), se pasa al controlador
        $id = is_numeric($subResource) ? (int) $subResource : null;
        $controller->processRequest($id);
        break;

    case 'admin':
        require_once 'controllers/AdminController.php';
        $controller = new AdminController($db, $requestMethod);
        $controller->processRequest($subResource); // subResource = 'reset-db'
        break;

    default:
        header("HTTP/1.1 404 Not Found");
        echo json_encode(["message" => "Endpoint no encontrado"]);
        break;
}
?>
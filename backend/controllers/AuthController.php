<?php
// Rutas absolutas para evitar fallos
$models_path = realpath(__DIR__ . '/../models');
require_once $models_path . '/User.php';

$jwt_file = realpath(__DIR__ . '/../Firebase/JWT/JWT.php');
if (!$jwt_file) {
    // Usamos ApiResponse si está disponible, sino json_encode manual
    http_response_code(500);
    die(json_encode(["error" => "Libreria JWT no encontrada"]));
}
require_once $jwt_file;

use \Firebase\JWT\JWT;

require_once __DIR__ . '/../helpers/ApiResponse.php'; // Aseguramos tener el helper

class AuthController
{
    private $db;
    private $requestMethod;
    private $userModel;
    // La secret key ya no se guarda aquí como propiedad fija

    public function __construct($db, $requestMethod)
    {
        $this->db = $db;
        $this->requestMethod = $requestMethod;
        $this->userModel = new User($db);
    }

    public function processRequest()
    {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        // Soporte para form-data si fuera necesario, pero priorizamos JSON
        if (empty($input) && !empty($_POST)) {
            $input = $_POST;
        }

        if ($this->requestMethod == 'POST') {
            if (isset($input['action']) && $input['action'] == 'register') {
                $this->register($input);
            } else {
                $this->login($input);
            }
        } else {
            ApiResponse::error("Método no permitido", 405);
        }
    }

    public function validateToken()
    {
        $headers = apache_request_headers();
        $token = null;

        if (isset($headers['Authorization'])) {
            if (preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches)) {
                $token = $matches[1];
            }
        }

        if (!$token)
            return false;

        try {
            // ✅ LEER SECRETO DEL ENTORNO
            $secret = getenv('JWT_SECRET');
            if (!$secret)
                throw new Exception("JWT Secret no configurado");

            $decoded = JWT::decode($token, $secret, array('HS256'));
            return $decoded->data;
        } catch (Exception $e) {
            return false;
        }
    }

    private function login($data)
    {
        if (!isset($data['username']) || !isset($data['password'])) {
            ApiResponse::error("Faltan credenciales", 400);
        }

        $this->userModel->username = $data['username'];

        // Verificar existencia por username
        if (!$this->userModel->usernameExists()) {
            // Intentar por email si el username falló
            $this->userModel->email = $data['username'];
            if (!$this->userModel->emailExists()) {
                ApiResponse::error("Usuario no encontrado", 401);
            }
        }

        if (password_verify($data['password'], $this->userModel->password)) {
            // ✅ LEER SECRETO DEL ENTORNO
            $secret = getenv('JWT_SECRET');

            $payload = array(
                'iss' => getenv('FRONTEND_URL') ?: "http://localhost",
                'aud' => getenv('FRONTEND_URL') ?: "http://localhost",
                'iat' => time(),
                'exp' => time() + (3600 * 24), // 24 horas
                'data' => array(
                    'id' => $this->userModel->id,
                    'username' => $this->userModel->username,
                    'role' => $this->userModel->role
                )
            );

            $jwt = JWT::encode($payload, $secret);

            ApiResponse::send([
                "message" => "Login exitoso",
                "token" => $jwt,
                "user" => [
                    "username" => $this->userModel->username,
                    "role" => $this->userModel->role
                ]
            ]);
        } else {
            ApiResponse::error("Contraseña incorrecta", 401);
        }
    }

    private function register($data)
    {
        if (!isset($data['username']) || !isset($data['email']) || !isset($data['password'])) {
            ApiResponse::error("Datos incompletos", 400);
        }

        $this->userModel->username = $data['username'];
        $this->userModel->email = $data['email'];
        $this->userModel->password = $data['password'];
        $this->userModel->role = 'user'; // Default

        if ($this->userModel->create()) {
            ApiResponse::send(["message" => "Usuario registrado exitosamente"], 201);
        } else {
            ApiResponse::error("Error al registrar. Usuario o email ya existen.", 503);
        }
    }
}
?>
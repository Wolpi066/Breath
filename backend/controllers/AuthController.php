<?php
// Rutas absolutas para evitar fallos en Windows/XAMPP
$models_path = realpath(__DIR__ . '/../models');
require_once $models_path . '/User.php';

$jwt_file = realpath(__DIR__ . '/../Firebase/JWT/JWT.php');
if (!$jwt_file)
    die(json_encode(["error" => "Libreria JWT no encontrada en: " . __DIR__ . '/../Firebase/JWT/JWT.php']));
require_once $jwt_file;

use \Firebase\JWT\JWT;

class AuthController
{
    private $db;
    private $requestMethod;
    private $userModel;
    private $secret_key = "TU_SECRETO_SUPER_SEGURO_BREATH_2025";

    public function __construct($db, $requestMethod)
    {
        $this->db = $db;
        $this->requestMethod = $requestMethod;
        $this->userModel = new User($db);
    }

    public function processRequest()
    {
        $input = !empty($_POST) ? $_POST : json_decode(file_get_contents('php://input'), true);

        if ($this->requestMethod == 'POST') {
            if (isset($input['action']) && $input['action'] == 'register') {
                $this->register($input);
            } else {
                $this->login($input);
            }
        } else {
            header("HTTP/1.1 405 Method Not Allowed");
        }
    }

    // --- VALIDAR TOKEN (Simplificado sin clase Key) ---
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
            // Decodificación compatible con la versión de JWT provista
            $decoded = JWT::decode($token, $this->secret_key, array('HS256'));
            return $decoded->data;
        } catch (Exception $e) {
            return false;
        }
    }

    private function login($data)
    {
        if (!isset($data['username']) || !isset($data['password'])) {
            header("HTTP/1.1 400 Bad Request");
            echo json_encode(["error" => "Faltan credenciales"]);
            return;
        }

        $this->userModel->username = $data['username'];
        if (!$this->userModel->usernameExists()) {
            $this->userModel->email = $data['username'];
            if (!$this->userModel->emailExists()) {
                header("HTTP/1.1 401 Unauthorized");
                echo json_encode(["error" => "Usuario no encontrado"]);
                return;
            }
        }

        if (password_verify($data['password'], $this->userModel->password)) {
            $payload = array(
                'iss' => "http://localhost/Breath",
                'aud' => "http://localhost/Breath",
                'iat' => time(),
                'exp' => time() + (3600 * 24),
                'data' => array(
                    'id' => $this->userModel->id,
                    'username' => $this->userModel->username,
                    'role' => $this->userModel->role
                )
            );

            $jwt = JWT::encode($payload, $this->secret_key);

            header("HTTP/1.1 200 OK");
            echo json_encode([
                "message" => "Login exitoso",
                "token" => $jwt,
                "user" => [
                    "username" => $this->userModel->username,
                    "role" => $this->userModel->role
                ]
            ]);
        } else {
            header("HTTP/1.1 401 Unauthorized");
            echo json_encode(["error" => "Contraseña incorrecta"]);
        }
    }

    private function register($data)
    {
        $this->userModel->username = $data['username'];
        $this->userModel->email = $data['email'];
        $this->userModel->password = $data['password'];
        $this->userModel->role = 'user';

        if ($this->userModel->create()) {
            header("HTTP/1.1 201 Created");
            echo json_encode(["message" => "Usuario registrado exitosamente"]);
        } else {
            header("HTTP/1.1 503 Service Unavailable");
            echo json_encode(["error" => "Error al registrar. El usuario o email ya existen."]);
        }
    }
}
?>
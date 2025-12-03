<?php
require_once __DIR__ . '/AuthController.php';
require_once __DIR__ . '/../models/Review.php';

class ReviewController
{
    private $db;
    private $requestMethod;
    private $reviewModel;

    public function __construct($db, $requestMethod)
    {
        $this->db = $db;
        $this->requestMethod = $requestMethod;
        $this->reviewModel = new Review($db);
    }

    public function processRequest($id = null)
    {
        // Envolver todo en try-catch para evitar errores HTML que rompan el JSON
        try {
            $auth = new AuthController($this->db, $this->requestMethod);

            switch ($this->requestMethod) {
                case 'GET':
                    if (isset($_GET['product_id'])) {
                        $this->getReviewsByProduct($_GET['product_id']);
                    } else {
                        $this->jsonResponse(["error" => "Falta product_id"], 400);
                    }
                    break;

                case 'POST':
                    $user = $auth->validateToken(); // Esto devuelve un OBJETO (stdClass)
                    if (!$user) {
                        $this->jsonResponse(["error" => "Debes iniciar sesión"], 401);
                        return;
                    }
                    $input = json_decode(file_get_contents('php://input'), true);

                    // ⚠️ CORRECCIÓN AQUÍ: Usar ->id en lugar de ['id']
                    $this->createReview($input, $user->id);
                    break;

                case 'DELETE':
                    $user = $auth->validateToken(); // Esto devuelve un OBJETO
                    if (!$user || !$id) {
                        $this->jsonResponse(["error" => "Faltan datos o permisos"], 400);
                        return;
                    }
                    $this->deleteReview($id, $user);
                    break;

                default:
                    $this->jsonResponse(["error" => "Método no permitido"], 405);
                    break;
            }
        } catch (Exception $e) {
            // Captura cualquier error fatal y lo devuelve como JSON
            $this->jsonResponse(["error" => "Error del Servidor: " . $e->getMessage()], 500);
        }
    }

    private function getReviewsByProduct($productId)
    {
        $result = $this->reviewModel->getByProduct($productId);
        echo json_encode($result);
    }

    private function createReview($data, $userId)
    {
        if (!isset($data['product_id']) || !isset($data['rating']) || !isset($data['comment'])) {
            $this->jsonResponse(["error" => "Datos incompletos"], 400);
            return;
        }

        if ($this->reviewModel->create($userId, $data['product_id'], $data['rating'], $data['comment'])) {
            $this->jsonResponse(["message" => "Reseña creada"], 201);
        } else {
            $this->jsonResponse(["error" => "No se pudo guardar la reseña"], 500);
        }
    }

    private function deleteReview($reviewId, $user)
    {
        $review = $this->reviewModel->getOne($reviewId);

        if (!$review) {
            $this->jsonResponse(["error" => "Reseña no encontrada"], 404);
            return;
        }

        // ⚠️ CORRECCIÓN AQUÍ TAMBIÉN: Usar ->role y ->id
        if ($user->role === 'admin' || $user->id == $review['user_id']) {
            if ($this->reviewModel->delete($reviewId)) {
                $this->jsonResponse(["message" => "Reseña eliminada"], 200);
            } else {
                $this->jsonResponse(["error" => "Error al eliminar"], 500);
            }
        } else {
            $this->jsonResponse(["error" => "No tienes permiso para borrar esta reseña"], 403);
        }
    }

    // Helper para responder JSON siempre
    private function jsonResponse($data, $status)
    {
        header("HTTP/1.1 " . $status);
        echo json_encode($data);
    }
}
?>
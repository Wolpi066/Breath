<?php
require_once __DIR__ . '/AuthController.php';
require_once __DIR__ . '/../models/Review.php';
require_once __DIR__ . '/../helpers/ApiResponse.php';

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
        $auth = new AuthController($this->db, $this->requestMethod);

        switch ($this->requestMethod) {
            case 'GET':
                if (isset($_GET['product_id'])) {
                    $this->getReviewsByProduct($_GET['product_id']);
                } else {
                    ApiResponse::error("Falta product_id", 400);
                }
                break;

            case 'POST':
                $user = $auth->validateToken();
                if (!$user)
                    ApiResponse::error("Debes iniciar sesión", 401);

                $input = json_decode(file_get_contents('php://input'), true);
                $this->createReview($input, $user->id);
                break;

            case 'DELETE':
                $user = $auth->validateToken();
                if (!$user)
                    ApiResponse::error("Acceso no autorizado", 401);
                if (!$id)
                    ApiResponse::error("Falta el ID de la reseña", 400);

                $this->deleteReview($id, $user);
                break;

            default:
                ApiResponse::error("Método no permitido", 405);
                break;
        }
    }

    private function getReviewsByProduct($productId)
    {
        $result = $this->reviewModel->getByProduct($productId);
        ApiResponse::send($result);
    }

    private function createReview($data, $userId)
    {
        if (!isset($data['product_id']) || !isset($data['rating']) || !isset($data['comment'])) {
            ApiResponse::error("Datos incompletos", 400);
        }

        if ($this->reviewModel->create($userId, $data['product_id'], $data['rating'], $data['comment'])) {
            ApiResponse::send(["message" => "Reseña creada"], 201);
        } else {
            ApiResponse::error("No se pudo guardar la reseña");
        }
    }

    private function deleteReview($reviewId, $user)
    {
        $review = $this->reviewModel->getOne($reviewId);

        if (!$review) {
            ApiResponse::error("Reseña no encontrada", 404);
        }

        if ($user->role === 'admin' || $user->id == $review['user_id']) {
            if ($this->reviewModel->delete($reviewId)) {
                ApiResponse::send(["message" => "Reseña eliminada"]);
            } else {
                ApiResponse::error("Error al eliminar la reseña");
            }
        } else {
            ApiResponse::error("No tienes permiso para borrar esta reseña", 403);
        }
    }
}
?>
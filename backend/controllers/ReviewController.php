<?php
require_once __DIR__ . '/AuthController.php';

class ReviewController
{
    private $db;
    private $requestMethod;

    public function __construct($db, $requestMethod)
    {
        $this->db = $db;
        $this->requestMethod = $requestMethod;
    }

    public function processRequest($id = null)
    {
        // Validar Token (Necesario para crear o borrar)
        $auth = new AuthController($this->db, $this->requestMethod);
        $user = $auth->validateToken();

        switch ($this->requestMethod) {
            case 'POST':
                if (!$user) {
                    header("HTTP/1.1 401 Unauthorized");
                    echo json_encode(["error" => "Debes iniciar sesión"]);
                    return;
                }
                $input = json_decode(file_get_contents('php://input'), true);
                $this->createReview($input, $user['id']);
                break;

            case 'DELETE':
                if (!$user || !$id) {
                    header("HTTP/1.1 400 Bad Request");
                    echo json_encode(["error" => "Faltan datos o permisos"]);
                    return;
                }
                $this->deleteReview($id, $user);
                break;

            case 'GET':
                // Obtener reseñas de un producto (público)
                if (isset($_GET['product_id'])) {
                    $this->getReviewsByProduct($_GET['product_id']);
                }
                break;
        }
    }

    private function createReview($data, $userId)
    {
        // ... lógica de insert ...
        $query = "INSERT INTO reviews (user_id, product_id, rating, comment) VALUES (:uid, :pid, :rating, :comment)";
        $stmt = $this->db->prepare($query);
        $stmt->execute([
            ':uid' => $userId,
            ':pid' => $data['product_id'],
            ':rating' => $data['rating'],
            ':comment' => $data['comment']
        ]);
        echo json_encode(["message" => "Reseña creada"]);
    }

    private function deleteReview($reviewId, $user)
    {
        // 1. Verificar quién es el dueño de la reseña
        $query = "SELECT user_id FROM reviews WHERE id = :id";
        $stmt = $this->db->prepare($query);
        $stmt->execute([':id' => $reviewId]);
        $review = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$review) {
            header("HTTP/1.1 404 Not Found");
            echo json_encode(["error" => "Reseña no encontrada"]);
            return;
        }

        // 2. Permisos: ¿Es Admin O es el dueño?
        if ($user['role'] === 'admin' || $user['id'] == $review['user_id']) {
            $delQuery = "DELETE FROM reviews WHERE id = :id";
            $delStmt = $this->db->prepare($delQuery);
            $delStmt->execute([':id' => $reviewId]);
            echo json_encode(["message" => "Reseña eliminada"]);
        } else {
            header("HTTP/1.1 403 Forbidden");
            echo json_encode(["error" => "No tienes permiso para borrar esto"]);
        }
    }

    private function getReviewsByProduct($productId)
    {
        // Traer reseñas con el nombre de usuario
        $query = "SELECT r.*, u.username 
                  FROM reviews r 
                  JOIN users u ON r.user_id = u.id 
                  WHERE r.product_id = :pid 
                  ORDER BY r.created_at DESC";
        $stmt = $this->db->prepare($query);
        $stmt->execute([':pid' => $productId]);
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($result);
    }
}
?>
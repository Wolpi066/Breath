<?php
class Review
{
    private $conn;
    private $table_name = "reviews";

    public function __construct($db)
    {
        $this->conn = $db;
    }

    // --- CREAR RESEÑA ---
    public function create($userId, $productId, $rating, $comment)
    {
        $query = "INSERT INTO " . $this->table_name . " 
                  (user_id, product_id, rating, comment) 
                  VALUES (:uid, :pid, :rating, :comment)";

        $stmt = $this->conn->prepare($query);

        // Sanitización básica
        $comment = htmlspecialchars(strip_tags($comment));

        $stmt->bindParam(':uid', $userId);
        $stmt->bindParam(':pid', $productId);
        $stmt->bindParam(':rating', $rating);
        $stmt->bindParam(':comment', $comment);

        return $stmt->execute();
    }

    // --- OBTENER POR PRODUCTO ---
    public function getByProduct($productId)
    {
        $query = "SELECT r.id, r.user_id, r.rating, r.comment, r.created_at, u.username 
                  FROM " . $this->table_name . " r
                  JOIN users u ON r.user_id = u.id
                  WHERE r.product_id = :pid
                  ORDER BY r.created_at DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':pid', $productId);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Obtener una reseña por ID
     * @param int|string $id
     * @return array|false
     */
    public function getOne($id)
    {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // --- ELIMINAR ---
    public function delete($id)
    {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }
}
?>
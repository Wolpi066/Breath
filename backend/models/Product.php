<?php
class Product
{
    private $conn;
    private $table_name = "products";

    public function __construct($db)
    {
        $this->conn = $db;
    }


    public function getAll()
    {
        $query = "SELECT 
                    p.id, p.name, p.description, p.category, p.price, p.discount, 
                    p.main_image, p.hover_image,
                    s.name as size_name, pv.stock
                  FROM " . $this->table_name . " p
                  LEFT JOIN product_variants pv ON p.id = pv.product_id
                  LEFT JOIN sizes s ON pv.size_id = s.id
                  ORDER BY p.id DESC, s.id ASC";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
        } catch (PDOException $e) {
            return [];
        }

        $products_map = [];

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $id = $row['id'];
            if (!isset($products_map[$id])) {
                $products_map[$id] = [
                    'id' => (string) $row['id'],
                    'name' => $row['name'],
                    'description' => $row['description'],
                    'category' => $row['category'],
                    'price' => (float) $row['price'],
                    'discount' => (int) $row['discount'],
                    'mainImage' => $row['main_image'],
                    'hoverImage' => $row['hover_image'],
                    'sizes' => []
                ];
            }
            if ($row['size_name'] != null) {
                $products_map[$id]['sizes'][] = [
                    'size' => $row['size_name'],
                    'stock' => (int) $row['stock']
                ];
            }
        }
        return array_values($products_map);
    }


    public function getOne($id)
    {
        $query = "SELECT 
                    p.id, p.name, p.description, p.category, p.price, p.discount, 
                    p.main_image, p.hover_image,
                    s.name as size_name, pv.stock
                  FROM " . $this->table_name . " p
                  LEFT JOIN product_variants pv ON p.id = pv.product_id
                  LEFT JOIN sizes s ON pv.size_id = s.id
                  WHERE p.id = :id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();

        $product = null;

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            if (!$product) {
                $product = [
                    'id' => (string) $row['id'],
                    'name' => $row['name'],
                    'description' => $row['description'],
                    'category' => $row['category'],
                    'price' => (float) $row['price'],
                    'discount' => (int) $row['discount'],
                    'mainImage' => $row['main_image'],
                    'hoverImage' => $row['hover_image'],
                    'sizes' => []
                ];
            }
            if ($row['size_name'] != null) {
                $product['sizes'][] = [
                    'size' => $row['size_name'],
                    'stock' => (int) $row['stock']
                ];
            }
        }
        return $product;
    }


    public function create($data)
    {
        try {
            $this->conn->beginTransaction();

            $query = "INSERT INTO " . $this->table_name . " 
                      (name, description, category, price, discount, main_image, hover_image) 
                      VALUES (:name, :description, :category, :price, :discount, :main_image, :hover_image)";

            $stmt = $this->conn->prepare($query);

            $stmt->bindParam(":name", $data['name']);
            $stmt->bindParam(":description", $data['description']);
            $stmt->bindParam(":category", $data['category']);
            $stmt->bindParam(":price", $data['price']);
            $stmt->bindParam(":discount", $data['discount']);
            $stmt->bindParam(":main_image", $data['mainImage']);
            $stmt->bindParam(":hover_image", $data['hoverImage']);

            $stmt->execute();
            $product_id = $this->conn->lastInsertId();

            if (!empty($data['sizes'])) {
                $this->insertSizes($product_id, $data['sizes']);
            }

            $this->conn->commit();
            return true;

        } catch (Exception $e) {
            $this->conn->rollBack();
            return false;
        }
    }

    public function update($data)
    {
        try {
            $this->conn->beginTransaction();

            $query = "UPDATE " . $this->table_name . " 
                      SET name = :name, 
                          description = :description, 
                          category = :category, 
                          price = :price, 
                          discount = :discount, 
                          main_image = :main_image, 
                          hover_image = :hover_image
                      WHERE id = :id";

            $stmt = $this->conn->prepare($query);

            $stmt->bindParam(":name", $data['name']);
            $stmt->bindParam(":description", $data['description']);
            $stmt->bindParam(":category", $data['category']);
            $stmt->bindParam(":price", $data['price']);
            $stmt->bindParam(":discount", $data['discount']);
            $stmt->bindParam(":main_image", $data['mainImage']);
            $stmt->bindParam(":hover_image", $data['hoverImage']);
            $stmt->bindParam(":id", $data['id']);

            $stmt->execute();


            $delQuery = "DELETE FROM product_variants WHERE product_id = :id";
            $delStmt = $this->conn->prepare($delQuery);
            $delStmt->bindParam(":id", $data['id']);
            $delStmt->execute();

            if (!empty($data['sizes'])) {
                $this->insertSizes($data['id'], $data['sizes']);
            }

            $this->conn->commit();
            return true;

        } catch (Exception $e) {
            $this->conn->rollBack();
            return false;
        }
    }


    public function delete($id)
    {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        return $stmt->execute();
    }


    public function getCategories()
    {
        $query = "SELECT DISTINCT category FROM " . $this->table_name . " ORDER BY category ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }


    private function insertSizes($product_id, $sizes)
    {
        $query = "INSERT INTO product_variants (product_id, size_id, stock) VALUES (:pid, :sid, :stock)";
        $stmt = $this->conn->prepare($query);

        foreach ($sizes as $sizeObj) {
            $sizeName = $sizeObj['size'];
            $stock = $sizeObj['stock'];

            $idQuery = "SELECT id FROM sizes WHERE name = :name LIMIT 1";
            $idStmt = $this->conn->prepare($idQuery);
            $idStmt->bindParam(":name", $sizeName);
            $idStmt->execute();

            if ($row = $idStmt->fetch(PDO::FETCH_ASSOC)) {
                $size_id = $row['id'];
                $stmt->bindParam(":pid", $product_id);
                $stmt->bindParam(":sid", $size_id);
                $stmt->bindParam(":stock", $stock);
                $stmt->execute();
            }
        }
    }
}
?>
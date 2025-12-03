<?php
require_once __DIR__ . '/../models/Product.php';

class ProductController
{
    private $db;
    private $requestMethod;
    private $productModel;

    public function __construct($db, $requestMethod)
    {
        $this->db = $db;
        $this->requestMethod = $requestMethod;
        $this->productModel = new Product($db);
    }

    public function processRequest($id = null)
    {
        $input = json_decode(file_get_contents('php://input'), true);

        switch ($this->requestMethod) {
            case 'GET':
                if ($id)
                    echo json_encode(["message" => "Single product pending"]);
                else
                    $this->getAllProducts();
                break;
            case 'POST':
                $this->createProduct($input);
                break;
            case 'PUT':
                if ($id && $input) {
                    $input['id'] = $id;
                    $this->updateProduct($input);
                } else {
                    header("HTTP/1.1 400 Bad Request");
                    echo json_encode(["error" => "Datos faltantes"]);
                }
                break;
            case 'DELETE':
                if ($id)
                    $this->deleteProduct($id);
                break;
            default:
                header("HTTP/1.1 405 Method Not Allowed");
                break;
        }
    }

    private function getAllProducts()
    {
        echo json_encode($this->productModel->getAll());
    }

    private function createProduct($data)
    {
        if (isset($data['mainImage']))
            $data['mainImage'] = $this->saveImage($data['mainImage'], 'products');
        if (isset($data['hoverImage']))
            $data['hoverImage'] = $this->saveImage($data['hoverImage'], 'products');

        if ($this->productModel->create($data)) {
            header("HTTP/1.1 201 Created");
            echo json_encode(["message" => "Creado"]);
        } else {
            header("HTTP/1.1 500 Error");
            echo json_encode(["error" => "Error al crear"]);
        }
    }

    private function updateProduct($data)
    {
        // 1. Obtener el producto actual para saber qué imágenes tenía
        $currentProduct = $this->getProductById($data['id']);

        // 2. Procesar Main Image
        if (isset($data['mainImage']) && strpos($data['mainImage'], 'data:image') === 0) {
            // Si hay imagen nueva, borramos la vieja
            $this->deleteImageFile($currentProduct['main_image']);
            $data['mainImage'] = $this->saveImage($data['mainImage'], 'products');
        }

        // 3. Procesar Hover Image
        if (isset($data['hoverImage']) && strpos($data['hoverImage'], 'data:image') === 0) {
            $this->deleteImageFile($currentProduct['hover_image']);
            $data['hoverImage'] = $this->saveImage($data['hoverImage'], 'products');
        }

        if ($this->productModel->update($data)) {
            header("HTTP/1.1 200 OK");
            echo json_encode(["message" => "Actualizado"]);
        } else {
            header("HTTP/1.1 500 Error");
            echo json_encode(["error" => "Error al actualizar"]);
        }
    }

    private function deleteProduct($id)
    {
        // 1. Obtener datos antes de borrar para saber qué archivos eliminar
        $product = $this->getProductById($id);

        if ($this->productModel->delete($id)) {
            // 2. Si se borró de la DB, borramos los archivos físicos
            if ($product) {
                $this->deleteImageFile($product['main_image']);
                $this->deleteImageFile($product['hover_image']);
            }
            header("HTTP/1.1 200 OK");
            echo json_encode(["message" => "Eliminado"]);
        } else {
            header("HTTP/1.1 500 Error");
            echo json_encode(["error" => "Error al eliminar"]);
        }
    }

    // --- HELPERS ---

    private function getProductById($id)
    {
        // Pequeña query auxiliar directa para obtener rutas de imágenes
        $query = "SELECT main_image, hover_image FROM products WHERE id = :id LIMIT 1";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    private function deleteImageFile($path)
    {
        if (!$path)
            return;

        // El path viene como "uploads/products/foto.jpg"
        // Agregamos __DIR__ para llegar a la ruta absoluta desde 'controllers'
        $fullPath = __DIR__ . '/../' . $path;

        // Solo borramos si es un archivo real y no una URL externa o asset estático
        if (file_exists($fullPath) && strpos($path, 'uploads/') === 0) {
            unlink($fullPath);
        }
    }

    private function saveImage($base64_string, $subfolder)
    {
        if (strpos($base64_string, 'data:image') !== 0)
            return $base64_string;

        $parts = explode(',', $base64_string);
        $data = $parts[1];

        // Detectar extensión
        $extension = 'jpg';
        if (strpos($parts[0], 'png') !== false)
            $extension = 'png';
        elseif (strpos($parts[0], 'webp') !== false)
            $extension = 'webp';

        $decodedData = base64_decode($data);
        $filename = uniqid() . '.' . $extension;

        $uploadDir = 'uploads/' . $subfolder . '/';

        // Crear carpeta física si no existe (relativa a index.php)
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        file_put_contents($uploadDir . $filename, $decodedData);
        return $uploadDir . $filename;
    }
}
?>
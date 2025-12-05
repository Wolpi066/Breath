<?php
require_once __DIR__ . '/../models/Product.php';
require_once __DIR__ . '/../services/ImageService.php';
require_once __DIR__ . '/../helpers/ApiResponse.php';

class ProductController
{
    private $db;
    private $requestMethod;
    private $productModel;
    private $imageService;

    public function __construct($db, $requestMethod)
    {
        $this->db = $db;
        $this->requestMethod = $requestMethod;
        $this->productModel = new Product($db);
        $this->imageService = new ImageService();
    }

    public function processRequest($id = null)
    {
        if ($this->requestMethod === 'GET' && $id === 'categories') {
            $this->getCategories();
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);

        switch ($this->requestMethod) {
            case 'GET':
                if ($id)
                    $this->getProductDetail($id);
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
                    ApiResponse::error("Datos faltantes para actualizar", 400);
                }
                break;
            case 'DELETE':
                if ($id)
                    $this->deleteProduct($id);
                else
                    ApiResponse::error("ID Requerido", 400);
                break;
            default:
                ApiResponse::error("Método no permitido", 405);
                break;
        }
    }

    private function getAllProducts()
    {
        ApiResponse::send($this->productModel->getAll());
    }

    private function getCategories()
    {
        ApiResponse::send($this->productModel->getCategories());
    }

    private function getProductDetail($id)
    {
        $product = $this->productModel->getOne($id);
        if ($product)
            ApiResponse::send($product);
        else
            ApiResponse::error("Producto no encontrado", 404);
    }

    private function createProduct($data)
    {
        // 1. Validación de seguridad
        $this->validateInput($data);

        // 2. Procesamiento de imágenes
        if (isset($data['mainImage'])) {
            $data['mainImage'] = $this->imageService->saveBase64($data['mainImage'], 'products');
        }
        if (isset($data['hoverImage'])) {
            $data['hoverImage'] = $this->imageService->saveBase64($data['hoverImage'], 'products');
        }

        // 3. Guardado
        if ($this->productModel->create($data)) {
            ApiResponse::send(["message" => "Producto creado exitosamente"], 201);
        } else {
            ApiResponse::error("Error interno al crear el producto");
        }
    }

    private function updateProduct($data)
    {
        // 1. Validación de seguridad
        $this->validateInput($data);

        $currentProduct = $this->getProductById($data['id']);
        if (!$currentProduct) {
            ApiResponse::error("Producto no encontrado para actualizar", 404);
        }

        // 2. Procesamiento de imágenes (Borrar viejas si cambian)
        if (isset($data['mainImage']) && strpos($data['mainImage'], 'data:image') === 0) {
            $this->imageService->deleteFile($currentProduct['main_image']);
            $data['mainImage'] = $this->imageService->saveBase64($data['mainImage'], 'products');
        }

        if (isset($data['hoverImage']) && strpos($data['hoverImage'], 'data:image') === 0) {
            $this->imageService->deleteFile($currentProduct['hover_image']);
            $data['hoverImage'] = $this->imageService->saveBase64($data['hoverImage'], 'products');
        }

        // 3. Actualización
        if ($this->productModel->update($data)) {
            ApiResponse::send(["message" => "Producto actualizado exitosamente"]);
        } else {
            ApiResponse::error("Error al actualizar el producto");
        }
    }

    private function deleteProduct($id)
    {
        $product = $this->getProductById($id);

        if ($this->productModel->delete($id)) {
            // Borrar archivos físicos
            if ($product) {
                $this->imageService->deleteFile($product['main_image']);
                $this->imageService->deleteFile($product['hover_image']);
            }
            ApiResponse::send(["message" => "Producto eliminado"]);
        } else {
            ApiResponse::error("Error al eliminar el producto");
        }
    }

    // --- Helpers Privados ---

    private function validateInput($data)
    {
        if (empty($data['name']) || strlen(trim($data['name'])) < 3) {
            ApiResponse::error("El nombre es obligatorio y debe tener al menos 3 caracteres.", 400);
        }
        if (!isset($data['price']) || !is_numeric($data['price']) || $data['price'] < 0) {
            ApiResponse::error("El precio es obligatorio y debe ser un número positivo.", 400);
        }
        if (isset($data['discount']) && (!is_numeric($data['discount']) || $data['discount'] < 0 || $data['discount'] > 100)) {
            ApiResponse::error("El descuento debe ser un porcentaje entre 0 y 100.", 400);
        }
        if (empty($data['category'])) {
            ApiResponse::error("La categoría es obligatoria.", 400);
        }
    }

    private function getProductById($id)
    {
        $query = "SELECT main_image, hover_image FROM products WHERE id = :id LIMIT 1";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
?>
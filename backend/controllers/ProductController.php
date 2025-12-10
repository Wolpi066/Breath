<?php
require_once __DIR__ . '/../models/Product.php';
require_once __DIR__ . '/../services/ImageService.php';
require_once __DIR__ . '/../helpers/ApiResponse.php';
require_once __DIR__ . '/AuthController.php';

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
        $auth = new AuthController($this->db, $this->requestMethod);

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
                $this->verifyAdmin($auth);
                $this->createProduct($input);
                break;

            case 'PUT':
                $this->verifyAdmin($auth);
                if ($id && $input) {
                    $input['id'] = $id;
                    $this->updateProduct($input);
                } else {
                    ApiResponse::error("Datos faltantes para actualizar", 400);
                }
                break;

            case 'DELETE':
                $this->verifyAdmin($auth);
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



    private function verifyAdmin($auth)
    {
        $user = $auth->validateToken();
        if (!$user || $user->role !== 'admin') {
            ApiResponse::error("Acceso denegado. Rol de Admin requerido.", 403);
        }
    }

    private function validateInput($data)
    {

        if (empty($data['name']) || strlen(trim($data['name'])) < 3) {
            ApiResponse::error("El nombre es obligatorio y debe tener al menos 3 letras.", 400);
        }
        if (!isset($data['price']) || !is_numeric($data['price']) || $data['price'] < 0) {
            ApiResponse::error("El precio debe ser un número positivo.", 400);
        }
        if (isset($data['discount']) && (!is_numeric($data['discount']) || $data['discount'] < 0 || $data['discount'] > 100)) {
            ApiResponse::error("El descuento debe ser entre 0 y 100.", 400);
        }
        if (empty($data['category'])) {
            ApiResponse::error("La categoría es obligatoria.", 400);
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
        $this->validateInput($data);

        if (isset($data['mainImage'])) {
            $data['mainImage'] = $this->imageService->saveBase64($data['mainImage'], 'products');
        }
        if (isset($data['hoverImage'])) {
            $data['hoverImage'] = $this->imageService->saveBase64($data['hoverImage'], 'products');
        }

        if ($this->productModel->create($data)) {
            ApiResponse::send(["message" => "Producto creado correctamente"], 201);
        } else {
            ApiResponse::error("Error al guardar en base de datos");
        }
    }

    private function updateProduct($data)
    {
        $this->validateInput($data);

        $current = $this->getProductById($data['id']);
        if (!$current)
            ApiResponse::error("Producto no existe", 404);

        if (isset($data['mainImage']) && strpos($data['mainImage'], 'data:image') === 0) {
            $this->imageService->deleteFile($current['main_image']);
            $data['mainImage'] = $this->imageService->saveBase64($data['mainImage'], 'products');
        }

        if (isset($data['hoverImage']) && strpos($data['hoverImage'], 'data:image') === 0) {
            $this->imageService->deleteFile($current['hover_image']);
            $data['hoverImage'] = $this->imageService->saveBase64($data['hoverImage'], 'products');
        }

        if ($this->productModel->update($data)) {
            ApiResponse::send(["message" => "Producto actualizado"]);
        } else {
            ApiResponse::error("Error al actualizar");
        }
    }

    private function deleteProduct($id)
    {
        $product = $this->getProductById($id);
        if ($this->productModel->delete($id)) {
            if ($product) {
                $this->imageService->deleteFile($product['main_image']);
                $this->imageService->deleteFile($product['hover_image']);
            }
            ApiResponse::send(["message" => "Producto eliminado"]);
        } else {
            ApiResponse::error("Error al eliminar");
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
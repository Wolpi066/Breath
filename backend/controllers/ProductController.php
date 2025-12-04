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

    public function processRequest($id = null, $subAction = null)
    {
        $input = json_decode(file_get_contents('php://input'), true);

        if ($this->requestMethod === 'GET' && $id === 'categories') {
            $this->getCategories();
            return;
        }

        switch ($this->requestMethod) {
            case 'GET':
                if ($id)
                    ApiResponse::send(["message" => "Detalle pendiente"]);
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
                } else
                    ApiResponse::error("Datos faltantes", 400);
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

    private function createProduct($data)
    {
        if (!is_numeric($data['price']) || !is_numeric($data['discount'])) {
            ApiResponse::error("El precio y el descuento deben ser números.", 400);
        }
        if (strlen($data['name']) < 3) {
            ApiResponse::error("El nombre es muy corto.", 400);
        }
        if (isset($data['mainImage']))
            $data['mainImage'] = $this->imageService->saveBase64($data['mainImage'], 'products');
        if (isset($data['hoverImage']))
            $data['hoverImage'] = $this->imageService->saveBase64($data['hoverImage'], 'products');

        if ($this->productModel->create($data)) {
            ApiResponse::send(["message" => "Creado"], 201);
        } else {
            ApiResponse::error("Error al crear");
        }
    }

    private function updateProduct($data)
    {
        $currentProduct = $this->getProductById($data['id']);

        if (isset($data['mainImage']) && strpos($data['mainImage'], 'data:image') === 0) {
            $this->imageService->deleteFile($currentProduct['main_image']);
            $data['mainImage'] = $this->imageService->saveBase64($data['mainImage'], 'products');
        }

        if (isset($data['hoverImage']) && strpos($data['hoverImage'], 'data:image') === 0) {
            $this->imageService->deleteFile($currentProduct['hover_image']);
            $data['hoverImage'] = $this->imageService->saveBase64($data['hoverImage'], 'products');
        }

        if ($this->productModel->update($data)) {
            ApiResponse::send(["message" => "Actualizado"]);
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
            ApiResponse::send(["message" => "Eliminado"]);
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
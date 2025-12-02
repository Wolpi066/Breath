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
        // Leer el cuerpo JSON de la petición (para POST y PUT)
        $input = json_decode(file_get_contents('php://input'), true);

        switch ($this->requestMethod) {
            case 'GET':
                if ($id) {
                    echo json_encode(["message" => "Get single product pending"]);
                } else {
                    $this->getAllProducts();
                }
                break;

            case 'POST':
                $this->createProduct($input);
                break;

            case 'PUT':
                if ($id && $input) {
                    // Aseguramos que el ID venga en el objeto
                    $input['id'] = $id;
                    $this->updateProduct($input);
                } else {
                    header("HTTP/1.1 400 Bad Request");
                    echo json_encode(["error" => "Datos o ID faltantes"]);
                }
                break;

            case 'DELETE':
                if ($id) {
                    $this->deleteProduct($id);
                }
                break;

            default:
                header("HTTP/1.1 405 Method Not Allowed");
                break;
        }
    }

    private function getAllProducts()
    {
        $result = $this->productModel->getAll();
        echo json_encode($result);
    }

    private function createProduct($data)
    {
        // 1. Procesar Imágenes (Base64 -> Archivo)
        if (isset($data['mainImage'])) {
            $data['mainImage'] = $this->saveImage($data['mainImage'], 'products');
        }
        if (isset($data['hoverImage'])) {
            $data['hoverImage'] = $this->saveImage($data['hoverImage'], 'products');
        }

        // 2. Guardar en DB
        if ($this->productModel->create($data)) {
            header("HTTP/1.1 201 Created");
            echo json_encode(["message" => "Producto creado exitosamente"]);
        } else {
            header("HTTP/1.1 500 Internal Server Error");
            echo json_encode(["error" => "No se pudo crear el producto"]);
        }
    }

    private function updateProduct($data)
    {
        // 1. Procesar Imágenes si cambiaron
        // (Si viene 'assets/...' es que no cambió. Si viene 'data:image...' es nueva)
        if (isset($data['mainImage']) && strpos($data['mainImage'], 'data:image') === 0) {
            $data['mainImage'] = $this->saveImage($data['mainImage'], 'products');
        }
        if (isset($data['hoverImage']) && strpos($data['hoverImage'], 'data:image') === 0) {
            $data['hoverImage'] = $this->saveImage($data['hoverImage'], 'products');
        }

        // 2. Actualizar en DB
        if ($this->productModel->update($data)) {
            header("HTTP/1.1 200 OK");
            echo json_encode(["message" => "Producto actualizado"]);
        } else {
            header("HTTP/1.1 500 Internal Server Error");
            echo json_encode(["error" => "No se pudo actualizar"]);
        }
    }

    private function deleteProduct($id)
    {
        if ($this->productModel->delete($id)) {
            header("HTTP/1.1 200 OK");
            echo json_encode(["message" => "Producto eliminado"]);
        } else {
            header("HTTP/1.1 500 Internal Server Error");
            echo json_encode(["error" => "No se pudo eliminar"]);
        }
    }

    // --- HELPER: Guardar Base64 como archivo ---
    private function saveImage($base64_string, $subfolder)
    {
        // Si no es base64, devolver tal cual (ya es una ruta)
        if (strpos($base64_string, 'data:image') !== 0) {
            return $base64_string;
        }

        // 1. Separar la metadata del contenido
        // "data:image/png;base64,iVBORw0KGgo..."
        $parts = explode(',', $base64_string);
        $metadata = $parts[0];
        $data = $parts[1];

        // 2. Determinar extensión
        $extension = 'jpg';
        if (strpos($metadata, 'image/png') !== false)
            $extension = 'png';
        if (strpos($metadata, 'image/jpeg') !== false)
            $extension = 'jpg';
        if (strpos($metadata, 'image/webp') !== false)
            $extension = 'webp';

        // 3. Decodificar
        $decodedData = base64_decode($data);

        // 4. Crear nombre único
        $filename = uniqid() . '.' . $extension;

        // 5. Ruta de guardado (backend/uploads/products/)
        // Ajustamos la ruta relativa al index.php del backend
        $uploadDir = 'uploads/' . $subfolder . '/';

        // Crear carpeta si no existe
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        // Guardar archivo
        file_put_contents($uploadDir . $filename, $decodedData);

        // 6. Devolver la ruta relativa para guardar en la BD
        // OJO: Angular buscará esto. Depende de cómo sirvas los archivos.
        // Por ahora devolvemos la ruta relativa al backend.
        // En Angular tendrás que prefijar la URL de la API.
        return 'uploads/' . $subfolder . '/' . $filename;
    }
}
?>
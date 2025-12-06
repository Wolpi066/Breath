<?php
class ImageService
{
    private $targetDir;

    public function __construct()
    {
        // ✅ CORRECCIÓN: Solo subimos un nivel (de 'services' a 'backend')
        // Antes era '/../../uploads/' (incorrecto, salía del backend)
        $this->targetDir = __DIR__ . '/../uploads/';
    }

    public function saveBase64($base64_string, $subfolder)
    {
        // Si no es base64, devolvemos tal cual (puede ser url vieja)
        if (strpos($base64_string, 'data:image') !== 0) {
            return $base64_string;
        }

        $parts = explode(',', $base64_string);
        $data = base64_decode($parts[1]);

        $extension = 'jpg';
        if (strpos($parts[0], 'png') !== false)
            $extension = 'png';
        elseif (strpos($parts[0], 'webp') !== false)
            $extension = 'webp';

        $filename = uniqid() . '.' . $extension;
        $folderPath = $this->targetDir . $subfolder . '/';

        // Crear carpeta si no existe
        if (!is_dir($folderPath)) {
            if (!mkdir($folderPath, 0777, true)) {
                // Si falla crear carpeta, es error de permisos del servidor
                throw new Exception("No se pudo crear el directorio de subida: " . $folderPath);
            }
        }

        file_put_contents($folderPath . $filename, $data);

        // Devuelve ruta relativa para guardar en BD
        return 'uploads/' . $subfolder . '/' . $filename;
    }

    public function deleteFile($relativePath)
    {
        if (!$relativePath)
            return;

        // Seguridad básica para evitar borrar archivos del sistema
        if (strpos($relativePath, 'uploads/') !== 0)
            return;

        // Construir ruta absoluta correctamente
        $fullPath = $this->targetDir . '../' . $relativePath;

        // Nota: Como $targetDir ya apunta a 'backend/uploads/', 
        // y $relativePath empieza con 'uploads/', tenemos que ajustar.
        // Opción A: $targetDir apunta a 'backend/' y concatenamos.
        // Opción B (Actual): $targetDir apunta a 'backend/uploads/'.

        // Ajuste fino para deleteFile usando la misma lógica del constructor:
        // $this->targetDir es ".../backend/uploads/"
        // $relativePath es "uploads/products/foto.jpg"
        // Entonces debemos subir un nivel desde targetDir para coincidir con el inicio de relativePath

        $realPath = __DIR__ . '/../' . $relativePath;

        if (file_exists($realPath)) {
            unlink($realPath);
        }
    }
}
?>
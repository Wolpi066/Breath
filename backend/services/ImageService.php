<?php
class ImageService
{
    private $targetDir;

    public function __construct()
    {
        $this->targetDir = __DIR__ . '/../../uploads/';
    }

    public function saveBase64($base64_string, $subfolder)
    {
        if (strpos($base64_string, 'data:image') !== 0)
            return $base64_string;

        $parts = explode(',', $base64_string);
        $data = base64_decode($parts[1]);

        $extension = 'jpg';
        if (strpos($parts[0], 'png') !== false)
            $extension = 'png';
        elseif (strpos($parts[0], 'webp') !== false)
            $extension = 'webp';

        $filename = uniqid() . '.' . $extension;
        $folderPath = $this->targetDir . $subfolder . '/';

        if (!is_dir($folderPath)) {
            mkdir($folderPath, 0777, true);
        }

        file_put_contents($folderPath . $filename, $data);
        return 'uploads/' . $subfolder . '/' . $filename;
    }

    public function deleteFile($relativePath)
    {
        if (!$relativePath)
            return;

        if (strpos($relativePath, 'uploads/') !== 0)
            return;

        $fullPath = $this->targetDir . '../' . $relativePath;
        if (file_exists($fullPath)) {
            unlink($fullPath);
        }
    }
}
?>
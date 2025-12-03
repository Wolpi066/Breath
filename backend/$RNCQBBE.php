<?php
// backend/fix_password.php

// Incluir la configuración de la base de datos
require_once 'config/Database.php';

// Instanciar la base de datos y conectar
$database = new Database();
$db = $database->getConnection();

// Datos a restablecer
$username = 'admin';
$new_password = 'admin123';

// Generar un hash nuevo y válido usando el algoritmo por defecto del servidor
$hash = password_hash($new_password, PASSWORD_DEFAULT);

echo "<h1>Reparación de Contraseña Admin</h1>";
echo "<hr>";

try {
    // Preparamos la consulta SQL para actualizar
    $query = "UPDATE users SET password = :pass WHERE username = :user";
    $stmt = $db->prepare($query);

    // Vinculamos los parámetros
    $stmt->bindParam(':pass', $hash);
    $stmt->bindParam(':user', $username);

    // Ejecutamos
    if ($stmt->execute()) {
        echo "<h2 style='color: green;'>✅ ÉXITO</h2>";
        echo "<p>La contraseña para el usuario <strong>$username</strong> se ha restablecido.</p>";
        echo "<p>Nueva contraseña: <strong>$new_password</strong></p>";
        echo "<p>Nuevo Hash generado: <small>$hash</small></p>";
        echo "<hr>";
        echo "<p>Intenta iniciar sesión en la web o en Postman ahora.</p>";
    } else {
        echo "<h2 style='color: red;'>❌ ERROR</h2>";
        echo "<p>No se pudo actualizar la base de datos. Verifica que el usuario 'admin' exista.</p>";
    }
} catch (PDOException $e) {
    echo "<h2 style='color: red;'>❌ ERROR DE CONEXIÓN</h2>";
    echo "Detalles: " . $e->getMessage();
}
?>
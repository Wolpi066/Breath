<?php
class User
{
    private $conn;
    private $table_name = "users";

    public $id;
    public $username;
    public $email;
    public $password;
    public $role;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    // --- REGISTRAR NUEVO USUARIO ---
    public function create()
    {
        $query = "INSERT INTO " . $this->table_name . "
                SET
                    username = :username,
                    email = :email,
                    password = :password,
                    role = :role";

        $stmt = $this->conn->prepare($query);

        // Sanitizar
        $this->username = htmlspecialchars(strip_tags($this->username));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->role = htmlspecialchars(strip_tags($this->role));

        // Hashear password (NUNCA guardar texto plano)
        $password_hash = password_hash($this->password, PASSWORD_BCRYPT);

        // Bindear
        $stmt->bindParam(':username', $this->username);
        $stmt->bindParam(':email', $this->email);
        $stmt->bindParam(':password', $password_hash);
        $stmt->bindParam(':role', $this->role);

        if ($stmt->execute()) {
            return true;
        }
        return false;
    }

    // --- BUSCAR POR EMAIL (Para el Login) ---
    public function emailExists()
    {
        $query = "SELECT id, username, password, role
                  FROM " . $this->table_name . "
                  WHERE email = ?
                  LIMIT 0,1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->email);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $this->id = $row['id'];
            $this->username = $row['username'];
            // Guardamos el hash de la DB para verificarlo luego
            $this->password = $row['password'];
            $this->role = $row['role'];
            return true;
        }
        return false;
    }

    // --- BUSCAR POR USERNAME (Alternativa) ---
    public function usernameExists()
    {
        $query = "SELECT id, username, email, password, role
                  FROM " . $this->table_name . "
                  WHERE username = ?
                  LIMIT 0,1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->username);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $this->id = $row['id'];
            $this->email = $row['email'];
            $this->password = $row['password'];
            $this->role = $row['role'];
            return true;
        }
        return false;
    }
}
?>
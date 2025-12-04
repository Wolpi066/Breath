<?php
class ApiResponse
{
    public static function send($data, $code = 200)
    {
        http_response_code($code);
        header("Content-Type: application/json; charset=UTF-8");
        echo json_encode($data);
        exit;
    }

    public static function error($message, $code = 500)
    {
        self::send(["error" => $message], $code);
    }
}
?>
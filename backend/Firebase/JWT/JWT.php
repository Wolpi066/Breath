<?php
namespace Firebase\JWT;
use \DomainException;
use \InvalidArgumentException;
use \UnexpectedValueException;
use \DateTime;

class JWT
{
    public static $leeway = 0;
    public static $timestamp = null;
    public static $supported_algs = array(
        'HS256' => array('hash_hmac', 'SHA256'),
        'HS384' => array('hash_hmac', 'SHA384'),
        'HS512' => array('hash_hmac', 'SHA512'),
        'RS256' => array('openssl', 'SHA256'),
    );

    public static function decode($jwt, $key, array $allowed_algs = array())
    {
        $timestamp = is_null(static::$timestamp) ? time() : static::$timestamp;

        if (empty($key))
            throw new InvalidArgumentException('Key may not be empty');

        $tks = explode('.', $jwt);
        if (count($tks) != 3)
            throw new UnexpectedValueException('Wrong number of segments');

        list($headb64, $bodyb64, $cryptob64) = $tks;

        $header = static::jsonDecode(static::urlsafeB64Decode($headb64));
        $payload = static::jsonDecode(static::urlsafeB64Decode($bodyb64));
        $sig = static::urlsafeB64Decode($cryptob64);

        if (empty($header->alg))
            throw new UnexpectedValueException('Empty algorithm');
        if (empty(static::$supported_algs[$header->alg]))
            throw new UnexpectedValueException('Algorithm not supported');
        if (!in_array($header->alg, $allowed_algs))
            throw new UnexpectedValueException('Algorithm not allowed');

        if (!static::verify("$headb64.$bodyb64", $sig, $key, $header->alg)) {
            throw new \Exception('Signature verification failed');
        }

        // Validaciones de tiempo
        if (isset($payload->nbf) && $payload->nbf > ($timestamp + static::$leeway)) {
            throw new \Exception('Cannot handle token prior to ' . date(DateTime::ISO8601, $payload->nbf));
        }
        if (isset($payload->iat) && $payload->iat > ($timestamp + static::$leeway)) {
            throw new \Exception('Cannot handle token prior to ' . date(DateTime::ISO8601, $payload->iat));
        }
        if (isset($payload->exp) && ($timestamp - static::$leeway) >= $payload->exp) {
            throw new \Exception('Expired token');
        }

        return $payload;
    }

    public static function encode($payload, $key, $alg = 'HS256', $keyId = null, $head = null)
    {
        $header = array('typ' => 'JWT', 'alg' => $alg);
        if ($keyId !== null)
            $header['kid'] = $keyId;
        if (isset($head) && is_array($head))
            $header = array_merge($head, $header);

        $segments = array();
        $segments[] = static::urlsafeB64Encode(static::jsonEncode($header));
        $segments[] = static::urlsafeB64Encode(static::jsonEncode($payload));
        $signing_input = implode('.', $segments);

        $signature = static::sign($signing_input, $key, $alg);
        $segments[] = static::urlsafeB64Encode($signature);

        return implode('.', $segments);
    }

    public static function sign($msg, $key, $alg = 'HS256')
    {
        if (empty(static::$supported_algs[$alg]))
            throw new DomainException('Algorithm not supported');
        list($function, $algorithm) = static::$supported_algs[$alg];
        switch ($function) {
            case 'hash_hmac':
                return hash_hmac($algorithm, $msg, $key, true);
            case 'openssl':
                $signature = '';
                $success = openssl_sign($msg, $signature, $key, $algorithm);
                if (!$success)
                    throw new DomainException("OpenSSL unable to sign data");
                return $signature;
        }
    }

    private static function verify($msg, $signature, $key, $alg)
    {
        if (empty(static::$supported_algs[$alg]))
            throw new DomainException('Algorithm not supported');
        list($function, $algorithm) = static::$supported_algs[$alg];
        switch ($function) {
            case 'openssl':
                $success = openssl_verify($msg, $signature, $key, $algorithm);
                return $success === 1;
            case 'hash_hmac':
            default:
                $hash = hash_hmac($algorithm, $msg, $key, true);
                return hash_equals($signature, $hash);
        }
    }

    public static function jsonDecode($input)
    {
        $obj = json_decode($input, false, 512, JSON_BIGINT_AS_STRING);
        if ($errno = json_last_error())
            static::handleJsonError($errno);
        else if ($obj === null && $input !== 'null')
            throw new DomainException('Null result with non-null input');
        return $obj;
    }

    public static function jsonEncode($input)
    {
        $json = json_encode($input);
        if ($errno = json_last_error())
            static::handleJsonError($errno);
        else if ($json === 'null' && $input !== null)
            throw new DomainException('Null result with non-null input');
        return $json;
    }

    public static function urlsafeB64Decode($input)
    {
        $remainder = strlen($input) % 4;
        if ($remainder) {
            $padlen = 4 - $remainder;
            $input .= str_repeat('=', $padlen);
        }
        return base64_decode(str_replace(array('-', '_'), array('+', '/'), $input));
    }

    public static function urlsafeB64Encode($input)
    {
        return str_replace('=', '', strtr(base64_encode($input), '+/', '-_'));
    }

    private static function handleJsonError($errno)
    {
        $messages = array(
            JSON_ERROR_DEPTH => 'Maximum stack depth exceeded',
            JSON_ERROR_STATE_MISMATCH => 'Invalid or malformed JSON',
            JSON_ERROR_CTRL_CHAR => 'Unexpected control character found',
            JSON_ERROR_SYNTAX => 'Syntax error, malformed JSON',
            JSON_ERROR_UTF8 => 'Malformed UTF-8 characters'
        );
        throw new DomainException(isset($messages[$errno]) ? $messages[$errno] : 'Unknown JSON error: ' . $errno);
    }
}
?>
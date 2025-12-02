<?php
namespace Firebase\JWT;

class Key
{
    /** @var string|resource|OpenSSLAsymmetricKey */
    private $keyMaterial;
    /** @var string */
    private $algorithm;

    /**
     * @param string|resource|OpenSSLAsymmetricKey $keyMaterial
     * @param string $algorithm
     */
    public function __construct($keyMaterial, $algorithm)
    {
        if (
            !\is_string($keyMaterial)
            && !\is_resource($keyMaterial)
            && !$keyMaterial instanceof \OpenSSLAsymmetricKey
            && !$keyMaterial instanceof \OpenSSLCertificate
        ) {
            throw new \InvalidArgumentException('Type of "$keyMaterial" must be string, resource, OpenSSLAsymmetricKey, or OpenSSLCertificate');
        }

        if (empty($keyMaterial)) {
            throw new \InvalidArgumentException('Key material must not be empty');
        }

        if (empty($algorithm)) {
            throw new \InvalidArgumentException('Algorithm must not be empty');
        }

        $this->keyMaterial = $keyMaterial;
        $this->algorithm = $algorithm;
    }

    /**
     * @return string|resource|OpenSSLAsymmetricKey
     */
    public function getKeyMaterial()
    {
        return $this->keyMaterial;
    }

    /**
     * @return string
     */
    public function getAlgorithm()
    {
        return $this->algorithm;
    }
}
?>
🛒 Breath Shop - E-commerce Full Stack
¡Bienvenidos al repositorio de Breath Shop! 👋

Este es nuestro proyecto de e-commerce enfocado en indumentaria streetwear. La idea fue desarrollar una aplicación completa, simulando un entorno real de producción, poniendo mucho énfasis en la arquitectura, la seguridad y la experiencia de usuario.

Le metimos mucha ficha a separar bien el Frontend del Backend y a implementar buenas prácticas de seguridad (nada de credenciales en el código 😉).

🛠️ Tecnologías Utilizadas
Elegimos un stack sólido para demostrar dominio tanto en cliente como en servidor:

Frontend 🎨
Angular 17+: Usamos las últimas features como Signals y Standalone Components para un manejo de estado reactivo y performante.

CSS: Para un diseño moderno y responsive.

TypeScript: Tipado estricto para evitar errores en tiempo de ejecución.

Backend 🛡️
PHP (Nativo): Sin frameworks, para demostrar que entendemos cómo funciona todo "bajo el capó" (Enrutamiento, CORS, PDO).

MySQL: Base de datos relacional optimizada con índices.

JWT (JSON Web Tokens): Para una autenticación segura y sin estado (stateless).

Arquitectura MVC: Separación clara entre Controladores, Modelos y Servicios.

✨ Funcionalidades Clave
Gestión de Stock Inteligente: El carrito y el detalle del producto "hablan" entre sí para validar el stock real en tiempo real. No te deja agregar más de lo que hay.

Panel de Administración (Dashboard):

ABM completo de productos (con subida de imágenes).

Gestión de Banners del Home.

Reset DB: Una herramienta interna para restaurar la base de datos a su estado inicial (útil para testing).

Seguridad: Implementamos variables de entorno (.env), hashing de contraseñas con bcrypt y protección contra inyección SQL.

Checkout: Integración con WhatsApp para finalizar la compra.

🚀 Instalación y Puesta en Marcha
Para correr el proyecto localmente, sigan estos pasos:

1. Base de Datos 🗄️
Abrir PHPMyAdmin (o su gestor preferido).

Crear una base de datos llamada breath_shop.

Importar el archivo adicional/reset.sql que está en la raíz del proyecto.

2. Backend (PHP) 🐘
Navegar a la carpeta backend/.

IMPORTANTE: Renombrar (o crear) el archivo .env basándose en el ejemplo. Configurar las credenciales de la base de datos:

DB_HOST=localhost
DB_NAME=breath_shop
DB_USER=root
DB_PASS=
JWT_SECRET=secreto_seguro
FRONTEND_URL=http://localhost:4200
DEFAULT_ADMIN_PASS=Breathe_Admin2025!

Asegurarse de que el servidor (Apache/XAMPP) esté corriendo apuntando a esta carpeta.

3. Frontend (Angular) 🅰️
Abrir una terminal en la carpeta frontend/.

Instalar las dependencias:

npm install

Levantar el servidor de desarrollo:

ng serve

Abrir el navegador en http://localhost:4200.

🔐 Credenciales de Acceso
Para probar el panel de administración primero deben ir a: http://localhost/Breath/backend/install_db.php, pueden usar el usuario por defecto creado tras importar la base de datos:

Usuario: admin

Contraseña: Breathe_Admin2025! (Luego de loguearse apreten el reset db para que ya quede guardada la contraseña y posteriormente eliminen el archivo install_db.php)

📂 Estructura del Proyecto
El proyecto está organizado para ser escalable:

/backend: Toda la lógica del servidor, API REST y manejo de archivos.

/controllers: Lógica de negocio.

/models: Acceso a datos.

/services: Lógica auxiliar (como subida de imágenes).

/frontend: La SPA en Angular.

/src/app/components: Componentes reutilizables (Cards, Grid, Navbar).

/src/app/services: Comunicación con la API.

Cualquier duda o feedback es bienvenido. ¡Esperamos que les guste el proyecto tanto como a nosotros nos gustó hacerlo! 🙌

Autores:

- [Emiliano Volpino](https://github.com/Wolpi066)
- [Ignacio Rodriguez](https://github.com/IgnacioRodriguezz)

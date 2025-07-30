# API de FireMonitor - Documentación Completa v1.0

Bienvenido a la documentación oficial y detallada de la API de FireMonitor. Este documento sirve como la **fuente única de verdad** para entender, mantener y expandir el backend del proyecto. Está diseñado para que un desarrollador pueda ponerse al día rápidamente, entendiendo no solo el funcionamiento de cada endpoint, sino también las decisiones de arquitectura que lo sustentan.

## Tabla de Contenidos

1.  [Filosofía y Arquitectura](#1-filosofía-y-arquitectura)
2.  [Stack Tecnológico](#2-stack-tecnológico)
3.  [Guía de Instalación y Configuración](#3-guía-de-instalación-y-configuración)
4.  [Scripts Importantes](#4-scripts-importantes)
5.  [Conceptos Clave de la Arquitectura (Explicados en Detalle)](#5-conceptos-clave-de-la-arquitectura-explicados-en-detalle)
6.  [Documentación Detallada de Endpoints](#6-documentación-detallada-de-endpoints)
7.  [Documentación de Eventos WebSocket](#7-documentación-de-eventos-websocket)
8.  [Flujo de Datos Completo (Ejemplo)](#8-flujo-de-datos-completo-ejemplo)

---

## 1. Filosofía y Arquitectura

El diseño de esta API se basa en principios de software profesional para asegurar que sea un sistema robusto y fácil de mantener a largo plazo.

- **Modularidad Extrema:** Cada funcionalidad principal (nodos, alertas, usuarios) vive en su propio **Módulo**. Piensa en cada módulo como una caja de LEGO especializada: una tiene todas las piezas para construir autos, otra para construir casas. Si quieres modificar los autos, solo abres esa caja, sin tocar las demás. Esto evita que los cambios en una parte del sistema rompan otra de forma inesperada.

- **Archivos Pequeños, Responsabilidad Única (SRP):** Cada archivo tiene un solo trabajo. El controlador solo atiende peticiones, el servicio solo piensa en la lógica, y el repositorio solo habla con la base de datos. Esto facilita enormemente la lectura, el testing y el debugging.

- **Inyección de Dependencias (DI):** Este es un concepto clave de NestJS. En lugar de que un componente cree sus propias dependencias (ej. `const miRepo = new FirestoreNodesRepository()`), se las "pide" a NestJS en su constructor. NestJS se encarga de crear y proveer esa única instancia. Esto facilita las pruebas y mantiene el código desacoplado.

---

## 2. Stack Tecnológico

| Tecnología          | Rol en el Proyecto                                                      |
| :------------------ | :---------------------------------------------------------------------- |
| **Node.js**         | Entorno de ejecución de JavaScript en el servidor.                      |
| **NestJS**          | Framework principal para construir la arquitectura modular y escalable. |
| **TypeScript**      | Añade tipado estático a JavaScript, previniendo errores.                |
| **Firestore**       | Base de datos NoSQL en la nube de Google para la persistencia de datos. |
| **Socket.IO**       | Librería para la comunicación en tiempo real mediante WebSockets.       |
| **class-validator** | Para la validación automática de los datos que llegan a la API (DTOs).  |
| **bcrypt**          | Para encriptar (hashear) de forma segura las contraseñas.               |
| **Passport.js**     | Middleware para manejar la autenticación.                               |
| **JWT**             | JSON Web Tokens, el método para la autenticación sin estado.            |
| **Nodemailer**      | Para el envío de correos electrónicos transaccionales.                  |

---

## 3. Guía de Instalación y Configuración

#### a. Prerrequisitos

- Node.js (v18 o superior)
- npm o yarn
- Una cuenta de Google Cloud con un proyecto de Firebase creado.

#### b. Instalación

1.  **Clonar el repositorio:**
    ```bash
    git clone [https://github.com/CarlosMejiaUTM/FireMonitorApi.git](https://github.com/CarlosMejiaUTM/FireMonitorApi.git)
    cd FireMonitorApi
    ```
2.  **Instalar dependencias:**
    ```bash
    npm install
    ```
3.  **Obtener credenciales de Firebase (`gcp-credentials.json`):**
    - Ve a tu **Consola de Firebase** > `Configuración del proyecto` > `Cuentas de servicio`.
    - Haz clic en `Generar nueva clave privada`.
    - Renombra el archivo JSON descargado a `gcp-credentials.json` y ponlo en la **raíz del proyecto**.
    - **¡MUY IMPORTANTE!** Este archivo es secreto. Asegúrate de que tu archivo `.gitignore` contenga la línea `gcp-credentials.json` para no subirlo nunca a un repositorio público.

4.  **Crear archivo de entorno `.env`:**
    - En la raíz del proyecto, crea un archivo `.env`.
    - Pega y rellena las siguientes variables:

    ```ini
    GOOGLE_APPLICATION_CREDENTIALS=./gcp-credentials.json
    JWT_SECRET=UNA_CLAVE_SECRETA_MUY_LARGA_Y_SEGURA_PARA_TUS_TOKENS

    # Credenciales para el envío de correos (usar una "Contraseña de Aplicación" de Google)
    MAIL_HOST=smtp.gmail.com
    MAIL_USER=tu_correo_de_gmail@gmail.com
    MAIL_PASS=tu_contraseña_de_aplicacion_de_16_letras
    MAIL_FROM="FireMonitor" <tu_correo_de_gmail@gmail.com>
    ```

5.  **Configurar Firestore:**
    - En la consola de Firebase, ve a `Firestore Database` y haz clic en `Crear base de datos`.
    - Inicia en **modo de producción** y elige una ubicación.
    - Ve a la pestaña `Índices` y crea los índices compuestos que la API te pida en la terminal si una consulta falla.

---

## 4. Scripts Importantes

- **Iniciar en modo desarrollo:** `npm run start:dev`
  - **Cuándo usarlo:** Siempre que estés desarrollando. Reinicia el servidor automáticamente con cada cambio.

- **Crear usuario admin:** `node seed.js`
  - **Cuándo usarlo:** La primera vez que configuras el proyecto para crear el usuario `admin` inicial.

- **Limpiar base de datos:** `node clear-data.js`
  - **Cuándo usarlo:** Cuando quieras borrar todos los nodos, usuarios y alertas para empezar de cero.

---

## 5. Conceptos Clave de la Arquitectura (Explicados en Detalle)

#### Módulos: Las Cajas de LEGO

Un módulo (`@Module()`) agrupa componentes relacionados. Define qué importa, qué controladores usa, qué servicios provee y qué servicios exporta para que otros módulos los puedan usar.

#### Controladores: Los Recepcionistas

Un controlador (`@Controller()`) es la puerta de entrada a tu API. Su trabajo es simple: recibir peticiones HTTP, usar DTOs para validar los datos, llamar al servicio correspondiente y devolver la respuesta.

#### Servicios: El Cerebro

Un servicio (`@Injectable()`) contiene la lógica de negocio. Por ejemplo, `NodesService` decide si un usuario tiene permiso para ver un nodo. Esta lógica no pertenece ni al controlador ni al repositorio.

#### Repositorios: Los Archivistas Expertos

Usamos el **Patrón Repositorio** para desacoplar la lógica de negocio de la base de datos.

- **El Problema:** Sin este patrón, tu `NodesService` tendría código de Firestore por todas partes. Si mañana cambias de base de datos, tendrías que reescribir todo el servicio.
- **La Solución:** Creamos un "contrato" (`NodesRepository`) que define los métodos que deben existir (ej: `create`, `findById`). El servicio solo habla con este contrato. La clase concreta (`FirestoreNodesRepository`) implementa ese contrato con la lógica específica de Firestore.

#### DTOs: Los Formularios con Reglas

Un DTO (Data Transfer Object) es una clase que define la **forma de los datos** que se transfieren en una petición. Usamos `class-validator` para validar automáticamente que los datos entrantes son correctos.

#### Guards: Los Guardias de Seguridad

Un Guard (`CanActivate`) es una clase que decide si una petición puede continuar. `AuthGuard('jwt')` es el "guardia" que protege nuestras rutas, verificando que el token del usuario sea válido.

#### WebSockets (Gateways): La Línea Telefónica Directa

A diferencia de HTTP (una carta), un WebSocket es una llamada telefónica abierta. Permite al servidor "empujar" datos al cliente en tiempo real. Nuestro `AlertsGateway` usa esto para enviar notificaciones instantáneas.

---

## 6. Documentación Detallada de Endpoints

URL Base: `http://localhost:3000`

### Recurso: `auth`

Maneja el registro e inicio de sesión.

#### `POST /auth/register`

- **Descripción:** Registra un nuevo usuario con rol `user` y le envía un correo de bienvenida.
- **Acceso:** Público.
- **Body:** `CreateUserDto`
  ```json
  {
    "nombre": "Ana",
    "apellido": "Salas",
    "usuario": "asalas",
    "correo": "ana@email.com",
    "contrasena": "password123"
  }
  ```

#### `POST /auth/login`

- **Descripción:** Autentica a un usuario y devuelve un token de acceso.
- **Acceso:** Público.
- **Body:** `LoginDto`
  ```json
  { "usuario": "admin", "contrasena": "admin12345" }
  ```
- **Respuesta Exitosa:** `{ "access_token": "eyJhbGciOi..." }`

### Recurso: `users`

Gestión de usuarios.

#### `GET /users`

- **Descripción:** Obtiene una lista de todos los usuarios registrados (sin sus contraseñas).
- **Acceso:** `admin`.

### Recurso: `nodes`

Maneja la gestión de los nodos. Todas las rutas requieren autenticación (Bearer Token).

#### `POST /nodes`

- **Descripción:** Crea un nuevo nodo. Solo un `admin` puede asignar un nodo a un `userId` específico.
- **Acceso:** `admin`.
- **Body:** `CreateNodeDto`
  ```json
  {
    "nombre": "Sensor Finca Sur",
    "tipo": "sensor",
    "coordenadas": { "lat": 20.9, "lng": -89.6 },
    "userId": "ID_DEL_USUARIO_DUEÑO"
  }
  ```

#### `GET /nodes`

- **Descripción:** Obtiene una lista de nodos. Si el solicitante es `admin`, ve todos los nodos. Si es `user`, ve solo los suyos.
- **Acceso:** `user`, `admin`.

#### `GET /nodes/:id`

- **Descripción:** Obtiene los detalles de un nodo específico. Un `user` solo puede ver los nodos que le pertenecen.
- **Acceso:** `user`, `admin`.

#### `GET /nodes/:id/history`

- **Descripción:** Obtiene las últimas 20 lecturas de un nodo de tipo `sensor`.
- **Acceso:** `user`, `admin` (con las mismas reglas de propiedad).

#### `POST /nodes/heartbeat`

- **Descripción:** Endpoint para que los nodos `repetidor` y `central` reporten que están activos.
- **Acceso:** Protegido por API Key (no por JWT).
- **Body:** `{ "nodeId": "ID_DEL_REPETIDOR_O_CENTRAL" }`

#### `PATCH /nodes/:id`

- **Descripción:** Actualiza los datos de un nodo.
- **Acceso:** `admin`.
- **Body:** `UpdateNodeDto` (permite enviar solo los campos a modificar).

#### `DELETE /nodes/:id`

- **Descripción:** Elimina un nodo.
- **Acceso:** `admin`.

### Recurso: `ingest`

Recibe datos de los sensores.

#### `POST /ingest`

- **Descripción:** Recibe la telemetría de un nodo sensor.
- **Acceso:** Protegido por API Key.
- **Body:** `IngestDataDto`
  ```json
  {
    "nodeId": "ID_DEL_NODO_SENSOR",
    "timestamp": "2025-07-13T05:00:00Z",
    "lectura": { "temperatura": 45.1, "humedad": 12, ... }
  }
  ```

### Recurso: `alerts`

Consulta de alertas históricas.

#### `GET /alerts`

- **Descripción:** Obtiene una lista paginada y filtrable de alertas. Un `user` solo ve sus propias alertas.
- **Acceso:** `user`, `admin`.
- **Query Params (Opcionales):** `tipo`, `desde`, `hasta`, `page`, `limit`.

---

## 7. Documentación de Eventos WebSocket

#### Evento: `newAlert`

- **Cuándo se emite:** Cuando se genera una alerta grave (fuego, humo, etc.).
- **Propósito:** Mostrar notificaciones prominentes al usuario.
- **Payload:** Objeto de la alerta.

#### Evento: `nodeUpdate`

- **Cuándo se emite:** Cada vez que un nodo envía nuevos datos.
- **Propósito:** Actualizar el estado (color, datos) del marcador en el mapa en vivo.
- **Payload:** Objeto completo del nodo.

---

## 8. Flujo de Datos Completo (Ejemplo)

1.  Un **Nodo Sensor** envía una petición `POST /ingest` a la API.
2.  El **`IngestService`** recibe los datos y llama al **`NodesRepository`** para guardar la lectura en Firestore.
3.  La lógica en **`IngestService`** detecta que `temperatura` es `> 65°C`.
4.  Llama al **`AlertsService`**, que guarda la alerta en la colección `alerts` y llama al **`AlertsGateway`**.
5.  El **`AlertsGateway`** emite dos eventos por WebSocket: un `newAlert` y un `nodeUpdate`.
6.  El **Frontend** (React) recibe ambos eventos y actualiza la tabla de alertas y el color del marcador en el mapa, todo instantáneamente.

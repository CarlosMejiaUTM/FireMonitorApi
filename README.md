# API de FireMonitor - Documentación Completa v1.0

Bienvenido a la documentación oficial y detallada de la API de FireMonitor. Este documento sirve como la **fuente única de verdad** para entender, mantener y expandir el backend del proyecto. Está diseñado para que un desarrollador pueda ponerse al día rápidamente, entendiendo no solo el funcionamiento de cada endpoint, sino también las decisiones de arquitectura que lo sustentan.

## Tabla de Contenidos

1.  [Filosofía y Arquitectura](#1-filosofía-y-arquitectura)
2.  [Stack Tecnológico](#2-stack-tecnológico)
3.  [Guía de Instalación y Configuración](#3-guía-de-instalación-y-configuración)
4.  [Scripts Importantes](#4-scripts-importantes)
5.  [Conceptos Clave de la Arquitectura (Explicados)](#5-conceptos-clave-de-la-arquitectura-explicados)
6.  [Documentación Detallada de Endpoints](#6-documentación-detallada-de-endpoints)
7.  [Documentación de Eventos WebSocket](#7-documentación-de-eventos-websocket)
8.  [Flujo de Datos Completo (Ejemplo)](#8-flujo-de-datos-completo-ejemplo)

---

## 1. Filosofía y Arquitectura

El diseño de esta API se basa en principios de software profesional para asegurar que sea un sistema robusto y fácil de mantener a largo plazo.

* **Modularidad Extrema:** Cada funcionalidad principal (nodos, alertas, usuarios) vive en su propio "Módulo". Piensa en cada módulo como una caja de LEGO especializada: una tiene todas las piezas para construir autos, otra para construir casas. Si quieres modificar los autos, solo abres esa caja, sin tocar las demás.
* **Archivos Pequeños, Responsabilidad Única (SRP):** Cada archivo tiene un solo trabajo. El controlador solo atiende peticiones, el servicio solo piensa en la lógica, y el repositorio solo habla con la base de datos. Esto facilita enormemente la lectura, el testing y el debugging.
* **Inyección de Dependencias (DI):** Usamos intensivamente el sistema de NestJS para desacoplar las clases. Un servicio no sabe cómo se conecta a la base de datos; solo conoce el "contrato" (la clase abstracta) del repositorio que necesita.

---

## 2. Stack Tecnológico

| Tecnología | Rol en el Proyecto |
| :--- | :--- |
| **Node.js** | Entorno de ejecución de JavaScript en el servidor. |
| **NestJS** | Framework principal para construir la arquitectura modular y escalable. |
| **TypeScript** | Añade tipado estático a JavaScript, previniendo errores. |
| **Firestore** | Base de datos NoSQL en la nube de Google para la persistencia de datos. |
| **Socket.IO** | Librería para la comunicación en tiempo real mediante WebSockets. |
| **class-validator**| Para la validación automática de los datos que llegan a la API (DTOs). |
| **bcrypt** | Para encriptar (hashear) de forma segura las contraseñas. |
| **Passport.js** | Middleware para manejar la autenticación. |
| **JWT** | JSON Web Tokens, el método para la autenticación sin estado. |

---

## 3. Guía de Instalación y Configuración

#### a. Prerrequisitos
* Node.js (v18 o superior)
* npm o yarn
* Una cuenta de Google Cloud con un proyecto de Firebase creado.

#### b. Instalación
1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/CarlosMejiaUTM/FireMonitorApi.git
    cd FireMonitorApi
    ```
2.  **Instalar dependencias:**
    ```bash
    npm install
    ```
3.  **Obtener credenciales de Firebase (`gcp-credentials.json`):**
    * Ve a tu **Consola de Firebase** > `Configuración del proyecto` > `Cuentas de servicio`.
    * Haz clic en `Generar nueva clave privada`.
    * Renombra el archivo JSON descargado a `gcp-credentials.json` y ponlo en la **raíz del proyecto**.
    * **¡MUY IMPORTANTE!** Este archivo es secreto. Asegúrate de que tu archivo `.gitignore` contenga la línea `gcp-credentials.json` para no subirlo nunca a un repositorio público.

4.  **Crear archivo de entorno `.env`:**
    * En la raíz del proyecto, crea un archivo llamado `.env`.
    * Añade las siguientes variables:
    ```ini
    GOOGLE_APPLICATION_CREDENTIALS=./gcp-credentials.json
    JWT_SECRET=csm_el_real_madrid
    ```
5.  **Configurar Firestore:**
    * En la consola de Firebase, ve a `Firestore Database` y haz clic en `Crear base de datos`.
    * Inicia en **modo de producción** y elige una ubicación.
    * Ve a la pestaña `Índices` y asegúrate de que el índice compuesto para la colección `alerts` esté creado y habilitado. Si una consulta falla por falta de índice, la terminal de NestJS te dará un enlace directo para crearlo.

---

## 4. Scripts Importantes

* **Iniciar el servidor de desarrollo:**
    ```bash
    npm run start:dev
    ```
    * **Cuándo usarlo:** Siempre que estés desarrollando. Reinicia el servidor automáticamente con cada cambio.

* **Crear usuario admin:**
    ```bash
    node seed.js
    ```
    * **Cuándo usarlo:** La primera vez que configuras el proyecto para crear el usuario `admin` inicial.

* **Limpiar base de datos:**
    ```bash
    node clear-data.js
    ```
    * **Cuándo usarlo:** Cuando quieras borrar todos los nodos y alertas para empezar de cero.

---

## 5. Conceptos Clave de la Arquitectura (Explicados)

* **Módulos: Las Cajas de LEGO:** Un módulo (`@Module()`) agrupa componentes relacionados. Define qué importa, qué controladores usa, qué servicios provee y qué servicios exporta para que otros módulos los puedan usar.
* **Controladores: Los Recepcionistas:** Un controlador (`@Controller()`) es la puerta de entrada a la API. Recibe peticiones HTTP, usa DTOs para validar los datos, llama al servicio correspondiente y devuelve la respuesta.
* **Servicios: El Cerebro:** Un servicio (`@Injectable()`) contiene la lógica de negocio. Orquesta las operaciones, pero no sabe nada de HTTP ni de la base de datos directamente.
* **Repositorios: Los Archivistas Expertos:** Usamos el Patrón Repositorio para desacoplar la lógica de la base de datos. El servicio habla con un "contrato" (clase abstracta), y la implementación concreta (`FirestoreNodesRepository`) es la única que sabe cómo hablar con Firestore.
* **DTOs: Los Formularios con Reglas:** Un DTO (Data Transfer Object) es una clase que define la forma y las reglas de los datos que se transfieren en una petición, asegurando que solo recibamos información válida.
* **Guards: Los Guardias de Seguridad:** Un Guard (`CanActivate`) es una clase que decide si una petición puede continuar o no. `AuthGuard('jwt')` es el "guardia" que protege nuestras rutas, verificando que el token del usuario sea válido.
* **WebSockets (Gateways): La Línea Telefónica Directa:** A diferencia de HTTP (una carta), un WebSocket es una llamada telefónica abierta. Permite al servidor "empujar" datos al cliente en tiempo real. Nuestro `AlertsGateway` usa esto para enviar notificaciones instantáneas.

---

## 6. Documentación Detallada de Endpoints

URL Base: `http://localhost:3000`

### Recurso: `auth`
Maneja el registro e inicio de sesión.

#### `POST /auth/register`
* **Descripción:** Registra un nuevo usuario con rol `user`.
* **Acceso:** Público.
* **Body:** `CreateUserDto`
    ```json
    { "nombre": "Ana", "apellido": "Salas", "usuario": "asalas", "correo": "ana@email.com", "contrasena": "password123" }
    ```

#### `POST /auth/login`
* **Descripción:** Autentica a un usuario y devuelve un token de acceso.
* **Acceso:** Público.
* **Body:** `LoginDto`
    ```json
    { "usuario": "admin", "contrasena": "admin12345" }
    ```
* **Respuesta Exitosa:**
    ```json
    { "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
    ```

### Recurso: `nodes`
Maneja la gestión de los nodos. Todas las rutas requieren autenticación (Bearer Token).

#### `POST /nodes`
* **Descripción:** Crea un nuevo nodo. Solo un `admin` puede asignar un nodo a un `userId` específico. Si no se provee, se asigna al propio admin.
* **Acceso:** `admin`.
* **Body:** `CreateNodeDto`
    ```json
    { "nombre": "Sensor Finca Sur", "tipo": "sensor", "coordenadas": { "lat": 20.9, "lng": -89.6 }, "userId": "ID_DEL_USUARIO_DUEÑO" }
    ```

#### `GET /nodes`
* **Descripción:** Obtiene una lista de nodos. Si el solicitante es `admin`, ve todos los nodos. Si es `user`, ve solo los suyos. Incluye el campo calculado `status`.
* **Acceso:** `user`, `admin`.

#### `GET /nodes/:id`
* **Descripción:** Obtiene los detalles de un nodo específico. Un `user` solo puede ver los nodos que le pertenecen.
* **Acceso:** `user`, `admin`.

#### `GET /nodes/:id/history`
* **Descripción:** Obtiene las últimas 20 lecturas de un nodo de tipo `sensor`.
* **Acceso:** `user`, `admin` (con las mismas reglas de propiedad que `GET /nodes/:id`).

#### `POST /nodes/heartbeat`
* **Descripción:** Endpoint para que los nodos `repetidor` y `central` reporten que están activos.
* **Acceso:** Protegido por API Key (no por JWT).
* **Body:** `{ "nodeId": "ID_DEL_REPETIDOR_O_CENTRAL" }`

#### `PATCH /nodes/:id`
* **Descripción:** Actualiza los datos de un nodo.
* **Acceso:** `admin`.
* **Body:** `UpdateNodeDto` (permite enviar solo los campos a modificar).

#### `DELETE /nodes/:id`
* **Descripción:** Elimina un nodo.
* **Acceso:** `admin`.

### Recurso: `ingest`
Recibe datos de los sensores.

#### `POST /ingest`
* **Descripción:** Recibe la telemetría de un nodo sensor.
* **Acceso:** Protegido por API Key.
* **Body:** `IngestDataDto`
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
* **Descripción:** Obtiene una lista paginada y filtrable de alertas.
* **Acceso:** `user`, `admin`.
* **Query Params (Opcionales):** `tipo`, `desde`, `hasta`, `page`, `limit`.
* **Ejemplo:** `/alerts?tipo=Fuego%20Detectado&page=1`

---

## 7. Documentación de Eventos WebSocket

#### Evento: `newAlert`
* **Cuándo se emite:** Cuando se genera una alerta grave (fuego, humo, etc.).
* **Propósito:** Mostrar notificaciones prominentes al usuario.
* **Payload:** Objeto de la alerta (`{ id, tipo, severidad, hora, nodo, ... }`).

#### Evento: `nodeUpdate`
* **Cuándo se emite:** Cada vez que un nodo envía nuevos datos a `/ingest`.
* **Propósito:** Actualizar el estado (color, datos) del marcador correspondiente en el mapa en vivo.
* **Payload:** Objeto completo del nodo (`{ id, nombre, tipo, status, coordenadas, ultimaLectura, ... }`).

---

## 8. Flujo de Datos Completo (Ejemplo)
1.  Un **Nodo Sensor** en el campo lee sus sensores.
2.  Formatea un **JSON** con su `nodeId` y sus lecturas.
3.  Envía una petición **`POST /ingest`** a la API.
4.  El **`IngestService`** recibe los datos y llama al **`NodesRepository`** para guardar la lectura en el historial y actualizar el estado del nodo en Firestore.
5.  La lógica en **`IngestService`** detecta que `temperatura` es `> 65°C`.
6.  Llama al **`AlertsService`** para crear una alerta.
7.  El **`AlertsService`** guarda la alerta en la colección `alerts` y llama al **`AlertsGateway`**.
8.  El **`AlertsGateway`** emite dos eventos por WebSocket:
    * Un `newAlert` con los datos de la alerta de temperatura.
    * Un `nodeUpdate` con el estado completo del nodo, que ahora tiene `status: 'alerta'`.
9.  El **Frontend** (React) recibe ambos eventos y actualiza la tabla de alertas y el color del marcador en el mapa, todo instantáneamente.

# Huellas Dulces

Aplicación web para la gestión y consulta de productos de una tienda de mascotas. Desarrollada con Angular 21 y conectada a un backend construido con Spring Boot y Java 25.

## Tecnologías

- Angular 21
- TypeScript con configuración estricta
- Arquitectura zoneless
- Signals y computed
- RxJS
- Formularios reactivos
- Angular Router
- HttpClient e interceptores HTTP
- STOMP sobre WebSocket
- Canvas y WebP
- LocalStorage
- Spring Boot y Java 25

## Arquitectura de Angular

La aplicación organiza sus componentes por funcionalidades y utiliza servicios compartidos para separar la presentación de la lógica de negocio.

La detección de cambios zoneless está configurada mediante `provideZonelessChangeDetection()`.

Se utilizan comprobaciones estrictas de TypeScript y Angular:

- `strict: true`
- `strictTemplates: true`
- `strictInjectionParameters: true`

## Reactividad y búsqueda

El catálogo utiliza Signals para administrar estados reactivos, como el texto de búsqueda y la categoría seleccionada.

Se utiliza `computed()` para derivar información y actualizar los resultados del catálogo.

La búsqueda reactiva incorpora:

- `debounceTime(300)` para evitar solicitudes innecesarias.
- `switchMap` para gestionar las búsquedas y priorizar la solicitud más reciente.
- Estrategia SWR (Stale While Revalidate) con Signals para reutilizar datos almacenados y actualizarlos.

## Autenticación y seguridad

La aplicación se comunica con el backend mediante HttpClient.

La autenticación utiliza JWT:

- Inicio de sesión mediante el endpoint de autenticación.
- AuthInterceptor para adjuntar el token Bearer a las solicitudes protegidas.
- ErrorInterceptor para gestionar errores de autenticación y limpiar la sesión cuando corresponde.
- Redirección al inicio de sesión cuando la sesión deja de ser válida.

## Comunicación en tiempo real

La aplicación incorpora comunicación mediante WebSocket y STOMP.

La conexión persistente permite gestionar eventos en tiempo real y mostrar información de presencia de usuarios.

## Funcionamiento sin conexión

Se implementó una cola local de operaciones pendientes mediante LocalStorage.

Cuando no hay conexión, las operaciones compatibles se almacenan para intentar sincronizarlas cuando se recupera la conectividad.

El servicio de sincronización escucha el evento `online` para iniciar el proceso de envío de operaciones pendientes.

## Perfil y optimización de imágenes

El perfil permite seleccionar una imagen para el avatar.

Antes de enviarla al backend, se procesa mediante Canvas:

- Redimensionamiento proporcional.
- Dimensión máxima de 512 píxeles.
- Conversión al formato WebP.
- Compresión de imagen.
- Envío mediante `FormData`.

## Rendimiento

La aplicación incorpora un panel de rendimiento que utiliza PerformanceObserver y las API de rendimiento del navegador.

Permite consultar métricas de carga y recursos, incluyendo información de tiempos de respuesta para analizar el comportamiento de la aplicación.

## Formularios y servicios

El registro de productos utiliza formularios reactivos con validaciones para:

- Nombre.
- Descripción.
- Categoría.
- Precio.
- Inventario disponible.

Los servicios compartidos centralizan funcionalidades como notificaciones, preferencias visuales, autenticación, productos y perfil de usuario.

## Preferencias visuales

El servicio `ThemeService` utiliza Signals para administrar el tema visual.

Los cambios se reflejan en el documento y se guardan en `localStorage` para conservar la preferencia del usuario.

## Instalación y ejecución

Instalar las dependencias:

```bash
npm install
```

Iniciar el servidor de desarrollo:

```bash
npm start
```

Generar la compilación de producción:

```bash
npm run build
```

La compilación se genera en:

```text
dist/huellas-dulces-web
```

## Integración con el backend

El frontend se comunica con una API desarrollada con Spring Boot y Java 25.

El backend administra la autenticación, los productos y los datos del perfil. La comunicación se realiza mediante solicitudes HTTP autenticadas y conexiones WebSocket para las funcionalidades en tiempo real.

## Objetivo del proyecto

Huellas Dulces busca ofrecer una experiencia sencilla, organizada y moderna para consultar y administrar productos de mascotas, integrando un frontend Angular con un backend Spring Boot.

## Flujo de integración del sistema

1. El usuario inicia sesión desde Angular.
2. El frontend envía las credenciales al backend Spring Boot.
3. El backend valida las credenciales y genera un JWT.
4. AuthInterceptor adjunta el token Bearer a las solicitudes protegidas.
5. El backend valida el token y los permisos antes de responder.
6. El catálogo utiliza Signals y RxJS para actualizar las búsquedas.
7. La comunicación STOMP permite recibir eventos en tiempo real.
8. Las operaciones compatibles pendientes se almacenan localmente cuando no hay conexión y se intenta sincronizarlas al recuperarla.
9. El perfil procesa las imágenes mediante Canvas y WebP antes de enviarlas al backend.

## Prompts complejos de desarrollo asistido por IA

Los siguientes prompts documentan ejemplos de instrucciones técnicas para apoyar el desarrollo y mantenimiento del proyecto:

### 1. Autenticación y seguridad JWT

"Analiza la integración de autenticación JWT entre Angular 21 y Spring Boot 4 con Java 25. Revisa la generación y validación de tokens, los roles, el AuthInterceptor, el ErrorInterceptor y la configuración CORS. Identifica riesgos de seguridad y propone correcciones compatibles con la arquitectura existente."

### 2. Búsqueda reactiva y caché SWR

"Implementa y revisa una búsqueda reactiva de productos en Angular utilizando RxJS, debounceTime(300), switchMap y Signals. Incorpora una estrategia Stale While Revalidate para reutilizar datos almacenados mientras se actualiza la información desde el backend. Evita solicitudes redundantes y conserva el estado del catálogo."

### 3. Procesamiento de imágenes de perfil

"Revisa el proceso de carga de avatares en Angular. Utiliza createImageBitmap y Canvas para redimensionar proporcionalmente las imágenes a un máximo de 512 píxeles, convertirlas a WebP y comprimirlas antes de enviarlas mediante FormData a un endpoint de Spring Boot. Incluye manejo de errores y liberación de recursos."

### 4. Comunicación en tiempo real

"Analiza la integración WebSocket con STOMP entre Angular y Spring Boot. Implementa una conexión persistente, administración de suscripciones, reconexión cuando sea necesaria y actualización del indicador de presencia de usuarios. Evita conexiones duplicadas y libera los recursos al cerrar la sesión."

### 5. Funcionamiento offline y rendimiento

"Revisa el funcionamiento offline-first de Huellas Dulces. Implementa una cola local de operaciones pendientes, sincronización al recuperar la conexión y manejo de errores para evitar pérdida o duplicación de datos. Complementa la solución con PerformanceObserver para medir y presentar métricas de rendimiento del frontend y tiempos de respuesta de la API."

## Pruebas automatizadas y calidad

El frontend utiliza Vitest y Cypress para verificar el comportamiento de sus componentes, servicios y flujos principales.

### Pruebas unitarias

Tecnologías utilizadas:

- Vitest 4.1.12.
- Angular Testing Library.
- jsdom.
- HttpTestingController.
- @vitest/coverage-v8.

Ejecutar las pruebas:

```bash
npm test
```

Ejecutar las pruebas con cobertura:

```bash
npm test -- --watch=false --coverage
```


### Resultados de pruebas unitarias

- 15 archivos de pruebas aprobados.
- 196 pruebas aprobadas.
- 0 pruebas fallidas.

### Cobertura de código

| Indicador | Cobertura | Objetivo |
|---|---:|---:|
| Statements | 84.82% | 80% |
| Branches | 89.69% | 80% |
| Functions | 80.25% | 80% |
| Lines | 86.66% | 80% |

Todas las métricas de cobertura superan el objetivo mínimo del 80%.

El reporte HTML se genera en:

```text
coverage/huellas-dulces-web/index.html
```

El reporte LCOV se genera en:

```text
coverage/huellas-dulces-web/lcov.info
```

### Pruebas end-to-end con Cypress

Se utiliza Cypress 16.3.0 para verificar flujos principales de la aplicación.

Ejecutar las pruebas E2E:

```bash
npx cypress run
```

Escenarios automatizados:

1. Inicio de sesión exitoso y almacenamiento del token.
2. Exploración y búsqueda de productos.
3. Manejo de errores HTTP 500 durante la búsqueda de productos.

Resultados:

- 3 pruebas E2E aprobadas.
- 0 pruebas fallidas.

Los escenarios utilizan respuestas HTTP interceptadas para validar los comportamientos del frontend de forma controlada.

El video de ejecución se genera en:

```text
cypress/videos/huellas-dulces.cy.ts.mp4
```

### Herramientas de calidad

- Vitest para pruebas unitarias.
- Angular Testing Library para pruebas de componentes.
- HttpTestingController para validar solicitudes HTTP.
- Cypress para pruebas end-to-end.
- JaCoCo en el backend para medir cobertura de pruebas.
- LCOV y HTML para consultar los resultados de cobertura del frontend.

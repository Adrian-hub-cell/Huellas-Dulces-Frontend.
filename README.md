# Huellas Dulces 🐾

Aplicación web para la gestión y consulta de productos de una tienda de mascotas. Desarrollada con **Angular 21** y conectada a un backend construido con **Spring Boot y Java**.

## 🚀 Tecnologías

- Angular 21.2.29
- TypeScript con configuración estricta
- Arquitectura zoneless
- Signals y computed
- Formularios reactivos
- Servicios e inyección de dependencias
- Angular Router
- HttpClient e interceptores HTTP
- CSS, Flexbox y Grid
- Spring Boot y Java en el backend

## 🏗️ Arquitectura de Angular

La aplicación utiliza componentes organizados por funcionalidades y servicios compartidos para separar la presentación de la lógica de negocio.

La detección de cambios zoneless está configurada mediante `provideZonelessChangeDetection()` en `app.config.ts`.

También se habilitaron las comprobaciones estrictas de TypeScript y Angular:

- `strict: true`
- `strictTemplates: true`
- `strictInjectionParameters: true`

Esta configuración ayuda a detectar errores durante el desarrollo.

## ⚡ Signals y reactividad

El catálogo utiliza Signals para mantener estados reactivos, como el texto de búsqueda y la categoría seleccionada.

Se utiliza `computed()` para obtener automáticamente los productos que coinciden con los filtros aplicados.

La lista se representa mediante el control de flujo `@for`, con una clave `track` para identificar cada elemento y optimizar su actualización.

## 📝 Formularios reactivos

El registro de productos utiliza formularios reactivos con validaciones para los campos:

- Nombre.
- Descripción.
- Categoría.
- Precio.
- Inventario disponible.

Se aplican validaciones como campos obligatorios, longitud mínima y máxima, y valores numéricos válidos. Los mensajes de error se muestran cuando corresponde.

## 🔔 Servicios y notificaciones

La aplicación utiliza servicios compartidos e inyección de dependencias para centralizar funcionalidades.

El servicio `NotificationService` administra los mensajes mediante Signals. El encabezado (`HeaderComponent`) permite consultar las notificaciones y limpiarlas.

## 🎨 Preferencias y almacenamiento local

El servicio `ThemeService` utiliza `signal()` para administrar el tema visual de la aplicación.

Mediante `effect()`, los cambios del tema se reflejan en el documento y se guardan automáticamente en `localStorage`, permitiendo conservar la preferencia del usuario.

## 🔐 Comunicación y autenticación

La aplicación utiliza `HttpClient` para comunicarse con el backend y un interceptor HTTP para gestionar las solicitudes autenticadas.

El proyecto cuenta con funcionalidades de autenticación y administración de productos.

## 📦 Instalación y ejecución

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

## ⚙️ Rendimiento y buenas prácticas

La aplicación incorpora varias prácticas para mejorar el mantenimiento y el rendimiento:

- Arquitectura zoneless para evitar depender de Zone.js en la detección de cambios.
- Signals para administrar estados reactivos.
- `computed()` para derivar información sin recalcularla innecesariamente.
- `track` en los bloques `@for` para identificar elementos.
- Formularios reactivos con validaciones.
- Servicios reutilizables e inyección de dependencias.
- Configuración estricta de TypeScript y Angular.

## 🐾 Objetivo del proyecto

Huellas Dulces busca ofrecer una experiencia sencilla y organizada para consultar productos de mascotas y facilitar su administración, integrando un frontend moderno con un backend desarrollado en Spring Boot.
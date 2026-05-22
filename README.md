# havtel-web

Storefront del ecommerce Havtel. Construido con React, TypeScript y Vite.

## Stack

- **React 18** + TypeScript
- **Vite** como bundler
- **Tailwind CSS**
- **Stripe.js** para el flujo de pago en el cliente
- **Framer Motion** para animaciones

## Arranque local

```bash
npm install
npm run dev
```

El storefront se conecta a la API en `http://localhost:8000/api/v1` por defecto.

## Build de producción

```bash
npm run build
```

## Funcionalidades

### Catálogo
Navegación por categorías con filtros. Búsqueda de productos. Vista de producto con selección de variante.

### Carrito
Carrito persistente en sesión. Añadir, quitar y modificar cantidades.

### Checkout
Flujo completo:
1. Selección de dirección de entrega o punto de recogida
2. Resumen del pedido
3. Pago con **Stripe Elements** (tarjeta, etc.)
4. Confirmación

### Cuenta de usuario
- Información personal (nombre, teléfono) con validación de formato
- Directorio de contactos de entrega con validación por campo
- Historial de órdenes
- Gestión de sesión (login, registro, logout)

### Autenticación
Registro con validación de nombre (solo letras), email y contraseña. Login con JWT + refresh token automático.

## Validaciones de formulario

Los formularios usan validación custom (no `required` nativo):

- **Nombre / apellido**: solo letras, espacios, guiones y apóstrofos — rechaza números
- **Teléfono**: formato internacional, mínimo 7 dígitos
- **Email**: formato estándar
- **Dirección**: campos obligatorios con mensajes inline por campo

## Estructura

```
src/
  App.tsx        # Toda la aplicación (SPA de fichero único)
  main.tsx       # Punto de entrada
```

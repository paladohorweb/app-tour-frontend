# Juan te guía — Demo v3

Demo comercial en Angular 17 para explorar tours, hospedajes y eventos en Colombia.

## Ejecutar en local

```bash
npm ci
npm run start:demo
```

Abrir `http://localhost:4200`.

## Validar

```bash
npm run build:demo-v3
npm test
```

## Experiencia incluida

- Portada con video local optimizado, poster y respeto por `prefers-reduced-motion`.
- Carrusel horizontal con vista previa al pasar el cursor y control táctil.
- Once experiencias ilustrativas con fotografías de cada destino.
- Mapa orientado a comparar planes, consultar precios, usar GPS y abrir indicaciones.
- Flujo demo de solicitud, confirmación del prestador, pago manual y notificaciones.
- Catálogo, dashboard, políticas, suscripción, `robots.txt`, sitemap y créditos multimedia.

## Usuarios demo

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Administrador | `admin@demo.com` | `123456` |
| Guía | `guia@demo.com` | `123456` |
| Viajero | `viajero@demo.com` | `123456` |

Los datos se guardan únicamente en el navegador, bajo la clave `app-guia-demo-v3`.

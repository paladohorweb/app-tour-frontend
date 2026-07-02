# TurismoApp Frontend

Frontend Angular 17 para administrar turismo, tours, reservas, pagos y guias.

## Desarrollo con backend Spring Boot

```bash
npm install
npm start
```

La API local configurada actualmente es `http://localhost:8086/api`.

## Modo demo

```bash
npm run start:demo
```

El modo demo no necesita backend. Usa datos locales persistidos en `localStorage`
y cubre los flujos principales:

- Catalogo de tours y mapa
- Login por rol
- Reservas de cliente
- Pago simulado
- Dashboard administrativo
- Gestion de tours
- Gestion de reservas y asignacion de guias
- Panel de guia para iniciar y finalizar experiencias

Credenciales demo:

- `admin@demo.com` / `demo123`
- `guia@demo.com` / `demo123`
- `cliente@demo.com` / `demo123`

## Build

```bash
npm run build
npm run build:demo
```

## Netlify

El archivo `netlify.toml` publica la version demo:

```toml
[build]
  command = "npm run build:demo"
  publish = "dist/turismo-app/browser"
```

Incluye redireccion SPA para que rutas como `/admin/dashboard`, `/tours/1`
y `/mis-reservas` funcionen al recargar.

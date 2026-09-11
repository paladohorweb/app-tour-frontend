# App Guía v2 — frontend Angular 17 compatible

Plataforma de experiencias en Colombia: tours, eventos y hospedajes, solicitudes por WhatsApp, disponibilidad, Mi viaje, panel del prestador y notificaciones dentro de la aplicación.

## Requisitos

Configuración alineada con el equipo de desarrollo actual:

- Node 20.20.2.
- npm 10.9.0.
- Angular 17.3.12.
- Angular CLI y build tools 17.3.17.
- TypeScript 5.3.3, RxJS 7.8.2 y Zone.js 0.14.10.

Las versiones están fijadas en `package.json` y `package-lock.json` para que `npm ci` instale el mismo conjunto de dependencias. Angular 17 y Node 20 ya están fuera de soporte; esta rama se mantiene por compatibilidad con el equipo actual y no debe confundirse con la variante Angular 21 mantenida para una futura migración de seguridad.

## Ejecutar el demo en PowerShell

```powershell
npm ci
npm run start:demo
```

Abre http://localhost:4200. Usuarios ficticios: `admin@demo.com`, `guia@demo.com` y `viajero@demo.com`. Contraseña de demostración: `123456`. Para una cuenta nueva se exige una contraseña de 12 a 72 caracteres y aceptación de políticas. No uses datos reales en el demo.

Las operaciones se guardan en el almacenamiento local del navegador y los accesos en almacenamiento de sesión. Para reiniciar el demo, elimina la clave `app-guia-demo-v2` desde las herramientas del navegador. Los mensajes de WhatsApp no se envían a números reales desde el demo.

## Generar las dos versiones

```powershell
npm run build:demo
npm run build:production
```

- Demo: `dist/turismo-demo-v2/browser`.
- Producción: `dist/turismo-app/browser`.

La compilación de producción no registra el interceptor demo ni incluye sus cuentas ficticias. Usa `/api` en el mismo dominio mediante un proxy hacia el backend. Nunca pongas JWT_SECRET, contraseñas de base de datos o credenciales privadas en Angular.

## Netlify

Esta rama ya selecciona producción. Sustituye el dominio de backend de ejemplo en `netlify.toml` antes del despliegue.

Para el demo, usa `netlify.demo.toml` como configuración de despliegue: comando `npm run build:demo`, publicación `dist/turismo-demo-v2/browser` y Node 20.20.2.

Para producción, copia `netlify.production.toml` como `netlify.toml` y sustituye `REEMPLAZAR-BACKEND.example` por el dominio HTTPS real. La regla `/api/*` debe permanecer antes del fallback de Angular. Esto también conserva las cabeceras de seguridad de `src/_headers`. En la rama de producción esta selección ya queda aplicada; solo falta el destino real.

No se ha modificado el proyecto Netlify existente ni publicado sobre su URL. Antes de dirigir tráfico real: configura el backend, el responsable legal, los prestadores y las condiciones de cada experiencia.

## Recorrido funcional

1. El guía o administrador publica una experiencia, fija el lugar y el punto de encuentro con el mapa y abre fechas.
2. El viajero selecciona fecha y personas. Para hospedaje el precio es por persona y noche; se comprueban todas las noches de una estancia de 1 a 30 noches.
3. La app registra una solicitud idempotente. No bloquea cupos ni confirma dinero al abrir WhatsApp.
4. En producción el viajero abre voluntariamente WhatsApp con referencia, fechas, personas y total. La reserva conserva precio, condiciones y punto de encuentro.
5. El prestador confirma cupos. Puede registrar el pago después de verificarlo, completar o cancelar.
6. Mi viaje conserva las indicaciones incluso si se pausa la publicación. Una cancelación pagada pasa a reembolso en revisión; no se afirma que ya se devolvió el dinero.
7. El administrador envía mensajes en la bandeja de Notificaciones. Las promociones se filtran por consentimiento; el usuario puede retirarlo.

## Alcance de mapas y notificaciones

El permiso de geolocalización es opcional. No se guarda el historial de desplazamientos. `Cómo llegar` abre navegación externa en Google Maps al punto de encuentro. No hay navegación por voz propia, mapas sin conexión ni rastreo del viajero en segundo plano.

Las notificaciones son persistentes dentro de la aplicación; se consultan al abrir o actualizar la bandeja. No incluyen email, SMS, WhatsApp Business API ni Web Push con la app cerrada. La app no envía automáticamente mensajes de WhatsApp.

El mapa permite búsqueda sobre experiencias publicadas por municipio, departamento y título. Los campos de municipio/departamento admiten todos los pueblos; no hay autocompletado geográfico externo ni certificación automática de direcciones o RNT.

## Pruebas

```powershell
npx playwright install chromium
npm run build:demo
npm test
npm run build:production
npm audit
```

`tests/e2e.mjs` prueba el recorrido en una pantalla móvil, con respuestas externas de imágenes/mapas bloqueadas para mantener determinismo. No valida cobertura real de carreteras, tráfico ni entrega a servicios externos. El backend tiene pruebas adicionales de autorización, concurrencia y consentimientos.

## Documentos legales

Rutas `/legal/terminos`, `/legal/privacidad`, `/legal/cancelaciones` y `/legal/almacenamiento`. Los datos del operador se leen de `/api/v2/legal`. Los textos son borradores operativos: completar identidad, contacto, proveedores, conservación y revisión jurídica antes del lanzamiento. No se presenta el software como una certificación de cumplimiento legal.

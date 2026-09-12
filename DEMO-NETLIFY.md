# Juan te guia — demo-v2

Esta rama deriva de feature/experiencia-viajero. Netlify utiliza netlify.toml para compilar exclusivamente el demo.

- Repositorio: paladohorweb/app-tour-frontend
- Rama: demo-v2
- Directorio base: raiz del repositorio (vacio)
- Comando: npm run build:demo -- --output-path=dist/turismo-app
- Publicacion: dist/turismo-app/browser
- Node: 20.20.2; npm: 10.9.0

No requiere backend, MySQL, JWT_SECRET ni credenciales de produccion. Los datos de demostracion se guardan en el navegador; no se comparten entre dispositivos. Las compras no se ejecutan y el demo no contacta numeros reales por WhatsApp.

Accesos: admin@demo.com, guia@demo.com, viajero@demo.com. Clave de demostracion: 123456.

Para probar localmente: npm ci y npm run start:demo.

Netlify requiere la salida base que detecta su plugin Angular. El argumento output-path cambia solo la carpeta: se conserva la configuracion demo, sus interceptores y datos ficticios. La compilacion local npm run build:demo conserva dist/turismo-demo-v2/browser.

Al incorporar cambios futuros de feature/experiencia-viajero, conservar la configuracion demo de netlify.toml. Publicar esta rama en un sitio de demostracion separado antes de cambiar el dominio comercial.

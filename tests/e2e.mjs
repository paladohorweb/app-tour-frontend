import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
const root = path.resolve("dist/turismo-demo-v2/browser");
const server = http.createServer((req, res) => {
  let file = path.resolve(
    root,
    "." + decodeURIComponent(req.url.split("?")[0]),
  );
  if (
    !file.startsWith(root + path.sep) ||
    !fs.existsSync(file) ||
    fs.statSync(file).isDirectory()
  )
    file = path.join(root, "index.html");
  const ext = path.extname(file);
  res.setHeader(
    "Content-Type",
    {
      ".html": "text/html",
      ".js": "text/javascript",
      ".css": "text/css",
      ".ico": "image/x-icon",
    }[ext] || "application/octet-stream",
  );
  res.end(fs.readFileSync(file));
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const base = "http://127.0.0.1:" + server.address().port;
let launch = { headless: true };
if (process.env.CHROMIUM_MODULE) {
  const mod = (await import(process.env.CHROMIUM_MODULE)).default;
  launch = {
    ...launch,
    args: [
      "--no-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--no-zygote",
    ],
    executablePath: await mod.executablePath(),
  };
}
const browser = await chromium.launch(launch);
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  geolocation: { latitude: 5.5994, longitude: -75.8193 },
  permissions: ["geolocation"],
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
// Network assets are excluded from behavior tests; map engine and controls still execute.
await page.route("https://**/*", (route) => route.abort());
async function visit(p) {
  await page.goto(base + p);
  await page.locator("app-loader").waitFor({ state: "detached" });
}
async function login(email) {
  await visit("/login");
  await page.locator('input[formcontrolname="email"]').fill(email);
  await page.locator('input[formcontrolname="password"]').fill("123456");
  await page.locator('button[type="submit"]').click();
  await page.waitForFunction(() => !!sessionStorage.getItem("access_token"));
}
async function logout() {
  await page.evaluate(() => sessionStorage.clear());
}
try {
  await visit("/");
  await page.getByRole('heading', { name: /Juan te guía/ }).waitFor();
  await page.getByRole('link', {name: 'Iniciar sesión para suscribirme'}).waitFor();
  await visit('/tours');
  await page.locator(".v2-card").first().waitFor();
  assert.equal(await page.locator(".v2-card").count(), 6);
  await page.getByRole("button", { name: "Abrir navegación" }).click();
  assert.equal(await page.locator(".navbar-collapse.show").count(), 1);
  await page.mouse.click(380, 800);
  assert.equal(await page.locator(".navbar-collapse.show").count(), 0);
  await visit("/mapa");
  await page.locator(".map-item").first().waitFor();
  const rect = await page.locator("#map").boundingBox();
  assert(
    rect.y < 350 && rect.height >= 300,
    "Mobile map should be visible before list",
  );
  await page.getByRole("button", { name: "Mi ubicación", exact: true }).click();
  await page.waitForFunction(
    () => document.querySelectorAll(".leaflet-overlay-pane path").length >= 8,
  );
  await login("viajero@demo.com");
  await visit("/experiencias/1");
  await page
    .locator('select[name="slot"] option')
    .nth(1)
    .waitFor({ state: "attached" });
  await page.locator('select[name="slot"]').selectOption({ index: 1 });
  await page.locator('input[name="terms"]').check();
  await page.locator('input[name="privacy"]').check();
  await page
    .getByRole("button", { name: "Solicitar y continuar por WhatsApp" })
    .click();
  await page.getByRole("heading", { name: /Solicitud DEMO-/ }).waitFor();
  let booking = await page.evaluate(
    () => JSON.parse(localStorage.getItem("app-guia-demo-v2")).bookings[0],
  );
  assert.equal(booking.status, "REQUESTED");
  assert.equal(booking.paymentStatus, "PENDING");
  assert.equal(await page.locator('a[href^="https://wa.me"]').count(), 0);
  await logout();
  await login("guia@demo.com");
  await visit("/guia/panel");
  await page.getByRole('button', {name: /Reservas ·/}).click();
  await page
    .getByRole("button", { name: "Confirmar disponibilidad", exact: true })
    .first()
    .click();
  await page
    .getByRole("button", { name: "Registrar pago recibido", exact: true })
    .first()
    .waitFor();
  page.once("dialog", (d) => d.accept());
  await page
    .getByRole("button", { name: "Registrar pago recibido", exact: true })
    .first()
    .click();
  await page.waitForFunction(
    () =>
      JSON.parse(localStorage.getItem("app-guia-demo-v2")).bookings[0]
        .paymentStatus === "VERIFIED",
  );
  await logout();
  await login("viajero@demo.com");
  await visit("/mis-reservas");
  await page.getByRole("link", { name: "Cómo llegar ↗" }).waitFor();
  await visit("/notificaciones");
  await page
    .getByRole("heading", { name: "Solicitud registrada", exact: true })
    .waitFor();
  await page.locator('input[type="checkbox"]').first().check();
  await page.getByRole("button", { name: "Guardar preferencia" }).click();
  await page.getByText("Preferencia guardada.").waitFor();
  await logout();
  await login("admin@demo.com");
  await visit("/notificaciones");
  await page.locator('input[name="title"]').fill("Promoción de prueba");
  await page
    .locator('textarea[name="message"]')
    .fill("Mensaje de prueba con consentimiento");
  await page.locator('input[name="promo"]').check();
  await page.getByRole("button", { name: "Enviar a la bandeja" }).click();
  await page
    .getByText("1 notificaciones entregadas en la aplicación.")
    .waitFor();
  await logout();
  await login("viajero@demo.com");
  await visit("/notificaciones");
  await page
    .getByRole("heading", { name: "Promoción de prueba", exact: true })
    .waitFor();
  await page.locator('input[type="checkbox"]').first().uncheck();
  await page.getByRole("button", { name: "Guardar preferencia" }).click();
  await page.getByText("Preferencia guardada.").waitFor();
  await visit("/legal/privacidad");
  await page
    .getByRole("heading", {
      name: "Política de tratamiento de datos personales",
    })
    .waitFor();
  assert.deepEqual(errors, [], "No browser JavaScript errors");
  console.log(
    "PASS: catálogo, menú móvil, mapa, GPS con permiso, solicitud, confirmación, pago manual, navegación, notificaciones, consentimiento y políticas.",
  );
} finally {
  await browser.close();
  server.close();
}

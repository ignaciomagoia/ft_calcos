# FT Calcos

Sitio estatico hecho con Astro + Tailwind para vender calcos. Incluye catalogo responsive, pagina "Como comprar" e integra Decap CMS para editar los markdown de contenido.

## Requisitos
- Node.js 20+
- npm 10+

## Correr en local
1. Instalar dependencias una vez: `npm install`.
2. Levantar el dev server con recarga en caliente: `npm run dev`.
3. Abrir `http://localhost:4321` en el navegador.

## Agregar y editar calcos desde /admin
1. Hacer deploy previo porque Decap CMS usa GitHub OAuth.
2. Ir a `https://tusitio/admin` y autenticarte con GitHub (el repo debe estar publico o con Git Gateway configurado).
3. Dentro de la coleccion **Calcos** podes crear o editar archivos. Cada entrada genera un markdown en `src/content/calcos` con los campos `name`, `price`, `image`, `payment_url` y el cuerpo como descripcion.
4. Las imagenes subidas quedan en `public/uploads` y se sirven desde `/uploads`.

Tambien podes editar los markdown manualmente en el repo si preferis PRs tradicionales.

## Deploy a GitHub Pages
1. Actualiza `site` en `astro.config.mjs` con `https://<usuario>.github.io/<repo>/`.
2. Configura `public/admin/config.yml` con `repo: <usuario>/<repo>` y la rama correcta.
3. Subi todo a GitHub con la rama `main`.
4. Activa GitHub Pages para que use `GitHub Actions`.
5. El workflow `.github/workflows/deploy.yml` se ejecuta en cada push a `main`, construye `npm run build` y publica el contenido de `dist` en Pages.

## Estructura clave
- `public/`
  - `admin/` (Decap CMS)
  - `images/` (recursos compartidos)
  - `uploads/` (media subida via CMS)
- `src/`
  - `components/` (UI reutilizable)
  - `content/` (markdown y schemas)
  - `layouts/` (layout principal)
  - `pages/` (catalogo y como comprar)
  - `styles/` (Tailwind base)
- `astro.config.mjs`
- `tailwind.config.cjs`
- `package.json`
- `README.md`

## Flujo sugerido
- Edita contenido via `/admin` o commits.
- Haz `npm run build` para verificar que no haya errores de tipado ni schema.
- Mergea en `main` para disparar el deploy automatico.

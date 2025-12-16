# FT Calcos

Sitio estatico hecho con Astro + Tailwind que ofrece catalogo responsive, carrito con localStorage y checkout por WhatsApp.

## Requisitos
- Node.js 20+
- npm 10+

## Correr en local
1. Instalar dependencias: `npm install`.
2. Ejecutar `npm run dev`. Este comando levanta Astro y compila el script del carrito con esbuild.
3. Abrir `http://localhost:4321`.

## Editar calcos
1. Abrir `public/data/calcos.json` y agregar/editar objetos con la forma:
   ```json
   {
     "id": "identificador-unico",
     "name": "Nombre visible",
     "price": 4500,
     "image": "/images/archivo.svg",
     "description": "Texto para la card"
   }
   ```
2. Guardar las imagenes en `public/images/` (SVG/JPG/PNG). Se referencian con rutas que empiezan con `/images/...`.
3. Guardar el archivo. Astro recompila y las tarjetas se actualizan automaticamente.

## Carrito y checkout
- El contador de la navegacion muestra la cantidad total en tiempo real.
- La pagina `/carrito` lista productos, permite sumar/restar o quitar y muestra el total.
- El boton **Finalizar por WhatsApp** abre `https://wa.me/5493585760730` con el mensaje que incluye el detalle, el total y los datos de transferencia (alias/CBU). Solo hace falta adjuntar el comprobante y coordinar la entrega.

## Deploy a GitHub Pages
1. `astro.config.mjs` ya apunta a `https://ignaciomagoia.github.io` con base `/ft_calcos`.
2. Pushear a `main` en `ignaciomagoia/ft_calcos`.
3. El workflow `.github/workflows/deploy.yml` corre `npm run build` y publica `dist/` en GitHub Pages.
4. En la configuracion del repo, asegurarse de que Pages use **GitHub Actions**.

## Archivos clave
- `public/data/calcos.json`: Fuente editable del catalogo.
- `public/images/`: Biblioteca de imagenes del sitio.
- `src/scripts/cart-client.ts`: Logica de UI del carrito (se compila a `public/scripts/cart-client.js` con esbuild).
- `src/components/CalcoCard.astro`: Representacion visual de cada calco.
- `src/pages/`: Paginas publicas (`index`, `como-comprar`, `carrito`).

## Tips
- Corre `npm run build` antes de deployar para validar que todo compile (ejecuta esbuild + Astro).
- Para ajustar el mensaje o los datos de transferencia, edita las constantes al inicio de `src/scripts/cart-client.ts` y vuelve a ejecutar `npm run build:scripts` si no estas usando `npm run dev`.

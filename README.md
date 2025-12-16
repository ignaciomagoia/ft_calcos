# FT Calcos

Sitio estatico hecho con Astro + Tailwind que ofrece catalogo responsive, carrito persistente y checkout por WhatsApp.

## Requisitos
- Node.js 20+
- npm 10+

## Correr en local
1. Instalar dependencias una vez: `npm install`.
2. Levantar el dev server con recarga en caliente: `npm run dev`.
3. Abrir `http://localhost:4321` en el navegador.

## Agregar o editar calcos
1. Abrir `src/data/calcos.json` y agregar un objeto con la forma:
   ```json
   {
     "id": "identificador-unico",
     "name": "Nombre visible",
     "price": 4500,
     "image": "/uploads/archivo.svg",
     "description": "Texto breve para la card"
   }
   ```
2. Guardar las imagenes en `public/uploads/` (SVG, JPG o PNG). Se referencian con rutas web que empiezan con `/uploads/`.
3. Guardar el archivo. Astro recarga el catalogo automaticamente al detectar cambios.

Las cantidades por defecto se manejan desde cada card y todo el carrito se guarda en `localStorage`, asi que no necesitas configurar un backend.

## Carrito y checkout
- El boton flotante abre el carrito (drawer). Tambien existe la pagina `/carrito` para tener un fallback sin JavaScript.
- El total y el detalle de items se sincronizan entre dispositivos gracias al almacenamiento local.
- El boton **Comprar por WhatsApp** arma un mensaje automatico a `5493585760730` con la lista de calcos, total en ARS y los datos de transferencia (alias/CBU). Solo tenes que compartir el comprobante y coordinar la entrega.

## Deploy a GitHub Pages
1. `astro.config.mjs` ya esta configurado con `site: https://ignaciomagoia.github.io` y `base: /ft_calcos`.
2. Commitea y pushea a `main` en `ignaciomagoia/ft_calcos`.
3. El workflow `.github/workflows/deploy.yml` se ejecuta en cada push a `main`, corre `npm run build` y publica `dist/` en GitHub Pages.
4. Desde la configuracion del repo asegurate de que Pages use la opcion **GitHub Actions**.

## Estructura clave
- `public/uploads/`: Imagenes utilizadas por las cards (se referencian desde el JSON).
- `src/data/calcos.json`: Fuente unica de productos.
- `src/components/`: Cards, boton flotante y carrito/drawer reutilizables.
- `src/lib/cart.ts`: Store del carrito (localStorage + helpers).
- `src/scripts/cart-ui.ts`: Logica de UI para cantidades, drawer y checkout.
- `src/pages/`: Rutas de contenido (`index`, `como-comprar`, `carrito`).

## Tips
- Ejecuta `npm run build` antes de subir cambios para asegurarte de que no haya errores.
- Si queres cambiar el mensaje de WhatsApp o los datos de transferencia, edita `src/scripts/cart-ui.ts` en la seccion de constantes.

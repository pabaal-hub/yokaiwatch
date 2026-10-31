# Mi colección Yo-kai Watch · Hasbro

## Contenido
- `index.html`: interfaz de la aplicación.
- `css/estilos.css`: estilos.
- `js/app.js`: filtros, casillas, persistencia local e importación/exportación.
- `data/catalogo.json`: catálogo inicial editable.
- `assets/images/`: carpeta para añadir las fotografías de las medallas.

## Ejecutar
Por las restricciones de seguridad de los navegadores, es preferible abrir el proyecto con un servidor local:

1. Instala Python si no lo tienes.
2. Abre una terminal en esta carpeta.
3. Ejecuta `python -m http.server 8000`.
4. Abre `http://localhost:8000`.

También puedes usar Live Server desde VS Code.

## Añadir fotografías
1. Copia cada imagen a `assets/images/`.
2. En `data/catalogo.json`, localiza la medalla y escribe la ruta relativa en el campo `image`.

Ejemplo:
```json
{
  "id": "motion-1-01",
  "name": "Robonyan",
  "reference": "HAS0000",
  "image": "assets/images/HAS0000.jpg"
}
```

Se recomienda nombrar los archivos con la referencia Hasbro cuando esté confirmada. Si no existe referencia, usa un nombre de archivo descriptivo y único.

## Datos y límites
El catálogo incluido es una base preliminar de las colecciones Yo-Motion y algunas exclusivas. No incluye todavía las cuatro series originales ni todas las exclusivas normales. Revisa nombres, referencias, variantes y asignación de serie antes de usarlo como inventario definitivo. Los campos `reference` e `image` se dejan vacíos cuando no están verificados.

## Guardado
La colección marcada se guarda en `localStorage` del navegador. Usa **Exportar** para guardar una copia JSON y **Importar** para recuperarla. Los datos permanecen en ese navegador; no se sincronizan automáticamente entre dispositivos.

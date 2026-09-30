# Conectar el formulario de la invitación con Google Sheets

Se hace una sola vez, con la cuenta de Google de la novia o el novio (unos 5 minutos, mejor desde un ordenador).

1. Entra en https://sheets.new para crear una hoja de cálculo nueva. Ponle de nombre, por ejemplo, **Confirmaciones boda**.
2. En el menú de la hoja: **Extensiones → Apps Script**.
3. Borra todo lo que aparezca en el editor y pega el contenido del archivo `Code.gs` de esta carpeta. Pulsa el icono de guardar.
4. Arriba a la derecha: **Implementar → Nueva implementación**.
   - En la rueda de "Seleccionar tipo", elige **Aplicación web**.
   - Descripción: `Invitación`.
   - Ejecutar como: **Yo**.
   - Quién tiene acceso: **Cualquier persona**.
   - Pulsa **Implementar**.
5. Google pedirá permisos. Pulsa **Autorizar acceso**, elige tu cuenta y, si aparece "Google no ha verificado esta aplicación", pulsa **Configuración avanzada → Ir a … (no seguro)** y luego **Permitir**. Es normal: el script es vuestro y solo escribe en esta hoja.
6. Copia la **URL de la aplicación web** (empieza por `https://script.google.com/macros/s/` y acaba en `/exec`) y pásasela a quien mantiene la web para ponerla en `docs/config.js` como `sheetUrl`.
7. Comparte la hoja con la otra persona (botón **Compartir**) para que los dos veáis las respuestas.

La primera confirmación crea sola la pestaña **Confirmaciones** con las columnas. Para tener un Excel: **Archivo → Descargar → Microsoft Excel (.xlsx)**.

Si más adelante cambias el script, tienes que volver a **Implementar → Gestionar implementaciones → editar (lápiz) → Versión: Nueva versión → Implementar**; la URL no cambia.

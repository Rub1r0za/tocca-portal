# Menús separados por comida

En **Admin → Días**, cada día tiene bloques de **Desayuno**, **Almuerzo** y **Cena**. Cada bloque admite una foto propia y líneas `curso | nombre EN | nombre ES | descripción EN | descripción ES`. Los cursos son entrada, principal y postre; las descripciones son opcionales. Se pueden dejar bloques vacíos y subir solamente una foto.

Los platos anteriores quedan en **Menú anterior sin asignar**. Para clasificarlos, mover sus líneas al bloque correspondiente. No se asigna una comida automáticamente porque no es posible deducir si un principal anterior corresponde al almuerzo o a la cena.

## Activación

Aplicar `supabase/migrations/0015_day_meal_menus.sql` en Supabase **antes de desplegar el código**. Incluye la función de selección atómica de la migración 0014 y la actualiza para separar comida y curso. No se ha ejecutado esta migración contra la base de producción desde este cambio.

La migración vincula días existentes solo cuando el título completo y el viaje coinciden con una única plantilla. Los días con títulos distintos o coincidencias ambiguas no se vinculan automáticamente. Los nuevos días creados desde una plantilla guardan su vínculo explícito.

Al guardar una plantilla, un trigger actualiza las fotos y platos de todos sus días vinculados dentro de la misma transacción. Conserva los platos agregados manualmente. Solo adopta platos anteriores que coinciden exactamente y sin ambigüedad con los de la plantilla. Los cambios de identidad del plato invalidan su selección anterior, para no atribuirle al viajero una elección diferente. Reordenar las líneas también puede requerir volver a elegir los platos afectados.

## Verificación

- `node --test scripts/test-day-menus.cjs`: dos menús completos, descripciones, validación, selecciones y recuentos independientes, compatibilidad anterior.
- `npm.cmd run build`: compilación y comprobación de TypeScript.
- Tras aplicar la migración, comprobar en una reserva de prueba: guardar almuerzo y cena con tres cursos y fotos distintas, volver a abrir el día, seleccionar ambos principales y verificar que se conservan ambas selecciones. Cambiar un plato desde Días y confirmar que se actualiza en las reservas vinculadas.

# Prompt para replicar la lógica de negocio de **ControlCajas**

Quiero que actúes como **arquitecto de software + implementador senior** y me ayudes a **replicar la lógica de negocio** del sistema descrito abajo, sin copiar la UI original literalmente.

## Objetivo
Implementar un backend (y opcionalmente frontend mínimo) que preserve exactamente estas reglas funcionales:

1. Gestión de usuarios con roles.
2. Registro de eventos logísticos (Expedición, Entrega, Recogida, Devolución).
3. Comparación automática entre pares de eventos por fecha y centro.
4. Sistema de ajustes por evento (solo informático).
5. Cierre diario con cálculos de deuda/stock/roturas.
6. CRUD de catálogos (almacenes, centros, vehículos, usuarios).

---

## Modelo de dominio (usar nombres equivalentes)

### Entidades principales
- **Usuario**: `nombre`, `contrasena` (hash), `rol`, `habilitado`.
  - Roles válidos: `informatico`, `chofer`, `almacenero`, `expedidor`.
- **CentroDistribucion**: catálogo de centros.
- **Almacen**: catálogo de almacenes.
- **Vehiculo**: catálogo de vehículos (incluye `chapa`).
- **Eventos** (cada tipo en colección/tabla separada):
  - **Expedicion**: `centro_distribucion`, `almacen`, `fecha`, `nombre`, `cajas`, `ajuste?`
  - **Entrega**: `centro_distribucion`, `chapa`, `fecha`, `nombre`, `cajas`, `ajuste?`
  - **Recogida**: `centro_distribucion`, `chapa`, `fecha`, `nombre`, `cajas`, `cajas_rotas`, `tapas_rotas`, `ajuste?`
  - **Devolucion**: `centro_distribucion`, `almacen`, `fecha`, `nombre`, `cajas`, `cajas_rotas`, `tapas_rotas`, `ajuste?`
- **Cierre**: `fecha`, `cierre_cd[]`, `cierre_almacen[]`.

### Estructuras numéricas
- `cajas`, `cajas_rotas`, `tapas_rotas` siempre con el shape:
  ```json
  { "blancas": number, "negras": number, "verdes": number }
  ```
- Si faltan valores, inicializar en `0`.

---

## Reglas de autorización (clave)

### Creación de eventos por rol
- `chofer` puede crear: **Entrega** y **Recogida**.
- `expedidor` puede crear: **Expedicion**.
- `almacenero` puede crear: **Devolucion**.
- Cualquier otro caso => `403`.

### Ajustes
- Solo `informatico` puede ajustar eventos existentes.
- El ajuste se guarda dentro del evento como:
  - `ajuste: { cajas, cajas_rotas, tapas_rotas, nombre }`
  - `nombre` es quien realiza el ajuste.

### Listado de eventos
- `informatico`: ve todos los eventos del tipo+fecha.
- Otros roles: solo ven eventos donde `nombre == usuario.nombre`.

---

## Flujo de autenticación/sesión

1. Login por `nombre + contrasena`.
2. Verificar hash de contraseña.
3. Bloquear acceso si `habilitado` es false.
4. Guardar sesión en cookie `usuario` (JSON con `id`, `nombre`, `rol`).
5. Logout elimina cookie.
6. Endpoint `me` devuelve usuario de cookie.

> No necesito JWT obligatorio si puedes conservar semántica de sesión con cookie httpOnly.

---

## Reglas de negocio por endpoint

### 1) Crear evento
Validaciones mínimas:
- Requeridos: `tipo_evento`, `centro_distribucion`, `fecha`, `nombre`.
- Según tipo:
  - Entrega/Recogida: usa `chapa`.
  - Expedicion/Devolucion: usa `almacen`.
  - Recogida/Devolucion: incluyen `cajas_rotas` y `tapas_rotas`.

Defaults:
- `cajas`, `cajas_rotas`, `tapas_rotas` default en 0 por color.

### 2) Comparar eventos por fecha
Debe existir un endpoint tipo `/comparar?fecha=YYYY-MM-DD&tipo=...` con dos modos.

#### A. `tipo = expedicion_entrega`
- Cargar expediciones y entregas por fecha.
- Antes de comparar, aplicar ajuste (sumar ajuste a `cajas`, etc.).
- Agrupar por `centro_distribucion`.
- Si hay múltiples registros por centro, concatenar nombres/chapas/almacenes sin duplicar y sumar cajas.
- `alerta = true` si:
  - falta uno de los dos lados (expedición o entrega), o
  - las cajas por color difieren.

#### B. `tipo = devolucion_recogida`
- Cargar devoluciones y recogidas por fecha.
- Aplicar ajuste igual que arriba.
- Agrupar por `centro_distribucion`.
- `alerta = true` si difieren cajas o roturas entre recogida/devolución.
- `rotura = true` si existe cualquier valor > 0 en `cajas_rotas` o `tapas_rotas` en cualquiera de los lados.

### 3) Cierre diario
- Endpoint para consultar cierre por fecha.
- Endpoint para crear cierre por fecha.
- No permitir crear más de un cierre por la misma fecha (`409`).

Cálculo esperado del cierre (si no existe uno persistido):

#### `cierre_almacen`
- Por cada almacén:
  - `+ Devolucion.cajas`
  - `- Expedicion.cajas`

#### `cierre_cd`
- Por cada centro:
  - `ajuste_deuda = + Entrega.cajas - Recogida.cajas`
  - `roturas = Recogida.cajas_rotas + Recogida.tapas_rotas`

> Nota: en la implementación de referencia, `cajas_rotas` y `tapas_rotas` del cierre CD terminan usando el mismo valor agregado de roturas. Reproducir este comportamiento para compatibilidad.

---

## CRUD de catálogos
Implementar CRUD para:
- Almacenes
- Centros de distribución
- Vehículos
- Usuarios (al menos GET y PUT para habilitar/ajustar atributos)

Puedes usar operaciones simples sin reglas complejas extra, pero mantén respuesta JSON y manejo de errores consistente.

---

## Comportamientos importantes de compatibilidad

1. Al leer/listar/comparar eventos, si hay `ajuste`, mostrar/usar valores ya sumados.
2. Al serializar eventos para API, convertir `_id` a string.
3. Manejo de errores:
   - `400` para datos incompletos o parámetros inválidos
   - `401` para no autenticado
   - `403` para sin permiso
   - `404` para no encontrado
   - `409` para conflicto de cierre duplicado
   - `500` para errores internos

---

## Entregables que te pido

1. **Diseño técnico breve** (entidades, relaciones, endpoints).
2. **Código completo** del backend con esta lógica.
3. **Colección de pruebas** (unitarias o integración) que cubran:
   - permisos por rol,
   - comparación con y sin ajuste,
   - cierre diario,
   - bloqueo de cierre duplicado.
4. **Ejemplos de requests/responses** para cada endpoint principal.
5. **Checklist de paridad funcional** contra esta especificación.

Si detectas ambigüedades, decide la opción más compatible con las reglas arriba y explícitala.

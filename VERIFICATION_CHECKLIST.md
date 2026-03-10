# Checklist de Verificación - ControlCajas

Usa esta lista para verificar que todo está correctamente instalado y funcionando.

## ✅ Verificación de Instalación

### Paso 1: Instalación de Dependencias

```bash
npm install
```

**Verifica:**

- [ ] Se instala sin errores
- [ ] Se crea carpeta `node_modules/`
- [ ] Se actualiza `package-lock.json`

### Paso 2: Verificar Archivos de Configuración

```bash
ls -la
```

**Verifica:**

- [ ] `.env.local` existe
- [ ] `package.json` existe
- [ ] `tsconfig.json` existe
- [ ] `tailwind.config.ts` existe
- [ ] `next.config.js` existe

### Paso 3: Verificar Estructura de Carpetas

```bash
tree -I 'node_modules' -L 3
```

**Verifica:**

- [ ] Carpeta `app/` con subestructura
- [ ] Carpeta `components/` con 4 archivos
- [ ] Carpeta `lib/` con 3 archivos
- [ ] Carpeta `scripts/` con seed.js

## 🚀 Verificación de Ejecución

### Paso 1: Inicia el Servidor

```bash
npm run dev
```

**Verifica:**

- [ ] Sale mensaje "ready - started server on 0.0.0.0:3000"
- [ ] No hay errores en la consola
- [ ] Espera a que compilación termine

### Paso 2: Accede a la Aplicación

Abre navegador → http://localhost:3000

**Verifica:**

- [ ] Carga la página de login
- [ ] Ves el logo "ControlCajas"
- [ ] Hay campos de usuario y contraseña
- [ ] Hay enlace a "Regístrate aquí"

### Paso 3: Prueba de Registro

1. Clica "Regístrate aquí"
2. Ingresa datos:
   - Usuario: `usuario_prueba`
   - Contraseña: `123456`
   - Rol: `chofer`
3. Clica "Registrarse"

**Verifica:**

- [ ] Redirige a `/dashboard`
- [ ] Aparece nombre de usuario en header
- [ ] Aparece rol (chofer)
- [ ] Aparece botón "Salir"

### Paso 4: Prueba de Dashboard

En el dashboard debes ver:

**Verifica:**

- [ ] Pestaña "Nuevo Evento"
- [ ] Pestaña "Ver Eventos"
- [ ] Botones según el rol (chofer → Transporte/Recogida)

### Paso 5: Verificar Base de Datos

1. Clica "Nuevo Evento"
2. Intenta crear un evento

**Verifica:**

- [ ] Aparecen selectores cargados (o al menos opciones)
- [ ] No hay errores en console del navegador
- [ ] O ves mensaje de error si no hay maestros

## 🔧 Verificación de MongoDB

### Paso 1: Comprueba la Cadena de Conexión

Abre `.env.local`:

**Verifica:**

- [ ] `MONGODB_URI` está presente
- [ ] Comienza con `mongodb+srv://`
- [ ] Incluye credenciales correctas

### Paso 2: Poblar Datos Iniciales

```bash
npm run seed
```

**Verifica:**

- [ ] Script se ejecuta sin errores
- [ ] Muestra "✓ Base de datos poblada exitosamente"
- [ ] Crea 4 centros y 4 vehículos

### Paso 3: Verifica en MongoDB Atlas

1. Ve a https://www.mongodb.com/cloud/atlas
2. Selecciona cluster `CajasCluster`
3. Ve a **Database** > **ControlCajas**

**Verifica:**

- [ ] Ves colecciones creadas:
  - CentroDistribucion (documentos)
  - Usuario (documentos de prueba)
  - Vehiculo (documentos)
  - Expedicion (si creaste eventos)
  - Transporte (si creaste eventos)
  - Devolucion
  - Recogida

## 📝 Verificación de Funcionalidades

### Test 1: Crear Expedición (como Almacén)

1. Registra usuario con rol `almacen`
2. En dashboard, clica "Nuevo Evento"
3. Selecciona "Expedicion"
4. Completa formulario con datos
5. Clica "Guardar Evento"

**Verifica:**

- [ ] Aparece mensaje "Evento creado exitosamente"
- [ ] Formulario se limpia
- [ ] Evento aparece en MongoDB en colección `Expedicion`

### Test 2: Crear Transporte (como Chofer)

1. Registra usuario con rol `chofer`
2. En dashboard, clica "Nuevo Evento"
3. Selecciona "Transporte"
4. Completa formulario
5. Clica "Guardar Evento"

**Verifica:**

- [ ] Evento se guarda
- [ ] Aparece en colección `Transporte` en MongoDB

### Test 3: Ver Comparación

1. En dashboard, clica "Ver Eventos"
2. Asegúrate de que la fecha es hoy
3. Espera a que cargue la tabla

**Verifica:**

- [ ] Aparece tabla de "Expediciones vs Transportes"
- [ ] Muestra centros con datos
- [ ] Si hay discrepancias, aparecen en rojo

### Test 4: Logout

1. Clica botón "Salir"

**Verifica:**

- [ ] Redirige a página de login
- [ ] Cookie de usuario se elimina
- [ ] No puedes acceder a dashboard sin login

### Test 5: Acceso por Rol

1. Registra usuario `informatico`
2. En dashboard, clica "Nuevo Evento"

**Verifica:**

- [ ] Aparece mensaje "No tienes permisos para crear eventos"
- [ ] No puedes crear eventos
- [ ] Puedes ver la pestaña "Ver Eventos"

## 🎨 Verificación de UI

### Verificar Estilos Tailwind

- [ ] Colores aplicados correctamente
- [ ] Layout responsive
- [ ] Bordes y espacios correctos
- [ ] Iconos/botones estilizados

### Verificar Responsive

1. Abre DevTools (F12)
2. Cambia a vista móvil (Ctrl+Shift+M)

**Verifica:**

- [ ] Interfaz se adapta a móvil
- [ ] Inputs son accesibles
- [ ] Tablas son legibles (scroll si es necesario)

## 🔒 Verificación de Seguridad

### Test 1: Contraseña Hasheada

1. Registra usuario
2. Abre MongoDB Atlas
3. Ve a colección `Usuario`

**Verifica:**

- [ ] Campo `contrasena` no contiene texto plano
- [ ] Contiene hash tipo `$2a$10$...`

### Test 2: Sesión Segura

1. Abre DevTools
2. Ve a **Application** > **Cookies**
3. Busca cookie `usuario`

**Verifica:**

- [ ] Existe cookie `usuario`
- [ ] Tiene flag `HttpOnly`
- [ ] Tiene expiración (24 horas)

## 📊 Rendimiento

### Verificar Tiempos de Carga

```bash
# En ConsoleTools (F12)
console.time('load');
// ... hacer acción ...
console.timeEnd('load');
```

**Verifica:**

- [ ] Login carga en < 2 segundos
- [ ] Dashboard carga en < 1 segundo
- [ ] Tablas cargan en < 3 segundos

## 📚 Documentación

Verifica que existen archivos:

- [ ] `README.md`
- [ ] `QUICK_START.md`
- [ ] `DATABASE_SCHEMA.md`
- [ ] `API_DOCUMENTATION.md`
- [ ] `DEPLOYMENT.md`
- [ ] `MONGODB_SETUP.md`
- [ ] `FEATURES.md`
- [ ] `DOCUMENTATION_INDEX.md` (este archivo)

## 🐛 Verificación de Errores

### Abre Console de Navegador (F12)

**Verifica:**

- [ ] No hay errores en rojo
- [ ] Warnings son aceptables (Next.js)
- [ ] Network requests se completan

### Abre Terminal donde corre `npm run dev`

**Verifica:**

- [ ] No hay errores TypeScript
- [ ] No hay warnings de compilación
- [ ] Compilacion completa sin problemas

## 🚀 Test de Flujo Completo

Sigue este flujo paso a paso:

1. **Registro**
   - [ ] Registre usuario `almacen1` con rol `almacen`
   - [ ] Registre usuario `chofer1` con rol `chofer`

2. **Crear Expedición**
   - [ ] Login como `almacen1`
   - [ ] Centro: "Centro Lima" (si existe)
   - [ ] Cajas: B=100, N=50, V=25
   - [ ] Guarda exitosamente

3. **Crear Transporte**
   - [ ] Login como `chofer1`
   - [ ] Centro: "Centro Lima"
   - [ ] Chapa: "ABC-001" (si existe)
   - [ ] Cajas: B=100, N=50, V=25
   - [ ] Guarda exitosamente

4. **Verificar Comparación**
   - [ ] Haz login con cualquier usuario
   - [ ] Ve a "Ver Eventos"
   - [ ] Aparece Centro Lima sin alerta (sin rojo)
   - [ ] Expedición y Transporte tienen mismos números

5. **Crear Mismatch**
   - [ ] Crea otro evento de Expedición para "Centro Arequipa"
   - [ ] NO crees evento de Transporte
   - [ ] En "Ver Eventos", Centro Arequipa debe estar en ROJO
   - [ ] Esto indica alerta correcta

## 📋 Puntos Finales

### Build para Producción

```bash
npm run build
npm start
```

**Verifica:**

- [ ] `npm run build` termina sin errores
- [ ] Se crea carpeta `.next/`
- [ ] `npm start` inicia servidor en puerto 3000
- [ ] Aplicación funciona en modo producción

### Logs y Monitoreo

**Verifica:**

- [ ] Puedes ver logs en consola
- [ ] Puedes identificar errores si ocurren
- [ ] Puedes monitorear rendimiento

## ✅ Conclusión

Si todos los checkboxes están marcados ✅:

- **✓ Instalación exitosa**
- **✓ MongoDB conectado**
- **✓ Aplicación funcional**
- **✓ Seguridad implementada**
- **✓ Documentación completa**
- **✓ Listo para producción**

## 🆘 Si Algo Falla

| Problema               | Referencia                           |
| ---------------------- | ------------------------------------ |
| BD no conecta          | [MONGODB_SETUP.md](MONGODB_SETUP.md) |
| Errores de compilación | [README.md](README.md)               |
| Formulario sin datos   | Ejecuta `npm run seed`               |
| UI no carga estilos    | Limpia caché (Ctrl+Shift+Del)        |
| Errores de red         | Revisa DevTools Console              |

---

**¡Felicidades! Si llegaste aquí, ControlCajas está listo para usar.** 🎉

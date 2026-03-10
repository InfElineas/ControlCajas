# ControlCajas - Sistema de Gestión de Cajas

Una aplicación web completa para gestionar el sistema de distribución y control de cajas, construida con Next.js, React, Tailwind CSS y MongoDB.

## Características

- **Autenticación**: Registro e inicio de sesión de usuarios con roles específicos
- **Roles de usuario**:
  - **Chofer**: Puede crear eventos de Entrega y Recogida
  - **Almacenero**: Puede crear eventos de Devolución.
  - **Expedidor**: Puede crear eventos de Expedición.
  - **Informático**: Acceso a reportes y a una sección administrativa para gestionar vehículos y centros de distribución
- **Creación de eventos**: Formularios dinámicos según el rol del usuario
- **Comparación de datos**: Tablas de análisis para detectar inconsistencias
- **Alertas visuales**: Filas resaltadas en rojo cuando hay desajustes entre eventos

## Requisitos

- Node.js 18+
- npm o yarn
- MongoDB (configurado con la cadena de conexión incluida)

## Instalación

1. **Clonar o descargar el proyecto**

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**

El archivo `.env.local` ya está configurado con la cadena de conexión a MongoDB:

```
MONGODB_URI=mongodb+srv://informaticoelineas6_db_user:Informatico*789@cajascluster.qjorpm7.mongodb.net/ControlCajas
JWT_SECRET=your-secret-key-change-this-in-production-env
```

Para cambiar el secreto JWT en producción, reemplaza el valor de `JWT_SECRET`.

4. **Poblar la base de datos** (Opcional - recomendado para desarrollo)

Para crear datos de ejemplo (centros de distribución y vehículos):

```bash
npm run seed
```

Esto creará:

- 4 Centros de Distribución (Lima, Arequipa, Trujillo, Cusco)
- 4 Vehículos para transporte

## Estructura del Proyecto

```
├── app/                      # Aplicación Next.js (App Router)
│   ├── api/                  # Rutas API
│   │   ├── auth/            # Autenticación (login, registro, logout)
│   │   ├── centros/         # Obtener centros de distribución
│   │   ├── vehiculos/       # Obtener vehículos
│   │   ├── eventos/         # Crear eventos
│   │   └── comparar/        # Comparar eventos
│   ├── dashboard/           # Dashboard principal (incluye pestaña de administración para informáticos)
│   ├── page.tsx             # Página de login
│   ├── registro/            # Página de registro
│   ├── layout.tsx           # Layout raíz
│   └── globals.css          # Estilos globales
├── components/              # Componentes React
│   ├── FormularioEvento.tsx
│   ├── TablaExpedicionEntrega.tsx
│   ├── TablaDevolucionRecogida.tsx
│   └── Header.tsx
├── lib/                     # Funciones utilitarias
│   ├── mongodb.ts           # Conexión a MongoDB
│   └── auth.ts              # Funciones de autenticación y hash
├── public/                  # Archivos estáticos
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
└── postcss.config.js
```

## Ejecutar la Aplicación

### Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### Producción

```bash
npm run build
npm start
```

## Colecciones de MongoDB

La aplicación automatiza el acceso a las siguientes colecciones en la base de datos "ControlCajas":

- **CentroDistribucion**: Centros de distribución disponibles
- **Usuario**: Usuarios registrados con contraseñas hasheadas
- **Vehiculo**: Vehículos disponibles para transporte
- **Expedicion**: Eventos de expedición de cajas desde almacén
- **Entrega**: Eventos de entrega de cajas
- **Recogida**: Eventos de recogida de cajas
- **Devolucion**: Eventos de devolución de cajas

## Flujo de Uso

### 1. Registro e Inicio de Sesión

- Accede a `http://localhost:3000`
- Crea una nueva cuenta seleccionando tu rol
- O inicia sesión con una cuenta existente

### 2. Crear Eventos (Chofer o Almacén)

- En el dashboard, haz clic en "Nuevo Evento"
- Selecciona el tipo de evento según tu rol
- Completa el formulario con la información requerida
- El formulario muestra campos dinámicos según el tipo de evento

### 3. Ver Eventos y Comparaciones

- En el dashboard, haz clic en "Ver Eventos"
- Selecciona una fecha para ver los eventos de ese día
- Las filas en rojo indican inconsistencias entre expediciones/entregas o recogidas/devoluciones

## Seguridad

- Las contraseñas se almacenan hasheadas usando bcryptjs
- Las sesiones se mantienen mediante cookies HTTP
- Acceso a rutas API protegido implícitamente por roles

## Tecnologías Utilizadas

- **Next.js 14**: Framework React con App Router
- **React 18**: Librería de interfaz de usuario
- **TypeScript**: Tipado estático
- **Tailwind CSS**: Framework de CSS utilitario
- **MongoDB**: Base de datos NoSQL
- **bcryptjs**: Hash seguro de contraseñas
- **js-cookie**: Manejo de cookies en cliente

## Notas Importantes

- La fecha de los eventos se establece automáticamente a la fecha actual
- Los campos numéricos (cajas, cajas rotas, tapas rotas) tienen valor por defecto 0
- Las tablas de comparación se actualizan automáticamente al cambiar la fecha
- Los errores se muestran tanto en formularios como en tablas

## Solución de Problemas

### "Error al conectar a la base de datos"

- Verifica que tu conexión a internet sea estable
- Verifica que la cadena MONGODB_URI en `.env.local` sea correcta
- Comprueba que la IP de tu máquina está autorizada en MongoDB Atlas

### "El formulario no muestra opciones"

- Verifica que existan registros en las colecciones CentroDistribucion y Vehiculo
- Comprueba que tu usuario tiene el rol correcto

### "Las tablas están vacías"

- Verifica que existan eventos creados para la fecha seleccionada
- Comprueba que los datos se insertan correctamente en MongoDB

## Licencia

Este proyecto es de uso privado.

## Soporte

Para reportar problemas o sugerencias, contacta al equipo de desarrollo.

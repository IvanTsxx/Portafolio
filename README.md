# Portafolio de Iván Bongiovanni

Portafolio personal minimalista construido con Next.js 16, TypeScript, Prisma, PostgreSQL y Better Auth. Incluye sistema de blog con editor MDX, gestión de proyectos y experiencias, y panel de administración completo.

## 🚀 Características

- **Diseño minimalista** con enfoque en el contenido
- **Blog con MDX** y editor con preview en tiempo real
- **Gestión de proyectos** con tecnologías y enlaces
- **Timeline de experiencia profesional**
- **Panel de administración** completo
- **Autenticación con Google** (Better Auth)
- **Búsqueda global** con Cmd+K
- **SEO optimizado** con meta tags y Open Graph
- **100% TypeScript** con tipado estricto
- **Responsive** en todos los dispositivos

## 📦 Stack Tecnológico

- **Framework:** Next.js 16 (App Router)
- **Lenguaje:** TypeScript (strict mode)
- **Base de datos:** PostgreSQL (Neon)
- **ORM:** Prisma
- **Autenticación:** Better Auth (Google OAuth)
- **Estilos:** Tailwind CSS + shadcn/ui
- **Formularios:** TanStack Form
- **Validación:** Zod
- **MDX:** @next/mdx + react-markdown
- **Linting:** BiomeJS

## 🛠️ Instalación

### 1. Clonar el repositorio

\`\`\`bash
git clone <repo-url>
cd ivan-portfolio
\`\`\`

### 2. Instalar dependencias

\`\`\`bash
npm install
# o
pnpm install
# o
yarn install
\`\`\`

### 3. Configurar variables de entorno

Copia el archivo \`.env.example\` a \`.env\` y completa las variables:

\`\`\`bash
cp .env.example .env
\`\`\`

#### Variables necesarias:

- \`DATABASE_URL\`: URL de conexión a PostgreSQL (Neon)
- \`GOOGLE_CLIENT_ID\`: Client ID de Google OAuth
- \`GOOGLE_CLIENT_SECRET\`: Client Secret de Google OAuth
- \`NEXT_PUBLIC_APP_URL\`: URL de la aplicación (http://localhost:3000 en desarrollo)

### 4. Configurar Google OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google+
4. Crea credenciales OAuth 2.0:
   - Tipo: Aplicación web
   - URIs de redireccionamiento autorizados: \`http://localhost:3000/api/auth/callback/google\`
5. Copia el Client ID y Client Secret a tu archivo \`.env\`

### 5. Configurar la base de datos

\`\`\`bash
# Generar el cliente de Prisma
npm run db:generate

# Sincronizar el esquema con la base de datos
npm run db:push

# (Opcional) Abrir Prisma Studio para ver los datos
npm run db:studio
\`\`\`

### 6. Ejecutar en desarrollo

\`\`\`bash
npm run dev
\`\`\`

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## 📝 Uso

### Acceso al panel de administración

1. Ve a `/admin`
2. Inicia sesión con tu cuenta de Google (debe estar en la lista de emails permitidos)
3. Edita el archivo \`lib/auth.ts\` para agregar tu email a \`ALLOWED_EMAILS\`

### Crear contenido

#### Posts
1. Ve a `/admin/posts`
2. Haz clic en "Nuevo post"
3. Completa la información y escribe el contenido en Markdown
4. Usa la pestaña "Vista previa" para ver cómo se verá
5. Publica o guarda como borrador

#### Proyectos
1. Ve a `/admin/projects`
2. Similar al flujo de posts
3. Agrega enlaces de demo y GitHub
4. Asocia tecnologías utilizadas

#### Experiencia
1. Ve a `/admin/experiences`
2. Completa información de la empresa y puesto
3. Agrega fechas de inicio y fin
4. Describe tus responsabilidades y logros

### Búsqueda

Presiona \`Cmd + K\` (o \`Ctrl + K\` en Windows/Linux) en cualquier parte del sitio para abrir el buscador global. Busca posts, proyectos por título, descripción, tags, categorías y tecnologías.

## 🎨 Personalización

### Colores

Edita \`app/globals.css\` para cambiar los colores del tema:

\`\`\`css
:root {
  --background: 0 0% 99%;
  --foreground: 240 10% 15%;
  --primary: 240 80% 60%;
  /* ... más variables */
}
\`\`\`

### Fuentes

Edita \`app/layout.tsx\` para cambiar las fuentes:

\`\`\`tsx
import { TuFuente, TuFuenteMono } from 'next/font/google'
\`\`\`

### Información personal

Actualiza la información en:
- \`app/page.tsx\`: Contenido de la homepage
- \`components/layout/footer.tsx\`: Enlaces de redes sociales
- \`lib/auth.ts\`: Emails permitidos para admin

## 📄 Scripts disponibles

- \`npm run dev\`: Inicia el servidor de desarrollo
- \`npm run build\`: Construye la aplicación para producción
- \`npm run start\`: Inicia el servidor de producción
- \`npm run lint\`: Ejecuta el linter (BiomeJS)
- \`npm run lint:fix\`: Corrige automáticamente errores de linting
- \`npm run format\`: Formatea el código
- \`npm run db:generate\`: Genera el cliente de Prisma
- \`npm run db:push\`: Sincroniza el esquema con la base de datos
- \`npm run db:studio\`: Abre Prisma Studio

## 🚀 Despliegue en Vercel

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno en Vercel
3. Conecta tu base de datos Neon
4. Despliega

Recuerda actualizar \`NEXT_PUBLIC_APP_URL\` con tu dominio de producción y agregar la URL de callback de Google OAuth.

## 📝 Licencia

Este proyecto es personal y puede ser usado como referencia.

---

Desarrollado por **Iván Bongiovanni** 🚀

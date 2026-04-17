# DemoFront

Aplicación frontend construida con React + TypeScript + Vite.

## Requisitos

Antes de ejecutar este proyecto, asegúrate de tener:

- Node.js 20.x LTS (recomendado)
- npm 10+ (incluido en versiones modernas de Node.js)
- Git
- VS Code (recomendado)

## Instalación

```bash
npm install
```

## Ejecutar En Desarrollo

```bash
npm run dev
```

URL local por defecto:

```text
http://localhost:5173
```

Si necesitas acceso desde otros dispositivos en la misma red:

```bash
npm run dev -- --host
```

## Compilar Para Producción

```bash
npm run build
```

## Previsualizar Build De Producción

```bash
npm run preview
```

## Organización De Carpetas Del Proyecto (Por Equipos)

Este proyecto ahora está organizado por código núcleo compartido y módulos por funcionalidad, para que cada equipo pueda trabajar en áreas aisladas.

```text
src/
├─ core/                          # Código compartido (entre equipos)
│  ├─ api/                        # Clientes de API y adaptadores de servicios
│  ├─ auth/                       # Utilidades/guards de autenticación compartidas (reservado)
│  ├─ components/                 # Componentes UI compartidos (Header, Sidebar, ui/*)
│  ├─ routes/                     # Ruteo global y layout principal de la app
│  │  ├─ RootLayout.tsx
│  │  └─ router.ts
│  └─ utils/                      # Funciones utilitarias compartidas
│
├─ modules/                       # Módulos por funcionalidad (propiedad por equipo)
│  ├─ auth/                       # Squad: flujos de identidad / acceso
│  │  └─ pages/
│  │     ├─ LandingPage.tsx
│  │     ├─ Login.tsx
│  │     └─ Register.tsx
│  │
│  ├─ users/                      # Squad: usuarios y dominio de perfil de jugador
│  │  └─ pages/
│  │     └─ Profile.tsx
│  │
│  ├─ teams/                      # Squad: dominio de equipos/operación de partidos
│  │  ├─ data/
│  │  │  └─ matchesData.ts
│  │  └─ pages/
│  │     ├─ ArbitroDashboard.tsx
│  │     └─ MatchDetail.tsx
│  │
│  ├─ tournament/                 # Squad: dominio de gestión de torneos
│  │  └─ pages/
│  │     ├─ OrganizerDashboard.tsx
│  │     ├─ CreateTournament.tsx
│  │     ├─ ManageTournaments.tsx
│  │     ├─ Tournament.tsx
│  │     ├─ TournamentDetail.tsx
│  │     └─ PaymentReport.tsx
│  │
│  └─ competition/                # Squad: vistas de competición y estadísticas
│     └─ pages/
│        ├─ Dashboard.tsx
│        ├─ Events.tsx
│        ├─ Matches.tsx
│        ├─ Schedule.tsx
│        └─ Scores.tsx
│
├─ App.tsx                        # Capa principal de la app usando RouterProvider
├─ main.tsx                       # Punto de entrada de React
├─ assets/                        # Recursos estáticos
└─ styles/                        # Estilos globales y archivos de tema
```

## Cómo Funciona El Comportamiento Responsive En Este Proyecto React

La app usa clases utilitarias de CSS y breakpoints responsivos (principalmente con patrones estilo Tailwind) para adaptar layout y espaciado.

Principios clave utilizados:

- Estilos mobile-first: las clases base apuntan primero a pantallas pequeñas
- Overrides por breakpoint: sm:, md:, lg:, etc. mejoran progresivamente el layout
- Contenedores flexibles: flex, grid, wrapping y restricciones de ancho (max-w-*)
- Patrones de navegación condicional: navegación de escritorio y componentes de navegación móvil
- Espaciado y tipografía fluidos: clases responsivas de padding, margin y tamaño de fuente

Flujo recomendado para responsive:

1. Construir y validar cada página primero en ancho móvil.
2. Agregar ajustes por breakpoint para tablet y escritorio.
3. Probar páginas críticas en modo responsive del navegador (Chrome/Edge DevTools).
4. Mantener comportamientos de layout reutilizables en core/components cuando sea posible.

## Reglas De Colaboración Del Equipo (Alcance Actual)

- Coloca código reutilizable entre funcionalidades en src/core/*.
- Coloca vistas y lógica específicas de cada funcionalidad en src/modules/<feature>/*.
- Evita importar un módulo directamente desde otro, salvo aprobación.
- Mantén el ruteo centralizado en src/core/routes/router.ts.

Este README actualmente se enfoca en configuración + organización de carpetas + comportamiento responsive. Las convenciones de manejo de errores y arquitectura frontend se definirán en el siguiente paso.

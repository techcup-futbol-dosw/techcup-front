Estructura general del frame

La pantalla está organizada en cuatro secciones principales en disposición vertical:

Área superior de información del partido

Área central de registro de eventos por equipo

Área de historial de eventos registrados

Área inferior de acción principal

Todo el contenido debe organizarse con Auto Layout vertical para mantener consistencia y adaptabilidad.

1. Área superior (información del partido)

Contenedor horizontal con tres elementos principales:

Estructura

Container
 ├── Icono de navegación o regreso
 ├── Información central del partido
 │     ├── Nombre equipo local
 │     ├── Marcador
 │     ├── Nombre equipo visitante
 │     └── Tiempo o minuto del partido
 └── Icono de perfil o acciones

Características:

Los elementos deben estar alineados horizontalmente.

El bloque central debe ocupar el espacio principal.

El marcador debe destacarse visualmente dentro de la información.

2. Área de registro de eventos

Sección principal de la pantalla.

Se organiza como un grid de dos columnas donde cada columna representa un equipo.

Container (Grid 2 columnas)

 ├── Panel Equipo Local
 └── Panel Equipo Visitante
Panel de equipo

Cada panel es una tarjeta independiente con Auto Layout vertical.

Estructura:

Team Panel
 ├── Nombre del equipo
 ├── Lista de eventos
Lista de eventos

Cada evento se representa como una fila horizontal reutilizable (componente).

Event Row
 ├── Icono del evento
 ├── Nombre del evento
 ├── Contador de eventos registrados
 └── Botón de acción (registrar evento)

Las filas se repiten para los distintos tipos de eventos:

Gol

Tarjeta amarilla

Tarjeta roja

Tiro de esquina

Falta

Cada fila debe usar Auto Layout horizontal para mantener la alineación de iconos, contadores y botones.

3. Área de historial de eventos

Debajo de los paneles de equipos debe existir una sección que muestre los últimos eventos registrados en el partido.

Estructura:

Event History Container
 ├── Lista de eventos

Cada evento del historial se representa como una fila horizontal.

History Row
 ├── Minuto del evento
 ├── Icono del evento
 ├── Equipo asociado
 └── Información adicional opcional

Las filas se agregan dinámicamente a medida que se registran eventos.

4. Área inferior de acción principal

Contenedor inferior destinado a una única acción principal.

Estructura:

Bottom Action Container
 └── Botón de acción principal

Características:

Debe ocupar el ancho completo del contenedor.

Debe estar separado visualmente del resto del contenido.

Debe mantenerse fijo o claramente ubicado al final del flujo.

Componentes reutilizables sugeridos

Para mantener consistencia en Figma se recomienda crear los siguientes componentes:

Componentes principales

Team Panel

Event Row

History Row

Primary Action Button

Componentes secundarios

Icon Button

Counter Display

Event Icon

Sistema de layout recomendado

Organización del frame:

Frame Principal
│
├── Match Info Container
│
├── Teams Events Container
│   ├── Team Panel
│   └── Team Panel
│
├── Event History Container
│
└── Bottom Action Container

Uso de Auto Layout en todos los contenedores para permitir escalabilidad y fácil modificación del diseño.
# Modulo teams

Responsabilidad:
- Soportar operaciones del arbitro durante el torneo.
- Permitir control de eventos de partido en tiempo real.

Paginas clave:
- `ArbitroDashboard.tsx`: inicio operativo del arbitro.
- `MatchDetail.tsx`: control de marcador, cronometro y eventos.

Criterios de mantenimiento:
- Priorizar acciones criticas (iniciar, pausar, finalizar) con feedback visible.
- Mantener estados de partido sincronizados y faciles de auditar.
- Reducir friccion en flujo mobile para uso en cancha.

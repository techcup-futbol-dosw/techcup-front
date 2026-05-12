/**
 * @file src\modules\competition\pages\Events.tsx
 * @description Main source file for the DemoFront application architecture.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sidebar } from "@/core/components/Sidebar";
import { EventCard } from "@/core/components/EventCard";
import { X, Calendar, MapPin, Users, Clock, Award } from "lucide-react";

interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  participants: number;
  status: "active" | "upcoming" | "completed";
  image: string;
  description: string;
  duration: string;
  prize: string;
}

export function Events() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const events: Event[] = [
    {
      id: 1,
      title: "Tech Summit 2026",
      date: "15 de Marzo, 2026",
      location: "Centro de Convenciones",
      participants: 450,
      status: "active",
      image: "https://images.unsplash.com/photo-1768590149213-8ab16aaf7511?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwY29uZmVyZW5jZSUyMGV2ZW50fGVufDF8fHx8MTc3MjU2MDAxM3ww&ixlib=rb-4.1.0&q=80&w=1080",
      description: "El evento tecnológico más importante del año con líderes de la industria",
      duration: "3 días",
      prize: "$50,000 en premios",
    },
    {
      id: 2,
      title: "Hackathon AI Challenge",
      date: "22 de Marzo, 2026",
      location: "Campus Universitario",
      participants: 180,
      status: "upcoming",
      image: "https://images.unsplash.com/photo-1649451844813-3130d6f42f8a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2RpbmclMjBoYWNrYXRob24lMjBjb21wZXRpdGlvbnxlbnwxfHx8fDE3NzI1ODk2MTh8MA&ixlib=rb-4.1.0&q=80&w=1080",
      description: "Competencia de 48 horas para crear soluciones innovadoras con IA",
      duration: "48 horas",
      prize: "$25,000 primer lugar",
    },
    {
      id: 3,
      title: "Networking Tech Meetup",
      date: "8 de Marzo, 2026",
      location: "Virtual",
      participants: 320,
      status: "completed",
      image: "https://images.unsplash.com/photo-1576092762791-dd9e2220abd1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNoJTIwbWVldHVwJTIwbmV0d29ya2luZ3xlbnwxfHx8fDE3NzI1NDIyODl8MA&ixlib=rb-4.1.0&q=80&w=1080",
      description: "Conecta con profesionales y amplía tu red de contactos",
      duration: "2 horas",
      prize: "Acceso VIP a eventos",
    },
    {
      id: 4,
      title: "Innovation Workshop",
      date: "30 de Marzo, 2026",
      location: "Hub de Innovación",
      participants: 85,
      status: "upcoming",
      image: "https://images.unsplash.com/photo-1760446410593-0710fb22cafc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbm5vdmF0aW9uJTIwd29ya3Nob3AlMjBwcmVzZW50YXRpb258ZW58MXx8fHwxNzcyNjMzMDU0fDA&ixlib=rb-4.1.0&q=80&w=1080",
      description: "Taller práctico sobre metodologías ágiles y design thinking",
      duration: "1 día",
      prize: "Certificación oficial",
    },
  ];

  return (
    <div className="flex min-h-screen bg-white pb-20 lg:pb-0">
      <Sidebar />

      <div className="flex-1 lg:ml-64">
        {/* Top Bar */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="sticky top-0 z-40 backdrop-blur-lg bg-white/80 border-b border-black/5 px-8 py-6"
        >
          <div>
            <h1 className="text-3xl mb-1" style={{ fontWeight: 700 }}>
              Eventos & Competencias
            </h1>
            <p className="text-[#ADB5BD]" style={{ fontWeight: 500 }}>
              Descubre y participa en eventos tecnológicos
            </p>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="px-8 py-6 border-b border-black/5">
          <div className="flex flex-wrap gap-3">
            {["Todos", "En Curso", "Próximos", "Finalizados"].map((filter, index) => (
              <motion.button
                key={filter}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-2 rounded-xl transition-all duration-300 ${
                  index === 0
                    ? "bg-[#B81C1C] text-white"
                    : "bg-[#F8F9FA] text-[#ADB5BD] hover:bg-[#B81C1C] hover:text-white"
                }`}
                style={{ fontWeight: 600 }}
              >
                {filter}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {events.map((event, index) => (
              <EventCard
                key={event.id}
                title={event.title}
                date={event.date}
                location={event.location}
                participants={event.participants}
                status={event.status}
                image={event.image}
                delay={index * 0.1}
                onClick={() => setSelectedEvent(event)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Event Detail Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl overflow-hidden max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="relative h-64">
                <img
                  src={selectedEvent.image}
                  alt={selectedEvent.title}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:scale-110 transition-transform duration-200"
                >
                  <X className="w-6 h-6 text-black" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-8">
                <h2 className="text-3xl mb-4" style={{ fontWeight: 700 }}>
                  {selectedEvent.title}
                </h2>
                <p className="text-[#ADB5BD] mb-6" style={{ fontWeight: 500 }}>
                  {selectedEvent.description}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-3 p-4 bg-[#F8F9FA] rounded-xl">
                    <Calendar className="w-5 h-5 text-[#B81C1C]" />
                    <div>
                      <p className="text-xs text-[#ADB5BD]" style={{ fontWeight: 500 }}>
                        Fecha
                      </p>
                      <p style={{ fontWeight: 600 }}>{selectedEvent.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-[#F8F9FA] rounded-xl">
                    <MapPin className="w-5 h-5 text-[#B81C1C]" />
                    <div>
                      <p className="text-xs text-[#ADB5BD]" style={{ fontWeight: 500 }}>
                        Ubicación
                      </p>
                      <p style={{ fontWeight: 600 }}>{selectedEvent.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-[#F8F9FA] rounded-xl">
                    <Users className="w-5 h-5 text-[#B81C1C]" />
                    <div>
                      <p className="text-xs text-[#ADB5BD]" style={{ fontWeight: 500 }}>
                        Participantes
                      </p>
                      <p style={{ fontWeight: 600 }}>{selectedEvent.participants}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-[#F8F9FA] rounded-xl">
                    <Clock className="w-5 h-5 text-[#B81C1C]" />
                    <div>
                      <p className="text-xs text-[#ADB5BD]" style={{ fontWeight: 500 }}>
                        Duración
                      </p>
                      <p style={{ fontWeight: 600 }}>{selectedEvent.duration}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-[#B81C1C]/10 to-[#C4841D]/10 rounded-xl mb-6">
                  <div className="flex items-center gap-3">
                    <Award className="w-6 h-6 text-[#C4841D]" />
                    <div>
                      <p className="text-xs text-[#ADB5BD]" style={{ fontWeight: 500 }}>
                        Premio
                      </p>
                      <p style={{ fontWeight: 700, color: '#C4841D' }}>
                        {selectedEvent.prize}
                      </p>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 rounded-xl text-white transition-all duration-300"
                  style={{ backgroundColor: '#B81C1C', fontWeight: 600, fontSize: '1.125rem' }}
                >
                  Inscribirse Ahora
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}



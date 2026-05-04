/**
 * @file src\core\components\EventCard.tsx
 * @description Main source file for the DemoFront application architecture.
 */
import { motion } from "motion/react";
import { Calendar, MapPin, Users } from "lucide-react";
import { Badge } from "./ui/badge";

interface EventCardProps {
  title: string;
  date: string;
  location: string;
  participants: number;
  status: "active" | "upcoming" | "completed";
  image: string;
  delay?: number;
  onClick?: () => void;
}

export function EventCard({
  title,
  date,
  location,
  participants,
  status,
  image,
  delay = 0,
  onClick,
}: EventCardProps) {
  const statusConfig = {
    active: { label: "En Curso", color: "#17C964" },
    upcoming: { label: "Próximo", color: "#0066FE" },
    completed: { label: "Finalizado", color: "#ADB5BD" },
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -8, scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden border border-black/5 hover:shadow-2xl hover:shadow-black/10 transition-all duration-300 cursor-pointer group"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <motion.img
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.6 }}
          src={image}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4">
          <Badge
            style={{
              backgroundColor: statusConfig[status].color,
              color: "white",
              fontWeight: 600,
              padding: "6px 12px",
              borderRadius: "8px",
            }}
          >
            {statusConfig[status].label}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="mb-4" style={{ fontWeight: 700, fontSize: "1.25rem" }}>
          {title}
        </h3>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[#ADB5BD]">
            <Calendar className="w-4 h-4" />
            <span style={{ fontWeight: 500 }}>{date}</span>
          </div>
          <div className="flex items-center gap-2 text-[#ADB5BD]">
            <MapPin className="w-4 h-4" />
            <span style={{ fontWeight: 500 }}>{location}</span>
          </div>
          <div className="flex items-center gap-2 text-[#ADB5BD]">
            <Users className="w-4 h-4" />
            <span style={{ fontWeight: 500 }}>{participants} participantes</span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full mt-6 py-3 rounded-xl text-white transition-all duration-300"
          style={{
            backgroundColor: "#B81C1C",
            fontWeight: 600,
          }}
        >
          Ver Detalles
        </motion.button>
      </div>
    </motion.div>
  );
}



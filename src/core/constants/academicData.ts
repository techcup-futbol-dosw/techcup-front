// Valores deben coincidir con el enum SchoolRelation de techchup-users
export const RELATIONS = [
  { value: "STUDENT",        label: "Estudiante" },
  { value: "PROFESSOR",      label: "Profesor" },
  { value: "ADMINISTRATIVE", label: "Personal administrativo" },
  { value: "GRADUATE",       label: "Graduado" },
  { value: "FAMILY",         label: "Familiar" },
] as const;

export const PROGRAMS = [
  { value: "SISTEMAS",                label: "Ingeniería de Sistemas" },
  { value: "INTELIGENCIA_ARTIFICIAL", label: "Ingeniería de Inteligencia Artificial" },
  { value: "CIBERSEGURIDAD",          label: "Ingeniería de Ciberseguridad" },
  { value: "ESTADISTICA",             label: "Ingeniería Estadística" },
  { value: "BIOTECNOLOGIA",           label: "Ingeniería en Biotecnología" },
  { value: "CIVIL",                   label: "Ingeniería Civil" },
  { value: "AMBIENTAL",               label: "Ingeniería Ambiental" },
  { value: "ELECTRICA",               label: "Ingeniería Eléctrica" },
  { value: "INDUSTRIAL",              label: "Ingeniería Industrial" },
  { value: "ELECTRONICA",             label: "Ingeniería Electrónica" },
  { value: "MECANICA",                label: "Ingeniería Mecánica" },
  { value: "BIOMEDICA",               label: "Ingeniería Biomédica" },
  { value: "ECONOMIA",                label: "Economía" },
  { value: "ADMINISTRACION_EMPRESAS", label: "Administración de Empresas" },
  { value: "MATEMATICAS",             label: "Matemáticas" },
] as const;

export type RelationValue = typeof RELATIONS[number]["value"];
export type ProgramValue  = typeof PROGRAMS[number]["value"];

// Lista ordenada de pasos del tutorial guiado (ver data/TourContext.js). Cada
// `id` es el mismo que reclama un <TourAnchor id="..."> en la pantalla real —
// agregar un paso acá sin su TourAnchor correspondiente simplemente deja el
// tour trabado en ese id para siempre (nunca se muestra ni se puede avanzar).
//
// Los textos son un punto de partida, pensados para editarse con el tiempo
// sin tocar nada de la lógica del tour.
export const PASOS_TOUR = [
  {
    id: "home.fab",
    titulo: "Empezá por acá",
    texto: "Con este botón cargás un cliente nuevo o un trabajo nuevo.",
  },
  {
    id: "opcionesNuevo.clienteNuevo",
    titulo: "Cliente nuevo",
    texto: "Cargá un cliente nuevo, o si ya lo tenés, sumale un vehículo más.",
  },
  {
    id: "opcionesNuevo.trabajoNuevo",
    titulo: "Trabajo nuevo",
    texto: "Así cargás un trabajo nuevo para un cliente que ya existe.",
  },
  {
    id: "home.historial",
    titulo: "Historial de clientes",
    texto: "Acá vas a encontrar cada cliente con sus vehículos y el historial de trabajos que le hiciste.",
  },
  {
    id: "trabajoNuevo.inspeccionVisual",
    titulo: "Daños previos",
    texto: "Marcá los daños que el auto ya tenía antes de entrar, para que quede claro qué no es responsabilidad tuya.",
  },
  {
    id: "trabajoNuevo.firma",
    titulo: "Firma de conformidad",
    texto: "El cliente firma acá aceptando el estado del auto al entrar — queda guardado en el trabajo.",
  },
  {
    id: "agenda.info",
    titulo: "Agenda",
    texto: "Todos tus turnos ordenados por fecha, para planificar la semana.",
  },
  {
    id: "trabajoDetalle.cobrar",
    titulo: "Cobrar",
    texto: "Cuando el trabajo está listo, registrás el cobro desde acá.",
  },
  {
    id: "finanzas.info",
    titulo: "Finanzas",
    texto: "Cada cobro que registrás se refleja acá — así vas viendo cómo va el mes.",
    ultimo: true,
  },
];

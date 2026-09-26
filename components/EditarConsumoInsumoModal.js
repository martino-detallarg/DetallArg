import { useEffect, useState } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import Button from "./Button";
import ConfiguracionConsumoInsumo, { calcularMlPorUso } from "./insumos/ConfiguracionConsumoInsumo";
import { useData } from "../data/DataContext";
import { colors, continuousCorner, fonts, radii, shadow } from "../theme";

// Modal chico (bottom sheet) para completar o corregir la configuración de
// consumo (seDiluye/dilucionX/envaseAplicadorMl/mlPorUso, ver
// components/insumos/ConfiguracionConsumoInsumo.js) de un insumo YA
// cargado en Mis Insumos -- se abre desde MoverCategoriaModal.js ("Editar
// consumo"). Reusa el mismo bloque de campos que AgregarInsumoModal.js en
// vez de duplicar el formulario, así el alta y la edición nunca pueden
// desalinearse.
export default function EditarConsumoInsumoModal({ visible, insumo, onClose }) {
  const { actualizarConfiguracionInsumo } = useData();
  const [seDiluye, setSeDiluye] = useState(false);
  const [dilucionX, setDilucionX] = useState("");
  const [envaseAplicadorMl, setEnvaseAplicadorMl] = useState("");
  const [mlPorAutoTexto, setMlPorAutoTexto] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  // Precarga con la configuración real ya guardada cada vez que se abre
  // para un insumo puntual -- mismo criterio de reset-al-abrir que
  // MoverCategoriaModal.js.
  useEffect(() => {
    if (!visible || !insumo) return;
    setSeDiluye(!!insumo.seDiluye);
    setDilucionX(insumo.dilucionX != null ? String(insumo.dilucionX) : "");
    setEnvaseAplicadorMl(insumo.envaseAplicadorMl != null ? String(insumo.envaseAplicadorMl) : "");
    setMlPorAutoTexto(!insumo.seDiluye && insumo.mlPorUso != null ? String(insumo.mlPorUso) : "");
    setError(null);
  }, [visible, insumo]);

  async function handleGuardar() {
    setGuardando(true);
    setError(null);
    try {
      await actualizarConfiguracionInsumo(insumo.id, {
        seDiluye,
        dilucionX: seDiluye ? Number(String(dilucionX).replace(",", ".")) || null : null,
        envaseAplicadorMl: seDiluye ? Number(String(envaseAplicadorMl).replace(",", ".")) || null : null,
        mlPorUso: calcularMlPorUso({ seDiluye, dilucionX, envaseAplicadorMl, mlPorAutoTexto }),
      });
      onClose();
    } catch (err) {
      setError("No se pudo guardar. Probá de nuevo.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.fondo}>
        <View style={styles.contenedor}>
          <Text style={styles.titulo}>Consumo por uso</Text>
          {insumo && (
            <Text style={styles.subtitulo} numberOfLines={1}>
              {insumo.nombre}
            </Text>
          )}

          <ConfiguracionConsumoInsumo
            seDiluye={seDiluye}
            onCambiarSeDiluye={setSeDiluye}
            dilucionX={dilucionX}
            onCambiarDilucionX={setDilucionX}
            envaseAplicadorMl={envaseAplicadorMl}
            onCambiarEnvaseAplicadorMl={setEnvaseAplicadorMl}
            mlPorAutoTexto={mlPorAutoTexto}
            onCambiarMlPorAutoTexto={setMlPorAutoTexto}
            bloqueada={guardando}
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <Button title="Guardar" onPress={handleGuardar} loading={guardando} disabled={guardando} />
          <Button title="Cancelar" variant="secondary" onPress={onClose} disabled={guardando} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: "rgba(4, 3, 3, 0.7)",
    justifyContent: "flex-end",
  },
  contenedor: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 20,
    gap: 12,
    ...shadow,
    shadowOffset: { width: 0, height: -4 },
  },
  titulo: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.textPrimary,
  },
  subtitulo: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  error: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.error,
    textAlign: "center",
  },
});

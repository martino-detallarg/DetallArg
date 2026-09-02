import { forwardRef, useState } from "react";
import { Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, continuousCorner, fonts, radii, shadowSubtle } from "../theme";

const Input = forwardRef(function Input(
  {
    label,
    value,
    onChangeText,
    placeholder,
    error,
    secureTextEntry,
    keyboardType,
    autoCapitalize = "sentences",
    multiline = false,
    numberOfLines,
    sufijo,
    returnKeyType,
    onSubmitEditing,
    ...rest
  },
  ref
) {
  const [mostrarTexto, setMostrarTexto] = useState(false);
  const esPassword = !!secureTextEntry;

  // Un teclado numérico no tiene tecla "Enter" que cierre nada — sin esto,
  // la única forma de cerrarlo es tocar afuera. Si el caller no pasó su
  // propio returnKeyType/onSubmitEditing (por ejemplo para encadenar al
  // siguiente campo de un formulario), se le pone un botón "Listo" que
  // cierra el teclado por default.
  const esNumerico = keyboardType === "numeric";
  const returnKeyTypeFinal = returnKeyType ?? (esNumerico ? "done" : undefined);
  const onSubmitEditingFinal = onSubmitEditing ?? (esNumerico ? () => Keyboard.dismiss() : undefined);

  return (
    <View style={styles.contenedor}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.inputWrapper,
          multiline ? styles.inputWrapperMultiline : null,
          error ? styles.inputWrapperError : null,
        ]}
      >
        <TextInput
          ref={ref}
          style={[styles.input, multiline ? styles.inputMultiline : null]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={esPassword && !mostrarTexto}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? "top" : "center"}
          returnKeyType={returnKeyTypeFinal}
          onSubmitEditing={onSubmitEditingFinal}
          {...rest}
        />
        {sufijo ? <Text style={styles.sufijo}>{sufijo}</Text> : null}
        {esPassword ? (
          <TouchableOpacity
            onPress={() => setMostrarTexto((actual) => !actual)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={mostrarTexto ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
});

export default Input;

const styles = StyleSheet.create({
  contenedor: {
    marginBottom: 16,
  },
  label: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface2,
    borderRadius: radii.button,
    ...continuousCorner,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: 14,
    height: 50,
    ...shadowSubtle,
  },
  inputWrapperError: {
    borderColor: colors.error,
  },
  inputWrapperMultiline: {
    height: undefined,
    minHeight: 90,
    alignItems: "flex-start",
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textPrimary,
    height: "100%",
  },
  inputMultiline: {
    height: undefined,
  },
  error: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.error,
    marginTop: 6,
  },
  sufijo: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
    marginLeft: 6,
  },
});

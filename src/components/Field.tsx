import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, fonts, radius, space } from '@/theme/tokens';

type Props = TextInputProps & { label: string; error?: string | null };

/** Labelled text input in the Sticker Bomb style. */
export function Field({ label, error, style, ...rest }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.dim}
        accessibilityLabel={label}
        style={[styles.input, error ? styles.inputError : null, style]}
        {...rest}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { color: colors.muted, fontFamily: fonts.display, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase' },
  input: {
    height: 54,
    borderWidth: 2,
    borderColor: colors.line,
    borderRadius: radius.row,
    backgroundColor: colors.surface,
    color: colors.text,
    paddingHorizontal: space.lg,
    fontFamily: fonts.body,
    fontSize: 16,
  },
  inputError: { borderColor: colors.yellow },
  error: { color: colors.yellow, fontFamily: fonts.body, fontSize: 13 },
});

import { useState } from "react";
import { Pressable, Text, TextInput, View, type TextInputProps } from "react-native";
import { Icon, type IconName } from "./icon";
import { useThemeColors } from "@/theme";

interface TextFieldProps extends TextInputProps {
  label?: string;
  icon?: IconName;
  /** Renders a show/hide eye toggle and starts obscured. */
  secure?: boolean;
  error?: string;
}

/** Labeled, theme-aware input with optional leading icon and password toggle. */
export function TextField({ label, icon, secure, error, ...rest }: TextFieldProps) {
  const theme = useThemeColors();
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(!!secure);

  const borderClass = error ? "border-featured" : focused ? "border-primary" : "border-line";

  return (
    <View className="gap-1.5">
      {label && <Text className="font-sans-medium text-sm text-body">{label}</Text>}
      <View
        className={`flex-row items-center gap-2.5 rounded-2xl border bg-card px-4 ${borderClass}`}
        style={{ height: 52 }}
      >
        {icon && <Icon name={icon} size={18} color={focused ? theme.primary : theme.faint} />}
        <TextInput
          className="flex-1 font-sans text-base text-ink"
          placeholderTextColor={theme.faint}
          secureTextEntry={hidden}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />
        {secure && (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={10}>
            <Icon name={hidden ? "eye-outline" : "eye-off-outline"} size={18} color={theme.faint} />
          </Pressable>
        )}
      </View>
      {error && <Text className="font-sans text-xs text-featured">{error}</Text>}
    </View>
  );
}

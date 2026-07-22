import { useState } from "react";
import { Pressable, Text, TextInput, View, type TextInputProps } from "react-native";
import { Icon, type IconName } from "./icon";
import { colors } from "@/theme";

interface TextFieldProps extends TextInputProps {
  label?: string;
  icon?: IconName;
  /** Renders a show/hide eye toggle and starts obscured. */
  secure?: boolean;
}

/** Labeled input with optional leading icon and password reveal toggle. */
export function TextField({ label, icon, secure, ...rest }: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(!!secure);

  return (
    <View className="gap-1.5">
      {label && <Text className="font-sans-medium text-sm text-neutral-700">{label}</Text>}
      <View
        className={`flex-row items-center gap-2.5 rounded-2xl border bg-white px-4 ${
          focused ? "border-primary" : "border-neutral-200"
        }`}
        style={{ height: 52 }}
      >
        {icon && <Icon name={icon} size={18} color={focused ? colors.primary : colors.faint} />}
        <TextInput
          className="flex-1 font-sans text-base text-neutral-900"
          placeholderTextColor={colors.faint}
          secureTextEntry={hidden}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />
        {secure && (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={10}>
            <Icon name={hidden ? "eye-outline" : "eye-off-outline"} size={18} color={colors.faint} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

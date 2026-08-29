import { useState } from "react";
import { Text, TextInput, View } from "react-native";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { StarInput } from "@/components/ui/rating";
import { useThemeColors } from "@/theme";

interface WriteReviewSheetProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  submitting?: boolean;
}

/** Rating + comment sheet for leaving a review on a listing or store. */
export function WriteReviewSheet({ visible, onClose, onSubmit, submitting }: WriteReviewSheetProps) {
  const theme = useThemeColors();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  function submit() {
    if (rating === 0) return;
    onSubmit(rating, comment.trim());
    setRating(0);
    setComment("");
  }

  return (
    <Sheet visible={visible} onClose={onClose} title="Escribir reseña">
      <View className="gap-4 px-5 pb-4">
        <View className="items-center gap-2 py-2">
          <Text className="font-sans-medium text-sm text-subtle">Tu valoración</Text>
          <StarInput value={rating} onChange={setRating} />
        </View>
        <View className="rounded-2xl border border-line bg-card px-4 py-3">
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Cuenta tu experiencia (opcional)"
            placeholderTextColor={theme.faint}
            multiline
            numberOfLines={4}
            style={{ minHeight: 80, textAlignVertical: "top" }}
            className="font-sans text-base text-ink"
          />
        </View>
        <Button label="Publicar reseña" onPress={submit} loading={submitting} disabled={rating === 0} />
      </View>
    </Sheet>
  );
}

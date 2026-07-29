import * as ImageManipulator from "expo-image-manipulator";

/**
 * Downscale + JPEG-compress a picked photo before upload (bandwidth matters on
 * mobile networks in EG). Uses the legacy manipulateAsync API and falls back to
 * the original URI if anything goes wrong, so a manipulator hiccup never blocks
 * publishing.
 */
export async function compressImage(uri: string, maxWidth = 1280): Promise<string> {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: maxWidth } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG },
    );
    return result.uri;
  } catch {
    return uri;
  }
}

export async function compressAll(uris: string[]): Promise<string[]> {
  return Promise.all(uris.map((u) => compressImage(u)));
}

import { getSupabaseClient } from "./supabase/client";

/**
 * Uploads a local image (file:// URI from expo-image-picker, already
 * compressed) to Supabase Storage under {userId}/ — the same owner-scoped
 * path the web app writes to, so Storage RLS accepts it. Returns the public
 * URL, which is what the listings/tiendas rows store.
 */
export async function uploadImage(
  userId: string,
  uri: string,
  bucket: "listing-images" | "avatars" = "listing-images",
): Promise<string> {
  const supabase = getSupabaseClient();

  const extMatch = /\.(\w+)(?:\?|$)/.exec(uri);
  const ext = (extMatch?.[1] ?? "jpg").toLowerCase();
  const contentType = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
  const path = `${userId}/${name}`;

  const arraybuffer = await fetch(uri).then((res) => res.arrayBuffer());

  const { error } = await supabase.storage.from(bucket).upload(path, arraybuffer, {
    contentType,
    upsert: false,
  });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/** Upload several images sequentially, returning their public URLs in order. */
export async function uploadImages(
  userId: string,
  uris: string[],
  bucket: "listing-images" | "avatars" = "listing-images",
): Promise<string[]> {
  const urls: string[] = [];
  for (const uri of uris) {
    // Already-uploaded (http) URLs pass through unchanged (edit flow).
    if (/^https?:\/\//.test(uri)) urls.push(uri);
    else urls.push(await uploadImage(userId, uri, bucket));
  }
  return urls;
}

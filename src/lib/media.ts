import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const BUCKET = "pro-media";

export const isStoragePath = (src?: string | null) => !!src && !/^https?:\/\//.test(src);

export async function uploadProMedia(file: File, userId: string) {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw error;
  return path;
}

export async function removeProMedia(path?: string | null) {
  if (!isStoragePath(path)) return;
  await supabase.storage.from(BUCKET).remove([path!]);
}

/** Resolves a stored value: plain https URLs pass through, storage paths get a signed URL. */
export function useMediaUrl(src?: string | null) {
  const needsSigning = isStoragePath(src);
  const { data } = useQuery({
    queryKey: ["signed-media", src],
    enabled: needsSigning,
    staleTime: 1000 * 60 * 30,
    queryFn: async () => {
      const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(src!, 60 * 60);
      if (error) throw error;
      return data.signedUrl;
    },
  });
  if (!src) return "";
  return needsSigning ? (data ?? "") : src;
}

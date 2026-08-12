import { useMediaUrl } from "@/lib/media";

type Props = {
  src?: string | null;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: "lazy" | "eager";
};

export function Media({ src, alt, className, width = 1024, height = 1024, loading = "lazy" }: Props) {
  const url = useMediaUrl(src);
  if (!url) return <div className={`bg-muted ${className ?? ""}`} aria-hidden />;
  return <img src={url} alt={alt} className={className} width={width} height={height} loading={loading} />;
}

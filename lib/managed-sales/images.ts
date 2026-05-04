export type NormalizedImageArrays = {
  images: string[];
  images_thumbnails: string[];
  images_small: string[];
  images_medium: string[];
};

export function normalizeImagesToNewFormat(images: unknown): NormalizedImageArrays {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return {
      images: [],
      images_thumbnails: [],
      images_small: [],
      images_medium: [],
    };
  }

  const result: NormalizedImageArrays = {
    images: [],
    images_thumbnails: [],
    images_small: [],
    images_medium: [],
  };

  for (const img of images) {
    if (typeof img === "string") {
      result.images.push(img);
      result.images_thumbnails.push(img);
      result.images_small.push(img);
      result.images_medium.push(img);
    } else if (typeof img === "object" && img !== null) {
      const o = img as Record<string, string | undefined>;
      result.images.push(o.large ?? o.original ?? o.medium ?? "");
      result.images_thumbnails.push(o.thumbnail ?? o.small ?? o.large ?? "");
      result.images_small.push(o.small ?? o.medium ?? o.large ?? "");
      result.images_medium.push(o.medium ?? o.large ?? "");
    }
  }

  return result;
}

/** Add responsive automatic format and quality transforms to Cloudinary images. */
export function optimizedImageUrl(url: string, width = 900): string {
  try {
    const imageUrl = new URL(url, window.location.origin);
    if (!imageUrl.hostname.endsWith("cloudinary.com") || !imageUrl.pathname.includes("/image/upload/")) {
      return url;
    }

    const [prefix, remainder] = imageUrl.pathname.split("/image/upload/");
    const transformations = [`w_${width}`, "c_limit"];
    if (!remainder.includes("f_auto")) transformations.unshift("f_auto");
    if (!remainder.includes("q_auto")) transformations.unshift("q_auto");
    imageUrl.pathname = `${prefix}/image/upload/${transformations.join(",")}/${remainder}`;
    return imageUrl.toString();
  } catch {
    return url;
  }
}

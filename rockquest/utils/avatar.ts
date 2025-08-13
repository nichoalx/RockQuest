import pfp1 from "@/assets/images/pfp1.png";
import pfp2 from "@/assets/images/pfp2.png";

export const avatarImages: Record<number, any> = {
  1: pfp1,
  2: pfp2,
};

export const avatarFromId = (id?: number | null) => {
  if (id && avatarImages[id]) return avatarImages[id];
  return pfp1; // fallback
};

import path from "node:path";
import { fileURLToPath } from "node:url";

const configDirectory = path.dirname(fileURLToPath(import.meta.url));
const localProfileImageDirectory = path.resolve(configDirectory, "../uploads/profile-images");

export const profileImageDirectory = path.resolve(
  process.env.PROFILE_IMAGE_DIR || localProfileImageDirectory
);

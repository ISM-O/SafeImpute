// On importe la fonction IA écrite par Mouctar
import { getFaceDescriptor as extractDescriptor } from "../faceDetection";

export async function getFaceDescriptor(imageDataUrl) {
  // 1. react-webcam renvoie une chaîne de caractères (Base64).
  // face-api.js a besoin d'un véritable "élément HTML Image" pour l'analyser.
  const img = new Image();
  img.src = imageDataUrl;

  // 2. On attend que l'image soit bien chargée en mémoire par le navigateur
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
  });

  // 3. On passe cette image à la fonction de Mouctar
  try {
    const descriptor = await extractDescriptor(img);
    return descriptor;
  } catch (error) {
    console.error("Erreur lors de l'analyse du visage avec face-api :", error);
    return null;
  }
}

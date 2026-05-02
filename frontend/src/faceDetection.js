/*import * as faceapi from "face-api.js";

const MODEL_URL = "/models";

// Charger les modèles au démarrage
export const loadModels = async () => {
  await Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ]);

  console.log("✅ Modèles chargés");
};

// Détection + descripteur facial
export const getFaceDescriptor = async (videoElement) => {
  const detection = await faceapi
    .detectSingleFace(videoElement, new faceapi.SsdMobilenetv1Options())
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) return null;

  return detection.descriptor; // vecteur de 128 nombres
};
import * as faceapi from 'face-api.js';

const MODEL_URL = '/models';

// Fonction 1 : Charger les modèles (à appeler au démarrage)
export const loadModels = async () => {
  try {
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    ]);
    console.log("Modèles chargés avec succès !");
  } catch (error) {
    console.error("Erreur de chargement des modèles:", error);
  }
};

// Fonction 2 : Ton code d'analyse (le "pont")
export const getFaceDescriptor = async (input) => {
  const detection = await faceapi
    .detectSingleFace(input)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) {
    return null;
  }

  return detection.descriptor; // Retourne les 128 nombres
};*/
import * as faceapi from 'face-api.js';

// Le dossier public/models contient tes fichiers JSON et SHARD
const MODEL_URL = '/models';

/**
 * Étape 1 : Initialisation IA
 * Télécharge les modèles de détection, de points de repère et de reconnaissance.
 */
export const loadModels = async () => {
  try {
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    ]);
    console.log("✅ Modèles chargés avec succès !");
  } catch (error) {
    console.error("❌ Erreur de chargement des modèles :", error);
  }
};

/**
 * Étape 2 : Extraction des données (La fonction principale)
 * Prend une source (Webcam ou Image) et retourne le descripteur facial.
 */
export const getFaceDescriptor = async (input) => {
  if (!input) return null;

  // Analyse complète : Détection + Points de repère + Vecteur 128
  const detection = await faceapi
    .detectSingleFace(input)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) {
    console.warn("⚠️ Aucun visage détecté.");
    return null;
  }

  // Retourne le vecteur mathématique de 128 nombres
  return detection.descriptor;
};
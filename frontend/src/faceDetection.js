import * as faceapi from 'face-api.js';

const MODEL_URL = '/models';

export const loadModels = async () => {
  try {
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    console.log('✅ Modèles chargés avec succès !');
  } catch (error) {
    console.error('❌ Erreur de chargement des modèles :', error);
    throw error;
  }
};

export const getFaceDescriptor = async (input) => {
  if (!input) return null;

  const options = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 });

  const detection = await faceapi
    .detectSingleFace(input, options)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) {
    console.warn('⚠️ Aucun visage détecté.');
    return null;
  }

  return detection.descriptor;
};
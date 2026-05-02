import * as faceapi from "@vladmandic/face-api";

const MODEL_URL = "/models";

export const loadModels = async () => {
  try {
    await faceapi.tf.setBackend("webgl");
    await faceapi.tf.ready();
    console.log(
      "⚙️ Moteur TensorFlow initialisé avec le backend:",
      faceapi.tf.getBackend(),
    );

    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    console.log("✅ Modèles chargés avec succès !");
  } catch (error) {
    console.error("❌ Erreur de chargement des modèles :", error);
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
    console.warn("⚠️ Aucun visage détecté.");
    return null;
  }

  console.log("✅ Visage détecté !");
  console.log("📊 Type du descripteur:", detection.descriptor.constructor.name);
  console.log("📏 Taille du descripteur:", detection.descriptor.length);

  // Convertir en array JavaScript
  const descriptorArray = Array.from(detection.descriptor);
  console.log(
    "📦 Descripteur converti en array:",
    descriptorArray.length,
    "dimensions",
  );

  return descriptorArray;
};

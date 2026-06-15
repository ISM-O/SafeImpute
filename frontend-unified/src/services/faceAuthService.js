import authService from "./authService";

// Load face-api models
const faceModelsURL = "/models/";

export const loadFaceApiModels = async () => {
  try {
    // Import face-api dynamically
    const faceapi = await import("@vladmandic/face-api");

    // Load models
    await faceapi.nets.tinyFaceDetector.load(faceModelsURL);
    await faceapi.nets.faceLandmark68Net.load(faceModelsURL);
    await faceapi.nets.faceRecognitionNet.load(faceModelsURL);

    console.log("✅ Face API models loaded successfully");
    return faceapi;
  } catch (error) {
    console.error("❌ Failed to load Face API models:", error);
    throw error;
  }
};

// Extract face descriptor from video/image
export const extractFaceDescriptor = async (videoRef) => {
  try {
    const faceapi = await import("@vladmandic/face-api");

    // 1. Vérifier si la webcam et l'élément vidéo natif sont bien disponibles
    if (!videoRef?.current || !videoRef.current.video) {
      throw new Error("La caméra n'est pas encore prête.");
    }

    const videoElement = videoRef.current.video;

    // 2. S'assurer que le flux vidéo est complètement chargé (readyState === 4)
    if (videoElement.readyState !== 4) {
      throw new Error(
        "Le flux vidéo charge encore. Veuillez réessayer dans une seconde.",
      );
    }

    // 3. Passer l'élément vidéo HTML natif (videoElement) et non le composant React
    const detections = await faceapi
      .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detections) {
      throw new Error(
        "Aucun visage détecté. Veuillez bien vous centrer dans le cercle.",
      );
    }

    return detections.descriptor;
  } catch (error) {
    console.error("Error extracting face descriptor:", error);
    throw error;
  }
};

// Login with Face ID
export const faceLogin = async (email, videoRef) => {
  try {
    const faceDescriptor = await extractFaceDescriptor(videoRef);

    // Convert descriptor to array
    const descriptorArray = Array.from(faceDescriptor);

    // Call auth service
    const response = await authService.loginWithFace(email, descriptorArray);
    return response;
  } catch (error) {
    console.error("Face login failed:", error);
    throw error;
  }
};

// Enroll Face ID during registration
export const enrollFaceId = async (videoRef) => {
  try {
    const faceDescriptor = await extractFaceDescriptor(videoRef);

    // Convert descriptor to array
    return Array.from(faceDescriptor);
  } catch (error) {
    console.error("Face enrollment failed:", error);
    throw error;
  }
};

export default {
  loadFaceApiModels,
  extractFaceDescriptor,
  faceLogin,
  enrollFaceId,
};

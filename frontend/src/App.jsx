import { useEffect, useRef, useState } from 'react';
import { loadModels, getFaceDescriptor } from './faceDetection';

function App() {
  const videoRef = useRef(null);
  const [status, setStatus] = useState('Démarrage de l’application...');
  const [error, setError] = useState(null);

  useEffect(() => {
    let intervalId = null;

    const init = async () => {
      try {
        setStatus('Chargement des modèles...');
        await loadModels();
        setStatus('Modèles chargés. Activation de la webcam...');

        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        setStatus('Webcam active. Analyse faciale en cours...');

        intervalId = window.setInterval(async () => {
          if (!videoRef.current || videoRef.current.readyState < 2) {
            return;
          }

          try {
            const descriptor = await getFaceDescriptor(videoRef.current);
            if (descriptor) {
              console.log('🧬 Descripteur facial (128 nombres) :', descriptor);
              setStatus('Visage détecté. Consulte la console.');
            } else {
              setStatus('Aucun visage détecté pour le moment.');
            }
          } catch (detectError) {
            console.error('Erreur de détection faciale :', detectError);
            setStatus('Erreur de détection faciale');
          }
        }, 1000);
      } catch (initError) {
        const message = initError instanceof Error ? initError.message : String(initError);
        console.error('Erreur d’initialisation :', initError);
        setError(`Erreur d’initialisation : ${message}`);
        setStatus('Impossible de démarrer l’application.');
      }
    };

    init();

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      if (videoRef.current?.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div style={{ textAlign: 'center', margin: '40px 20px' }}>
      <h1>Détection faciale React</h1>
      <p>{status}</p>
      {error && (
        <p style={{ color: '#c0392b', fontWeight: 'bold' }}>{error}</p>
      )}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{
          width: '100%',
          maxWidth: '720px',
          borderRadius: '14px',
          border: '2px solid #2ecc71',
          marginTop: '20px',
        }}
      />
      <p style={{ marginTop: '20px', color: '#555' }}>
        Ouvre la console de développement pour voir le vecteur facial.
      </p>
    </div>
  );
}

export default App;

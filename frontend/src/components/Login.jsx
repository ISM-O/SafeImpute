import { useCallback, useEffect, useRef, useState } from 'react'
import Webcam from 'react-webcam'
import { getFaceDescriptor } from '../services/face'
import { loginUser } from '../services/api'

export function Login({ onSuccess }) {
  const webcamRef = useRef(null)
  const [email, setEmail] = useState('')
  const [capturedImage, setCapturedImage] = useState(null)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [devices, setDevices] = useState([])
  const [selectedDeviceId, setSelectedDeviceId] = useState('')

  useEffect(() => {
    async function loadCameras() {
      if (!navigator.mediaDevices?.enumerateDevices) return
      try {
        const cameras = (await navigator.mediaDevices.enumerateDevices()).filter(
          (device) => device.kind === 'videoinput',
        )
        setDevices(cameras)
        if (cameras.length > 0) {
          setSelectedDeviceId((current) => current || cameras[0].deviceId)
        }
      } catch (err) {
        console.warn('Impossible de lister les caméras', err)
      }
    }
    loadCameras()
  }, [])

  const videoConstraints = {
    width: 360,
    height: 270,
    ...(selectedDeviceId
      ? { deviceId: { exact: selectedDeviceId } }
      : { facingMode: 'user' }),
  }

  const capturePhoto = useCallback(() => {
    const screenshot = webcamRef.current?.getScreenshot()
    if (!screenshot) {
      setError('Impossible de capturer la vidéo. Autorise la caméra et réessaie.')
      return
    }

    setCapturedImage(screenshot)
    setStatus('Photo capturée, prête pour la connexion.')
    setError('')
  }, [])

  const handleLogin = async (event) => {
    event.preventDefault()
    setError('')
    setStatus('')

    if (!email.trim()) {
      setError('L’email est requis.')
      return
    }

    if (!capturedImage) {
      setError('Capture d’abord une photo avec la caméra.')
      return
    }

    setLoading(true)
    try {
      const descriptor = await getFaceDescriptor(capturedImage)
      const result = await loginUser({ email, image: capturedImage, descriptor })
      setStatus('Connexion envoyée avec succès !')
      setError('')
      if (onSuccess) {
        onSuccess({
          fullName: result?.fullName || '',
          email,
        })
      }
    } catch (err) {
      setError(err.message || 'Une erreur est survenue lors de la connexion.')
      setStatus('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-panel">
        <h2>Connexion</h2>
        <p>Renseigne ton email et capture ton visage pour te connecter.</p>

        <form onSubmit={handleLogin}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="exemple@gmail.com"
              required
            />
          </label>

          {devices.length > 0 && (
            <label>
              Caméra
              <select
                value={selectedDeviceId}
                onChange={(event) => setSelectedDeviceId(event.target.value)}
              >
                {devices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Caméra ${device.deviceId}`}
                  </option>
                ))}
              </select>
            </label>
          )}

          <div className="video-actions">
            <button type="submit" disabled={loading}>
              {loading ? 'Envoi en cours...' : 'Se connecter'}
            </button>
          </div>
        </form>

        <div className="status-box">
          {status && <p className="success">{status}</p>}
          {error && <p className="error">{error}</p>}
        </div>
      </div>

      <div className="auth-preview">
        <h2>Retour vidéo</h2>
        <div className="video-preview">
          <Webcam
            mirrored
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            className="webcam"
          />
        </div>

        {capturedImage && (
          <div className="image-preview" style={{ marginTop: '16px' }}>
            <img src={capturedImage} alt="Photo capturée" />
          </div>
        )}
      </div>
    </section>
  )
}

import { useState, useEffect, useRef } from 'react';
import { Camera, X, Flashlight, FlashlightOff, RotateCw, QrCode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import jsQR from 'jsqr';
import api from '../services/api';
import Toast from '../components/Toast';
import { useTranslation } from 'react-i18next';

function QRScanner() {
  const { t } = useTranslation();
  const [scanning, setScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [facingMode, setFacingMode] = useState('environment');
  const [toast, setToast] = useState(null);
  const [scannedData, setScannedData] = useState(null);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkCameraAvailability();
    return () => {
      stopCamera();
    };
  }, []);

  const checkCameraAvailability = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      setHasCamera(cameras.length > 0);
    } catch (error) {
      console.error('Error checking camera:', error);
      setHasCamera(false);
    }
  };

  const startCamera = async () => {
    try {
      setError(null);
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
      }

      setScanning(true);
      startQRDetection();
    } catch (error) {
      console.error('Error starting camera:', error);
      setError('Failed to access camera. Please check permissions.');
      setToast({ message: 'Failed to access camera', type: 'error' });
    }
  };

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setScanning(false);
    setFlashOn(false);
  };

  const toggleFlash = async () => {
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      const capabilities = track.getCapabilities();
      
      if (capabilities.torch) {
        try {
          await track.applyConstraints({
            advanced: [{ torch: !flashOn }]
          });
          setFlashOn(!flashOn);
        } catch (error) {
          setToast({ message: 'Flash not supported', type: 'error' });
        }
      } else {
        setToast({ message: 'Flash not available on this device', type: 'error' });
      }
    }
  };

  const switchCamera = () => {
    stopCamera();
    setFacingMode(facingMode === 'environment' ? 'user' : 'environment');
    setTimeout(() => startCamera(), 100);
  };

  const startQRDetection = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas) return;

    const canvasContext = canvas.getContext('2d', { willReadFrequently: true });

    const detectQR = () => {
      if (!scanning || !video || video.readyState !== video.HAVE_ENOUGH_DATA) {
        animationFrameRef.current = requestAnimationFrame(detectQR);
        return;
      }

      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      canvasContext.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = canvasContext.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code) {
        handleQRDetected(code.data);
      } else {
        animationFrameRef.current = requestAnimationFrame(detectQR);
      }
    };

    detectQR();
  };

  useEffect(() => {
    if (scanning && videoRef.current) {
      startQRDetection();
    }
  }, [scanning]);

  const handleQRDetected = async (data) => {
    stopCamera();
    setScannedData(data);

    // Parse QR code data
    try {
      // Expected format: "EQUIPMENT:123" or "ORDER:456" or just "123" (equipment ID)
      let type, id;
      
      if (data.includes(':')) {
        [type, id] = data.split(':');
      } else {
        // Assume it's an equipment ID if no type specified
        type = 'EQUIPMENT';
        id = data;
      }
      
      if (type === 'EQUIPMENT' || type === 'equipment') {
        try {
          const response = await api.get(`/equipment/${id}`);
          setToast({ message: `Equipment found: ${response.data.name}`, type: 'success' });
          setTimeout(() => navigate(`/equipment/${id}`), 1500);
        } catch (error) {
          setToast({ message: `Equipment ID ${id} not found`, type: 'error' });
        }
      } else if (type === 'ORDER' || type === 'order') {
        try {
          const response = await api.get(`/orders/${id}`);
          setToast({ message: `Order found: ${response.data.orderNumber}`, type: 'success' });
          setTimeout(() => navigate(`/orders`), 1500);
        } catch (error) {
          setToast({ message: `Order ID ${id} not found`, type: 'error' });
        }
      } else {
        setToast({ message: `Scanned: ${data}`, type: 'info' });
      }
    } catch (error) {
      console.error('Error processing QR code:', error);
      setToast({ message: 'Failed to process QR code', type: 'error' });
    }
  };

  const handleManualInput = async (e) => {
    e.preventDefault();
    const input = e.target.elements.qrCode.value;
    if (input) {
      handleQRDetected(input);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 dark:bg-slate-900">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="bg-gray-800 dark:bg-slate-800 text-white p-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <QrCode size={24} />
          QR Code Scanner
        </h1>
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-700 dark:hover:bg-slate-700 rounded min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Camera View */}
      <div className="relative">
        {scanning ? (
          <div className="relative">
            <video
              ref={videoRef}
              className="w-full h-[60vh] object-cover"
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Scanning Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 border-4 border-blue-500 rounded-lg relative">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white"></div>
              </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 px-4">
              <button
                onClick={toggleFlash}
                className="p-4 bg-gray-800 bg-opacity-75 dark:bg-slate-800 dark:bg-opacity-75 text-white rounded-full hover:bg-opacity-100 min-w-[56px] min-h-[56px] flex items-center justify-center"
                aria-label="Toggle flash"
              >
                {flashOn ? <FlashlightOff className="w-6 h-6" /> : <Flashlight className="w-6 h-6" />}
              </button>
              <button
                onClick={switchCamera}
                className="p-4 bg-gray-800 bg-opacity-75 dark:bg-slate-800 dark:bg-opacity-75 text-white rounded-full hover:bg-opacity-100 min-w-[56px] min-h-[56px] flex items-center justify-center"
                aria-label="Switch camera"
              >
                <RotateCw className="w-6 h-6" />
              </button>
              <button
                onClick={stopCamera}
                className="px-6 py-4 bg-red-600 text-white rounded-full hover:bg-red-700 min-h-[56px] flex items-center justify-center"
              >
                Stop
              </button>
            </div>
          </div>
        ) : (
          <div className="h-[60vh] flex items-center justify-center bg-gray-800 dark:bg-slate-800">
            <div className="text-center text-white">
              <Camera className="w-24 h-24 mx-auto mb-4 text-gray-600 dark:text-slate-500" />
              <p className="text-lg mb-4">Ready to scan QR codes</p>
              {error && (
                <p className="text-red-400 mb-4 text-sm">{error}</p>
              )}
              {hasCamera ? (
                <button
                  onClick={startCamera}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 min-h-[44px]"
                >
                  Start Camera
                </button>
              ) : (
                <p className="text-red-400">No camera detected</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Manual Input */}
      <div className="p-6 bg-white dark:bg-slate-800">
        <h2 className="text-lg font-semibold mb-4 dark:text-slate-200">Or Enter Code Manually</h2>
        <form onSubmit={handleManualInput} className="flex gap-2">
          <input
            type="text"
            name="qrCode"
            placeholder="Enter QR code (e.g., EQUIPMENT:123)"
            className="flex-1 border dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded px-4 py-3 min-h-[44px]"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 min-h-[44px]"
          >
            Submit
          </button>
        </form>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-semibold mb-2 dark:text-slate-200">How to use:</h3>
          <ul className="text-sm text-gray-700 dark:text-slate-300 space-y-1">
            <li>• Point camera at equipment QR code</li>
            <li>• Code will be detected automatically</li>
            <li>• You'll be redirected to equipment details</li>
            <li>• Use flashlight for dark environments</li>
            <li>• Switch between front/back camera</li>
          </ul>
        </div>

        {scannedData && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <h3 className="font-semibold text-green-900 dark:text-green-200">Last Scanned:</h3>
            <p className="text-sm text-green-800 dark:text-green-300 mt-1">{scannedData}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default QRScanner;

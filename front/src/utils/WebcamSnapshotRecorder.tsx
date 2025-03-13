import React, { useState, useEffect, useRef } from 'react';
import { FiCamera, FiPlay, FiStopCircle, FiX } from 'react-icons/fi';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// Constantes de configuration
const SNAPSHOT_INTERVAL = 500; // 📸 Capture toutes les 500ms
const MAX_DURATION = 15000; // ⏳ Stop après 15 secondes
const DEFAULT_API_URL = "http://10.74.0.54:8000/snapshots"; // URL par défaut de l'API

interface WebcamEmotionCaptureProps {
    onClose?: () => void;
    apiUrl?: string;
    onSuccess?: () => void;
    custom_user_id?: string;
    custom_post_id?: string;
    duration?: number;
    onCaptureSnapshots?: (snapshots: string[]) => void;
}

const WebcamEmotionCapture: React.FC<WebcamEmotionCaptureProps> = ({
    onClose,
    apiUrl = DEFAULT_API_URL,
    onSuccess,
    custom_user_id,
    custom_post_id,
    duration = MAX_DURATION,
    onCaptureSnapshots
}) => {
    // Références pour les éléments vidéo et canvas
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    // États du composant
    const [webcamError, setWebcamError] = useState<string | null>(null);
    const [webcamPermissionDenied, setWebcamPermissionDenied] = useState<boolean>(false);
    const [snapshots, setSnapshots] = useState<string[]>([]);
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [status, setStatus] = useState<string>('');
    const [timeRemaining, setTimeRemaining] = useState<number>(MAX_DURATION / 1000);
    const [uploadSuccess, setUploadSuccess] = useState<boolean | null>(null);
    const [debugLogs, setDebugLogs] = useState<string[]>([]);
    const [isVideoReady, setIsVideoReady] = useState<boolean>(false);

    // Références pour les intervalles et timers
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const countdownRef = useRef<NodeJS.Timeout | null>(null);

    // Fonction pour ajouter un log de debug
    const addLog = (message: string) => {
        console.log(message);
        setDebugLogs(prev => [...prev, `${new Date().toISOString().split('T')[1].split('.')[0]}: ${message}`]);
    };

    // Initialisation de la webcam
    const startCamera = async () => {
        setWebcamError(null);
        setWebcamPermissionDenied(false);
        setIsVideoReady(false);
        addLog("Démarrage de la caméra...");

        try {
            const constraints = {
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: "user"
                },
                audio: false
            };

            addLog("Demande d'accès à la caméra...");
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            addLog("Accès à la caméra obtenu ✅");

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                addLog("Stream assigné à l'élément vidéo");

                // Attendre que la vidéo soit chargée
                videoRef.current.onloadedmetadata = () => {
                    const videoWidth = videoRef.current?.videoWidth || 0;
                    const videoHeight = videoRef.current?.videoHeight || 0;

                    addLog(`Vidéo chargée: ${videoWidth}x${videoHeight}`);

                    if (videoWidth === 0 || videoHeight === 0) {
                        addLog("⚠️ Dimensions vidéo non valides");
                        return;
                    }

                    videoRef.current?.play()
                        .then(() => {
                            addLog("▶️ Lecture vidéo démarrée");
                            setIsVideoReady(true);

                            // Prendre une photo de test pour vérifier que tout fonctionne
                            setTimeout(() => {
                                takeTestPhoto(true); // true = silencieux (pas de log)
                            }, 1000);
                        })
                        .catch(e => addLog(`❌ Erreur lecture: ${e.message}`));
                };

                // Événement supplémentaire pour vérifier que la vidéo joue bien
                videoRef.current.onplaying = () => {
                    addLog("📹 Vidéo en cours de lecture");
                    setIsVideoReady(true);
                };

                // Gérer les erreurs potentielles sur l'élément vidéo
                videoRef.current.onerror = (e) => {
                    addLog(`❌ Erreur sur l'élément vidéo: ${e}`);
                };
            } else {
                addLog("❌ Référence vidéo non disponible");
            }
        } catch (err: any) {
            console.error("Erreur d'accès à la webcam:", err);
            setWebcamError(`Impossible d'accéder à votre webcam: ${err.message || err}`);
            addLog(`❌ Erreur webcam: ${err.message || err}`);

            if (err instanceof DOMException && (
                err.name === "NotAllowedError" ||
                err.name === "PermissionDeniedError"
            )) {
                setWebcamPermissionDenied(true);
                addLog("❌ Permission refusée pour la webcam");
            }
        }
    };

    // S'assurer que la caméra est démarrée au chargement du composant
    useEffect(() => {
        startCamera();
        return stopCamera; // Nettoyage à la destruction du composant
    }, []);

    // Arrêter la webcam et les enregistrements
    const stopCamera = () => {
        addLog("Arrêt de la caméra...");

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }

        if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
        }

        if (videoRef.current && videoRef.current.srcObject) {
            const currentStream = videoRef.current.srcObject as MediaStream;
            currentStream.getTracks().forEach(track => {
                track.stop();
            });
            videoRef.current.srcObject = null;
            addLog("Stream vidéo arrêté");
        }

        setIsVideoReady(false);
        setIsRecording(false);
    };

    // Capturer un snapshot
    const captureSnapshot = () => {
        if (!videoRef.current || !canvasRef.current) {
            addLog("❌ Impossible de capturer: références manquantes");
            return null;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context) {
            addLog("❌ Impossible d'obtenir le contexte 2D");
            return null;
        }

        try {
            // Vérifier que la vidéo est prête
            if (video.readyState !== video.HAVE_ENOUGH_DATA) {
                addLog(`❌ La vidéo n'est pas prête pour la capture (readyState=${video.readyState})`);
                return null;
            }

            // Vérifier les dimensions
            if (video.videoWidth === 0 || video.videoHeight === 0) {
                addLog(`❌ Dimensions vidéo invalides: ${video.videoWidth}x${video.videoHeight}`);
                return null;
            }

            // Configuration du canvas pour correspondre à la taille de la vidéo
            const width = video.videoWidth;
            const height = video.videoHeight;
            canvas.width = width;
            canvas.height = height;

            // Effacer le canvas avant de dessiner
            context.clearRect(0, 0, width, height);

            // Dessiner l'image
            context.drawImage(video, 0, 0, width, height);

            // Convertir en base64
            const imageData = canvas.toDataURL('image/jpeg', 0.85);

            if (imageData === 'data:,' || imageData === 'data:image/jpeg;base64,') {
                addLog("❌ Image vide capturée");
                return null;
            }

            return imageData;
        } catch (error: any) {
            addLog(`❌ Erreur capture: ${error.message || error}`);
            console.error('Erreur lors de la capture:', error);
            return null;
        }
    };

    // Prendre une photo test pour vérifier que tout fonctionne
    const takeTestPhoto = (silent = false) => {
        if (!videoRef.current || !canvasRef.current) {
            if (!silent) addLog("❌ Test photo impossible: références manquantes");
            return;
        }

        // Vérifier si la vidéo est chargée correctement
        const video = videoRef.current;
        if (video.readyState !== video.HAVE_ENOUGH_DATA) {
            if (!silent) addLog(`❌ La vidéo n'est pas prête pour le test photo (readyState=${video.readyState})`);
            return;
        }

        const imageData = captureSnapshot();
        if (imageData) {
            if (!silent) {
                addLog("📸 Test photo pris avec succès");
                setSnapshots([imageData]); // Afficher la photo de test
            }
            return true;
        }

        return false;
    };

    // Démarrer l'enregistrement
    const startRecording = () => {
        if (!isVideoReady) {
            addLog("❌ La vidéo n'est pas prête pour l'enregistrement");
            setStatus("La caméra n'est pas prête. Veuillez patienter...");
            return;
        }
    
        setSnapshots([]); // Réinitialiser les snapshots
        setIsRecording(true);
        setStatus('Enregistrement en cours...');
        setTimeRemaining(duration / 1000);
        setUploadSuccess(null);
    
        addLog("⏺️ Démarrage de l'enregistrement");
    
        // Faire un test de capture avant de commencer
        const testResult = captureSnapshot();
        if (!testResult) {
            addLog("❌ Le test de capture avant enregistrement a échoué");
            setStatus("Impossible de capturer des images. Vérifiez votre caméra.");
            setIsRecording(false);
            return;
        }
    
        addLog("✅ Test initial de capture réussi");
        
        // Stocker immédiatement le premier snapshot dans le state
        const initialSnapshots = [testResult];
        setSnapshots(initialSnapshots);
        
        // Référence pour suivre le compteur de snapshots à l'intérieur du setInterval
        const snapshotCountRef = useRef(1);
    
        // Configurer le compte à rebours
        countdownRef.current = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    if (countdownRef.current) clearInterval(countdownRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    
        // Configurer l'intervalle de prise de snapshots
        intervalRef.current = setInterval(() => {
            const newSnapshot = captureSnapshot();
            if (newSnapshot) {
                setSnapshots(prevSnapshots => {
                    const updatedSnapshots = [...prevSnapshots, newSnapshot];
                    snapshotCountRef.current = updatedSnapshots.length;
                    addLog(`📸 Snapshot #${snapshotCountRef.current} capturé`);
                    return updatedSnapshots;
                });
            }
        }, SNAPSHOT_INTERVAL);
    
        // Configurer l'arrêt automatique
        timerRef.current = setTimeout(() => {
            stopRecording();
        }, duration);
    
        setTimeRemaining(duration / 1000);
    };

    // Arrêter l'enregistrement
    const stopRecording = () => {
        addLog("⏹️ Arrêt de l'enregistrement");

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }

        if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
        }

        setIsRecording(false);
        setStatus('Traitement des images...');

        // Seulement envoyer si on a des snapshots
        if (snapshots.length > 0) {
            addLog(`📤 Envoi de ${snapshots.length} images`);
            sendSnapshotsToBackend();
        } else {
            addLog("⚠️ Aucune image capturée");
            setStatus('Aucune image capturée');
            console.log('snapshots:', snapshots);
        }
    };

    // Envoyer les snapshots au backend
    const sendSnapshotsToBackend = async () => {
        setStatus('Envoi des images au serveur...');
        addLog(`📤 Envoi à ${apiUrl}`);

        // Utiliser les IDs personnalisés ou générer des UUIDs
        const user_id = custom_user_id || uuidv4();
        const post_id = custom_post_id || uuidv4();

        addLog(`ID utilisateur: ${user_id}, ID post: ${post_id}`);

        if (onCaptureSnapshots) {
            onCaptureSnapshots(snapshots);
        }

        try {
            // Préparer les données (enlever le préfixe)
            const processedSnapshots = snapshots.map(snapshot => snapshot.split(',')[1]);

            addLog(`📤 Envoi de TOUTES les images: ${processedSnapshots.length} photos`);

            // Envoi avec axios
            const response = await axios.post(apiUrl, {
                user_id: user_id,
                post_id: post_id,
                snapshots: processedSnapshots, // Toutes les images, pas seulement les 9 dernières
            });

            addLog(`✅ Réponse du serveur: ${response.status}`);
            setStatus(`✅ ${snapshots.length} images envoyées avec succès !`);
            setUploadSuccess(true);

            if (onSuccess) {
                onSuccess();
            }
        } catch (error: any) {
            console.error("❌ Erreur lors de l'envoi des snapshots:", error);
            addLog(`❌ Erreur d'envoi: ${error.message || error}`);
            setStatus(`❌ Erreur lors de l'envoi des images: ${error.message || 'Erreur inconnue'}`);
            setUploadSuccess(false);
        }
    };

    const handleCloseWebcam = () => {
        stopCamera();
        if (onClose) onClose();
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto mb-5">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Capture d'émotions</h2>
                <button
                    onClick={handleCloseWebcam}
                    className="text-gray-500 hover:text-gray-800"
                >
                    <FiX className="w-5 h-5" />
                </button>
            </div>

            {webcamError && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
                    {webcamError}
                    {webcamPermissionDenied && (
                        <p className="mt-2 text-sm">
                            Veuillez autoriser l'accès à votre caméra dans les paramètres de votre navigateur.
                        </p>
                    )}
                </div>
            )}  

            <div className="flex flex-col md:flex-row gap-6">
                {/* Zone de prévisualisation webcam */}
                <div className="flex-1">
                    <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                        />

                        {!isVideoReady && !webcamError && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
                                Initialisation de la caméra...
                            </div>
                        )}

                        {isRecording && (
                            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold animate-pulse">
                                ⚫ ENREGISTREMENT {timeRemaining}s
                            </div>
                        )}
                    </div>

                    {/* Contrôles */}
                    <div className="mt-4 flex justify-center space-x-4">
                        {!isRecording ? (
                            <>
                                <button
                                    onClick={() => takeTestPhoto()}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                                    disabled={!isVideoReady}
                                >
                                    <FiCamera className="w-4 h-4" />
                                    Test photo
                                </button>
                                <button
                                    onClick={startRecording}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
                                    disabled={isRecording || !isVideoReady}
                                >
                                    <FiPlay className="w-4 h-4" />
                                    Démarrer ({duration / 1000}s)
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={stopRecording}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
                            >
                                <FiStopCircle className="w-4 h-4" />
                                Arrêter
                            </button>
                        )}
                    </div>

                    {/* Statut */}
                    {status && (
                        <div className={`mt-4 p-3 rounded-md text-center ${uploadSuccess === true ? 'bg-green-50 text-green-700' :
                            uploadSuccess === false ? 'bg-red-50 text-red-700' :
                                'bg-blue-50 text-blue-700'
                            }`}>
                            {status}
                        </div>
                    )}

                    {/* Compteur de snapshots */}
                    <div className="mt-4 text-center text-sm text-gray-600">
                        {snapshots.length > 0 && (
                            <>
                                <div>{snapshots.length} images capturées au total</div>
                                <div className="text-xs text-gray-500">Toutes seront envoyées au serveur</div>
                            </>
                        )}
                    </div>

                    {/* Logs pour debug */}
                    <div className="mt-4 p-2 border border-gray-200 rounded bg-gray-50 max-h-32 overflow-y-auto text-xs">
                        <h4 className="font-medium mb-1">Logs:</h4>
                        {debugLogs.map((log, index) => (
                            <div key={index} className="text-gray-600">{log}</div>
                        ))}
                    </div>
                </div>

                {/* Aperçu des derniers snapshots */}
                {snapshots.length > 0 && (
                    <div className="flex-1">
                        <h3 className="mb-3 font-medium text-gray-700">
                            Aperçu ({Math.min(snapshots.length, 9)} dernières images)
                        </h3>
                        <div className="grid grid-cols-3 gap-2">
                            {snapshots.slice(-9).map((snapshot, index) => (
                                <div key={index} className="border rounded-md overflow-hidden aspect-square">
                                    <img src={snapshot} alt={`Snapshot ${index + 1}`} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Canvas caché pour capture d'image */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
    );
};

export default WebcamEmotionCapture;
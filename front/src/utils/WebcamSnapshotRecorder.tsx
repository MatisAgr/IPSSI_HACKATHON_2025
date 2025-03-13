import React, { useState, useEffect, useRef } from 'react';
import { FiCamera, FiPlay, FiStopCircle, FiX } from 'react-icons/fi';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// Constantes de configuration
const SNAPSHOT_INTERVAL = 500; // 📸 Capture toutes les 500ms
const MAX_DURATION = 15000; // ⏳ Stop après 15 secondes
const DEFAULT_API_URL = "http://localhost:8000/emotions"; // URL modifiée pour localhost

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
    // Références pour les éléments DOM et autres
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const countdownRef = useRef<NodeJS.Timeout | null>(null);
    const isRecordingRef = useRef(false);
    
    // AJOUT: Référence pour stocker les snapshots de manière fiable
    const snapshotsRef = useRef<string[]>([]);
    
    // États
    const [isVideoReady, setIsVideoReady] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [snapshots, setSnapshots] = useState<string[]>([]);
    const [logs, setLogs] = useState<string[]>([]);
    const [status, setStatus] = useState('Prêt à capturer');
    const [timeRemaining, setTimeRemaining] = useState(Math.floor(duration / 1000));
    const [uploadSuccess, setUploadSuccess] = useState<boolean | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    
    // Fonction pour ajouter des logs
    const addLog = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`${timestamp}: ${message}`);
        setLogs(prev => [
            `${timestamp}: ${message}`, 
            ...prev.slice(0, 49)
        ]);
    };
    
    // Démarrer la caméra
    const startCamera = async () => {
        addLog("Démarrage de la caméra...");
        addLog("Demande d'accès à la caméra...");
        
        try {
            if (streamRef.current) {
                // Si un stream existe déjà, le réutiliser
                if (videoRef.current) {
                    videoRef.current.srcObject = streamRef.current;
                }
                return;
            }
            
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: true,
                audio: false
            });
            
            streamRef.current = stream;
            
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                addLog("Accès à la caméra obtenu ✅");
                addLog("Stream assigné à l'élément vidéo");
            } else {
                addLog("❌ Élément vidéo non disponible");
                throw new Error("Élément vidéo non disponible");
            }
        } catch (error) {
            addLog(`❌ Erreur d'accès à la caméra: ${error}`);
            setErrorMessage(`Erreur d'accès à la caméra: ${error}`);
        }
    };
    
    // Arrêter la caméra
    const stopCamera = () => {
        addLog("Arrêt de la caméra...");
        
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => {
                track.stop();
            });
            streamRef.current = null;
        }
        
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    };
    
    // Gérer le chargement de la vidéo
    const handleVideoLoad = () => {
        if (!videoRef.current) return;
        
        const video = videoRef.current;
        
        if (video.readyState >= 2) { // HAVE_CURRENT_DATA ou plus
            const width = video.videoWidth;
            const height = video.videoHeight;
            addLog(`Vidéo chargée: ${width}x${height}`);
            
            if (canvasRef.current) {
                canvasRef.current.width = width;
                canvasRef.current.height = height;
            }
            
            setIsVideoReady(true);
        }
    };
    
    // Gérer le démarrage de la lecture vidéo
    const handlePlayStart = () => {
        addLog("📹 Vidéo en cours de lecture");
    };
    
    // Capturer un instantané de la vidéo
    const captureSnapshot = (): string | null => {
        if (!videoRef.current || !canvasRef.current) {
            addLog("❌ Références vidéo ou canvas manquantes");
            return null;
        }
        
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        if (!context) {
            addLog("❌ Impossible d'obtenir le contexte 2D du canvas");
            return null;
        }
        
        try {
            // Dessiner l'image courante de la vidéo sur le canvas
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // Convertir en data URL (base64)
            return canvas.toDataURL('image/jpeg', 0.8);
        } catch (error) {
            addLog(`❌ Erreur lors de la capture: ${error}`);
            return null;
        }
    };
    
    // Démarrer l'enregistrement
    const startRecording = () => {
        if (!isVideoReady) {
            addLog("❌ La vidéo n'est pas prête pour l'enregistrement");
            setStatus("La caméra n'est pas prête. Veuillez patienter...");
            return;
        }

        // Réinitialiser les états
        snapshotsRef.current = []; // IMPORTANT: Réinitialiser la référence
        setSnapshots([]);
        setIsRecording(true);
        isRecordingRef.current = true;
        setStatus('Enregistrement en cours...');
        setTimeRemaining(duration / 1000);
        setUploadSuccess(null);
        setErrorMessage(null);

        addLog("⏺️ Démarrage de l'enregistrement");

        // Faire un test de capture avant de commencer
        const testResult = captureSnapshot();
        if (!testResult) {
            addLog("❌ Le test de capture avant enregistrement a échoué");
            setStatus("Impossible de capturer des images. Vérifiez votre caméra.");
            setIsRecording(false);
            isRecordingRef.current = false;
            return;
        }

        addLog("✅ Test initial de capture réussi");
        
        // Stocker le premier snapshot dans notre référence ET l'état
        snapshotsRef.current = [testResult];
        setSnapshots([testResult]);
        
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
            if (!videoRef.current || !canvasRef.current || !isRecordingRef.current) {
                addLog("⚠️ Capture interrompue: références manquantes ou enregistrement arrêté");
                return;
            }
            
            try {
                const snapshot = captureSnapshot();
                if (snapshot) {
                    // MODIFICATION: Utiliser notre référence pour suivre les snapshots
                    snapshotsRef.current.push(snapshot);
                    // Mettre à jour l'état avec une copie du tableau de la référence
                    setSnapshots([...snapshotsRef.current]);
                    addLog(`📸 Snapshot #${snapshotsRef.current.length} capturé`);
                }
            } catch (error) {
                addLog(`❌ Erreur pendant la capture: ${error}`);
            }
        }, SNAPSHOT_INTERVAL);

        // Configurer l'arrêt automatique
        timerRef.current = setTimeout(() => {
            addLog(`⏱️ Durée écoulée (${duration}ms), arrêt automatique`);
            stopRecording();
        }, duration);
    };

    // Arrêter l'enregistrement
    const stopRecording = () => {
        addLog("⏹️ Arrêt de l'enregistrement");
        
        // Nettoyer les timers
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
        
        // Mettre à jour les états
        setIsRecording(false);
        isRecordingRef.current = false;
        
        // Utiliser la référence pour vérifier les snapshots
        const capturedSnapshots = snapshotsRef.current;
        
        // Vérifier le nombre de snapshots capturés
        if (capturedSnapshots.length === 0) {
            addLog("⚠️ Aucune image capturée");
            setStatus("Aucune image n'a été capturée. Veuillez réessayer.");
            return;
        }
        
        // Mettre à jour l'état avec le contenu de notre référence
        setSnapshots(capturedSnapshots);
        setStatus(`${capturedSnapshots.length} images capturées. Envoi en cours...`);
        addLog(`📤 Envoi de ${capturedSnapshots.length} images...`);

        // Obtenir les IDs sans les inclure dans l'URL
        const user_id = custom_user_id || uuidv4();
        const post_id = custom_post_id || uuidv4();
        
        // MODIFICATION: Passer les snapshots de la référence à uploadSnapshots sans ajouter de paramètres à l'URL
        uploadSnapshots(capturedSnapshots, apiUrl, user_id, post_id);
        
        // Partager les snapshots avec le parent si nécessaire
        if (onCaptureSnapshots) {
            onCaptureSnapshots(capturedSnapshots);
        }
    };

    // Télécharger les snapshots au serveur
    const uploadSnapshots = async (
        snapshotsToUpload: string[], 
        url: string, 
        userId: string, 
        postId: string
    ) => {
        if (snapshotsToUpload.length === 0) {
            addLog("❌ Pas d'images à envoyer");
            setStatus("Aucune image à envoyer");
            return;
        }
        
        try {
            addLog(`📤 Envoi de ${snapshotsToUpload.length} snapshots à ${url}`);
            addLog(`🔑 user_id: ${userId}, post_id: ${postId}`);
            
            const response = await axios.post(url, {
                // MODIFICATION: Inclure les IDs dans le corps de la requête au lieu de l'URL
                user_id: userId,
                post_id: postId,
                snapshots: snapshotsToUpload
            });
            
            addLog(`✅ Images envoyées avec succès. Réponse: ${response.status}`);
            setUploadSuccess(true);
            setStatus("Images envoyées avec succès!");
            
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error("Erreur d'envoi:", error);
            addLog(`❌ Erreur lors de l'envoi: ${error}`);
            setUploadSuccess(false);
            setStatus("Erreur lors de l'envoi des images");
            setErrorMessage(`Erreur lors de l'envoi: ${error}`);
        }
    };

    // Initialiser la caméra au montage
    useEffect(() => {
        startCamera();
        
        // Nettoyage lors du démontage
        return () => {
            // Arrêter l'enregistrement si en cours
            if (isRecording) {
                stopRecording();
            }
            
            // Arrêter la caméra
            stopCamera();
        };
    }, []);

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto relative">
            {/* Bouton de fermeture */}
            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
                    aria-label="Fermer"
                >
                    <FiX size={24} />
                </button>
            )}

            <h2 className="text-xl font-bold mb-4">Analyse d'émotions</h2>
            
            {/* Vidéo et canvas */}
            <div className="mb-6">
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                    <video 
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className={`w-full h-full object-cover ${isRecording ? 'recording' : ''}`}
                        onLoadedData={handleVideoLoad}
                        onPlay={handlePlayStart}
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    
                    {/* Indicateur d'enregistrement */}
                    {isRecording && (
                        <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full flex items-center">
                            <div className="w-3 h-3 bg-white rounded-full mr-2 animate-pulse"></div>
                            <span className="text-sm font-medium">REC</span>
                        </div>
                    )}
                    
                    {/* Temps restant */}
                    {isRecording && (
                        <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full">
                            <span className="text-sm font-mono">{timeRemaining}s</span>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Contrôles */}
            <div className="flex justify-center mb-4 space-x-4">
                {!isRecording ? (
                    <button
                        onClick={startRecording}
                        disabled={!isVideoReady}
                        className={`px-4 py-2 rounded-full flex items-center ${
                            isVideoReady 
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        <FiPlay className="mr-2" />
                        <span>Démarrer</span>
                    </button>
                ) : (
                    <button
                        onClick={stopRecording}
                        className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 flex items-center"
                    >
                        <FiStopCircle className="mr-2" />
                        <span>Arrêter</span>
                    </button>
                )}
            </div>
            
            {/* Status */}
            <div className={`text-center mb-4 ${
                uploadSuccess === true ? 'text-green-600' : 
                uploadSuccess === false ? 'text-red-600' : 'text-gray-600'
            }`}>
                {status}
            </div>
            
            {/* Message d'erreur */}
            {errorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-4">
                    {errorMessage}
                </div>
            )}
            
            {/* Aperçu des snapshots */}
            {snapshots.length > 0 && !isRecording && (
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Aperçu des captures ({snapshots.length})</h3>
                    <div className="flex overflow-x-auto gap-2 py-2">
                        {snapshots.slice(0, 10).map((snapshot, index) => (
                            <div key={index} className="flex-shrink-0 w-20 h-20 border border-gray-200 rounded overflow-hidden">
                                <img src={snapshot} alt={`Snapshot ${index + 1}`} className="w-full h-full object-cover" />
                            </div>
                        ))}
                        {snapshots.length > 10 && (
                            <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded flex items-center justify-center">
                                <span className="text-gray-500">+{snapshots.length - 10}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Logs pour debug */}
            <div className="mt-6">
                <details>
                    <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                        Afficher les logs ({logs.length})
                    </summary>
                    <div className="mt-2 bg-gray-50 p-3 rounded-md text-xs font-mono text-gray-700 h-40 overflow-y-auto">
                        {logs.map((log, i) => (
                            <div key={i} className="mb-1">{log}</div>
                        ))}
                    </div>
                </details>
            </div>
        </div>
    );
};

export default WebcamEmotionCapture;
import { useRef, useEffect, useState } from "react";

interface UseWebcamProps {
    setWebcamError: (error: string | null) => void;
    setPhotoURL: (url: string | null) => void;
    setWebcamPermissionDenied: (denied: boolean) => void;
    captureInterval?: number; // Intervalle de capture en ms (défaut: 500ms)
}

interface UseWebcamReturn {
    webcamRef: React.RefObject<HTMLVideoElement | null>;
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    initWebcam: () => Promise<void>;
    stopWebcam: () => void;
    takePhoto: () => void;
    resetPhoto: () => void;
    handleWebcamSubmit: (e: React.FormEvent) => void;
    // Nouvelles fonctions:
    startSnapshotRecording: () => void;
    stopSnapshotRecording: () => void;
    snapshots: string[];
    isRecording: boolean;
    clearSnapshots: () => void;
}

const useWebcam = ({
    setWebcamError,
    setPhotoURL,
    setWebcamPermissionDenied,
    captureInterval = 500
}: UseWebcamProps): UseWebcamReturn => {
    const webcamRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const intervalRef = useRef<number | null>(null);
    const [snapshots, setSnapshots] = useState<string[]>([]);
    const [isRecording, setIsRecording] = useState<boolean>(false);

    const initWebcam = async () => {
        setWebcamError(null);
        setWebcamPermissionDenied(false);
        
        try {
            const constraints = {
                video: {
                    width: { ideal: 480 },
                    height: { ideal: 480 },
                    facingMode: "user"
                }
            };
            
            const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            
            if (webcamRef.current) {
                webcamRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error("Erreur d'accès à la webcam:", err);
            setWebcamError("Impossible d'accéder à votre webcam");
            
            if (err instanceof DOMException && (
                err.name === "NotAllowedError" || 
                err.name === "PermissionDeniedError"
            )) {
                setWebcamPermissionDenied(true);
            }
        }
    };

    const stopWebcam = () => {
        // Arrêter l'enregistrement des snapshots si actif
        if (intervalRef.current) {
            stopSnapshotRecording();
        }
        
        // Arrêter la webcam
        if (webcamRef.current && webcamRef.current.srcObject) {
            const currentStream = webcamRef.current.srcObject as MediaStream;
            currentStream.getTracks().forEach(track => {
                track.stop();
            });
            webcamRef.current.srcObject = null;
        }
    };

    const takePhoto = () => {
        if (webcamRef.current && canvasRef.current) {
            const video = webcamRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            context?.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            const dataURL = canvas.toDataURL('image/jpeg', 0.8); // Compression pour plus d'efficacité
            setPhotoURL(dataURL);
            return dataURL;
        }
        return null;
    };

    const resetPhoto = () => {
        setPhotoURL(null);
    };

    const handleWebcamSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        stopWebcam();
    };

    // Nouvelle fonction: Démarrer l'enregistrement des snapshots
    const startSnapshotRecording = () => {
        if (isRecording) return; // Ne pas démarrer si déjà en cours
        
        setIsRecording(true);
        
        // Créer un intervalle pour capturer des photos régulièrement
        intervalRef.current = window.setInterval(() => {
            const snapshot = takePhoto();
            if (snapshot) {
                setSnapshots(prev => [...prev, snapshot]);
            }
        }, captureInterval);
    };

    // Nouvelle fonction: Arrêter l'enregistrement des snapshots
    const stopSnapshotRecording = () => {
        if (intervalRef.current) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsRecording(false);
    };

    // Nouvelle fonction: Effacer tous les snapshots
    const clearSnapshots = () => {
        setSnapshots([]);
    };

    useEffect(() => {
        return () => {
            stopWebcam();
        };
    }, []);

    return {
        webcamRef,
        canvasRef,
        initWebcam,
        stopWebcam,
        takePhoto,
        resetPhoto,
        handleWebcamSubmit,
        startSnapshotRecording,
        stopSnapshotRecording,
        snapshots,
        isRecording,
        clearSnapshots
    };
};

export default useWebcam;
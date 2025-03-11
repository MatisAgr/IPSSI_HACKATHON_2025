import { useRef, useEffect } from "react";

interface UseWebcamProps {
    setWebcamError: (error: string | null) => void;
    setPhotoURL: (url: string | null) => void;
    setWebcamPermissionDenied: (denied: boolean) => void;
}

interface UseWebcamReturn {
    webcamRef: React.RefObject<HTMLVideoElement | null>;
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    initWebcam: () => Promise<void>;
    stopWebcam: () => void;
    takePhoto: () => void;
    resetPhoto: () => void;
    handleWebcamSubmit: (e: React.FormEvent) => void;
}

const useWebcam = ({
    setWebcamError,
    setPhotoURL,
    setWebcamPermissionDenied
}: UseWebcamProps): UseWebcamReturn => {
    const webcamRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

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
        // Utilisez webcamRef pour accéder au stream actuel
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
            
            const dataURL = canvas.toDataURL('image/jpeg');
            setPhotoURL(dataURL);
        }
    };

    const resetPhoto = () => {
        setPhotoURL(null);
    };

    const handleWebcamSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        stopWebcam();
        // Here you could add the photo to your user data
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
        handleWebcamSubmit
    };
};

export default useWebcam;
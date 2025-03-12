import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSend, FiCheck, FiAlertCircle } from 'react-icons/fi';

import PostCard from '../Cards/PostCard';
import { createPost, CreatePostData } from '../../callApi/CallApi_CreatePost';

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: (postData: { content: string; images: string[] }) => void;
    user: {
        name: string;
        username: string;
        profileImage: string;
        verified?: boolean;
    };
}

const DEFAULT_AVATAR = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/User-avatar.svg/2048px-User-avatar.svg.png';

export default function CreatePostModal({
    isOpen,
    onClose,
    onSubmit,
    user = {
        name: 'Utilisateur',
        username: 'utilisateur',
        profileImage: DEFAULT_AVATAR,
        verified: false
    }
}: CreatePostModalProps) {
    const [content, setContent] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [isFocused, setIsFocused] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    // propriétés de l'utilisateur avec des valeurs par défaut
    const userName = user?.name || 'Utilisateur';
    const userUsername = user?.username || 'utilisateur';
    const userProfileImage = user?.profileImage || DEFAULT_AVATAR;
    const userVerified = user?.verified || false;

    // Réinitialiser les états d'animation à l'ouverture du modal
    useEffect(() => {
        if (isOpen) {
            setIsSubmitting(false);
            setIsSuccess(false);
            setIsClosing(false);
        }
    }, [isOpen]);

    // Focus le textarea quand le modal s'ouvre
    useEffect(() => {
        if (isOpen && textareaRef.current) {
            setTimeout(() => {
                textareaRef.current?.focus();
            }, 100);
        }
    }, [isOpen]);

    // Ferme le modal si on clique en dehors
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
                handleClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);



    // Mettre à jour le contenu du textarea
    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
    };

    // Fermer le modal avec animation
    const handleClose = () => {
        if (isSubmitting) return; // Ne pas fermer pendant la soumission

        setIsClosing(true);
        // Attendre que l'animation de sortie se termine avant de fermer réellement
        setTimeout(() => {
            onClose();
            // Réinitialiser après un court délai pour éviter un flash lors de la fermeture complète
            setTimeout(() => {
                setIsClosing(false);
            }, 50);
        }, 300); // Temps suffisant pour que l'animation de sortie soit visible
    };

    // Soumettre le formulaire
    const handleSubmit = async () => {
        if (content.trim()) {
            // Animation de soumission
            setIsSubmitting(true);
            setError(null);

            try {
                // Préparer les données pour l'API
                const postData: CreatePostData = {
                    content: content.trim(),
                    // Si vous avez des images, ajouter la première comme URL média
                    mediaUrl: images.length > 0 ? images[0] : undefined,
                };

                // Appel à l'API
                const response = await createPost(postData);

                if (response.success) {
                    // Montrer l'animation de succès
                    setIsSuccess(true);

                    // Après l'animation, fermer le modal et réinitialiser
                    setTimeout(() => {
                        // Notifier le composant parent que le post a été créé
                        onSubmit?.({ content, images });

                        // Réinitialiser et fermer
                        setContent('');
                        setImages([]);
                        handleClose();
                    }, 1500);
                } else {
                    // Gérer l'erreur retournée par l'API
                    setError(response.message);
                    setIsSubmitting(false);
                }
            } catch (err) {
                // Gérer les erreurs inattendues
                console.error("Erreur lors de la création du post:", err);
                setError("Une erreur inattendue s'est produite");
                setIsSubmitting(false);
            }
        }
    };

    // Si le modal n'est pas ouvert, ne rien rendre
    if (!isOpen) return null;

    return (
        <AnimatePresence mode="wait">

            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden"
                initial={{ backdropFilter: "blur(0px)", backgroundColor: "rgba(0, 0, 0, 0)" }}
                animate={{
                    backdropFilter: isClosing ? "blur(0px)" : "blur(5px)",
                    backgroundColor: isClosing ? "rgba(0, 0, 0, 0)" : "rgba(0, 0, 0, 0.5)"
                }}
                exit={{ backdropFilter: "blur(0px)", backgroundColor: "rgba(0, 0, 0, 0)" }}
                transition={{ duration: 0.3 }}
                key="modal-backdrop"
            >
                <motion.div
                    ref={modalRef}
                    className="bg-white rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl"
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{
                        opacity: isClosing ? 0 : 1,
                        y: isClosing ? 50 : 0,
                        scale: isClosing ? 0.9 : 1
                    }}
                    exit={{ opacity: 0, y: 50, scale: 0.9 }}
                    transition={{
                        type: 'spring',
                        damping: 25,
                        stiffness: 300
                    }}
                    key="modal-content"
                >
                    {/* Header */}
                    <div className="flex justify-between items-center p-4 border-b">
                        <h2 className="text-xl font-bold">Créer un post</h2>
                        <button
                            onClick={handleClose}
                            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
                            disabled={isSubmitting}
                        >
                            <FiX size={24} />
                        </button>
                    </div>

                    {/* Contenu du modal */}
                    <div className="grid md:grid-cols-2 divide-x">

                        {/* Partie édition */}
                        <div className="p-4">
                            <div className="flex items-start space-x-3 mb-4">
                                {/* Avatar de l'utilisateur */}
                                <div className="flex-shrink-0">
                                    <img
                                        src={userProfileImage}
                                        alt={`${userName}'s avatar`}
                                        className="h-10 w-10 rounded-full object-cover border border-gray-200"
                                    />
                                </div>

                                {/* Zone de texte */}
                                <div className="flex-grow">

                                    {error && (
                                        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-start">
                                            <FiAlertCircle className="mr-2 mt-0.5 flex-shrink-0" />
                                            <span>{error}</span>
                                        </div>
                                    )}

                                    <div
                                        className={`border rounded-lg p-2 transition-colors ${isFocused ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-200'
                                            }`}
                                    >
                                        <textarea
                                            ref={textareaRef}
                                            value={content}
                                            onChange={handleTextChange}
                                            onFocus={() => setIsFocused(true)}
                                            onBlur={() => setIsFocused(false)}
                                            placeholder="Crachez votre haine ici..."
                                            className="w-full min-h-[200px] resize-none focus:outline-none"
                                            disabled={isSubmitting || isSuccess}
                                        />
                                    </div>

                                    {/* Barre d'outils */}
                                    <div className="flex justify-end items-center mt-3">
                                        <motion.button
                                            onClick={handleSubmit}
                                            className={`px-4 py-2 rounded-full text-white font-medium flex items-center space-x-2 ${isSuccess
                                                    ? 'bg-green-500'
                                                    : content.trim()
                                                        ? 'bg-blue-500 hover:bg-blue-600 cursor-pointer'
                                                        : 'bg-blue-200 cursor-not-allowed'
                                                }`}
                                            disabled={(!content.trim()) || isSubmitting || isSuccess}
                                            whileHover={
                                                (content.trim()) && !isSubmitting && !isSuccess
                                                    ? { scale: 1.03 }
                                                    : {}
                                            }
                                            whileTap={
                                                (content.trim()) && !isSubmitting && !isSuccess
                                                    ? { scale: 0.97 }
                                                    : {}
                                            }
                                            animate={
                                                isSuccess
                                                    ? {
                                                        scale: [1, 1.15, 1],
                                                        backgroundColor: ['#3B82F6', '#10b981', '#10b981', '#3B82F6'],
                                                        transition: {
                                                            duration: 1.5,
                                                            backgroundColor: {
                                                                times: [0, 0.2, 0.8, 1],
                                                                duration: 1.5
                                                            }
                                                        }
                                                    }
                                                    : {}
                                            }
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <motion.div
                                                        className="h-5 w-5 border-2 border-white border-t-transparent rounded-full"
                                                        animate={{ rotate: 360 }}
                                                        transition={{
                                                            duration: 1,
                                                            repeat: Infinity,
                                                            ease: "linear"
                                                        }}
                                                    />
                                                    <span>Envoi...</span>
                                                </>
                                            ) : isSuccess ? (
                                                <>
                                                    <FiCheck size={20} className="text-white" />
                                                    <span>Publié!</span>
                                                </>
                                            ) : (
                                                <>
                                                    <FiSend size={16} />
                                                    <span>Publier</span>
                                                </>
                                            )}
                                        </motion.button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Partie prévisualisation */}
                        <div className="p-4 bg-gray-50">
                            <h3 className="text-sm font-medium text-gray-500 mb-3">Prévisualisation</h3>
                            <motion.div
                                animate={
                                    isSubmitting
                                        ? { y: [0, -10], opacity: [1, 0] }
                                        : isSuccess
                                            ? { scale: 0.9, opacity: 0.5 }
                                            : { scale: 1, opacity: 1 }
                                }
                                transition={{ duration: 0.3 }}
                            >
                                <PostCard
                                    user={{
                                        name: userName,
                                        username: userUsername,
                                        avatar: userProfileImage,
                                        verified: userVerified
                                    }}
                                    content={content}
                                    timestamp="À l'instant"
                                    stats={{
                                        comments: 0,
                                        retweets: 0,
                                        likes: 0
                                    }}
                                    isPreview={true}
                                />
                            </motion.div>

                            {/* Animation de succès */}
                            <AnimatePresence mode="wait">
                                {isSuccess && !isClosing && (
                                    <motion.div
                                        className="absolute inset-0 flex items-center justify-center bg-gradient-to-tr from-blue-500/30 to-green-500/30"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.4 }}
                                        key="success-overlay"
                                    >
                                        <motion.div
                                            className="bg-white rounded-full p-6 shadow-xl"
                                            initial={{ scale: 0.5, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0.7, opacity: 0 }}
                                            transition={{
                                                type: "spring",
                                                damping: 20,
                                                exit: { duration: 0.3 }
                                            }}
                                            key="success-icon-container"
                                        >
                                            <motion.div
                                                className="text-green-500 text-5xl"
                                                animate={{
                                                    scale: [1, 1.2, 1, 1.1, 1],
                                                }}
                                                transition={{
                                                    duration: 1.2,
                                                    times: [0, 0.25, 0.5, 0.75, 1]
                                                }}
                                                key="success-icon"
                                            >
                                                <FiCheck />
                                            </motion.div>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
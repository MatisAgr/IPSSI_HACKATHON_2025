import { useState, useEffect, useRef, ReactNode } from 'react';

interface InfiniteScrollProps {
  children: ReactNode;      // contenu du scroll
  loadMore: () => void;     // fonction pour charger plus de contenu
  hasMore: boolean;         // indique s'il y a plus de contenu à charger
  isLoading?: boolean;      // indique si un chargement est en cours
  loader?: ReactNode;       // elt React à afficher pendant le chargement
  endMessage?: ReactNode;   // message à afficher quand il n'y a plus de contenu à charger
  threshold?: number;       // pixels avant la fin du scroll pour déclencher le chargement
  className?: string;       // class CSS (ou tailwind) à appliquer au conteneur
  height?: string | number; // hauteur maximale du conteneur (par défaut 100%)
}

const InfiniteScroll = ({
  children,
  loadMore,
  hasMore,
  isLoading = false,
  loader = <div className="py-4 text-center">Chargement...</div>,
  endMessage = <div className="py-4 text-center text-gray-500">Plus de contenu à charger</div>,
  threshold = 300,
  className = '',
  height = '100%'
}: InfiniteScrollProps) => {
  const [showLoader, setShowLoader] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollEventRef = useRef<any>(null);

  // vérifie si on doit charger plus de contenu
  const checkScrollPosition = () => {
    if (!scrollRef.current || isLoading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    
    // vérifie si on est proche de la fin du scroll
    if (scrollHeight - scrollTop - clientHeight < threshold) {
      setShowLoader(true);
      loadMore();
    } else {
      setShowLoader(false);
    }
  };

  // throttle pour limiter les appels pendant le scroll
  const throttle = (callback: Function, delay: number) => {
    let lastCall = 0;
    return function (...args: any[]) {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        callback(...args);
      }
    };
  };

  // event listener pour le scroll
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    // throttle pour éviter trop d'appels pendant le scroll
    scrollEventRef.current = throttle(checkScrollPosition, 150);
    
    checkScrollPosition();
    
    scrollElement.addEventListener('scroll', scrollEventRef.current);
    
    // Cleanup
    return () => {
      if (scrollElement && scrollEventRef.current) {
        scrollElement.removeEventListener('scroll', scrollEventRef.current);
      }
    };
  }, [isLoading, hasMore]); // re-attacher quand isLoading ou hasMore change

  useEffect(() => {
    checkScrollPosition();
  }, [children]);

  return (
    <div 
      ref={scrollRef}
      className={`overflow-y-auto ${className}`}
      style={{ height }}
    >
      {/* Contenu */}
      {children}
      
      {/* Loader */}
      {showLoader && isLoading && loader}
      
      {/* Message de fin */}
      {!hasMore && endMessage}
    </div>
  );
};

export default InfiniteScroll;
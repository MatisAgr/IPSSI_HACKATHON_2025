import React, { useState, useEffect, useRef, ReactNode } from 'react';

interface InfiniteScrollProps {
  children: ReactNode;
  loadMore: () => void;
  hasMore: boolean;
  isLoading?: boolean;
  loader?: ReactNode;
  endMessage?: ReactNode;
  threshold?: number;
  className?: string;
  height?: string | number;
  initialLoad?: boolean;
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
  height = '100%',
  initialLoad = true
}: InfiniteScrollProps) => {
  // Remplacer useState par useRef pour éviter les re-rendus
  const loaderShown = useRef(false);
  
  // Références pour le contrôle des appels
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollEventRef = useRef<any>(null);
  const initialLoadDone = useRef<boolean>(false);
  const loadMoreCalledRecently = useRef<boolean>(false);
    
  const checkScrollPosition = () => {
    // Protection contre les appels multiples, trop rapides ou inutiles
    if (!scrollRef.current || isLoading || !hasMore || loadMoreCalledRecently.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
  
    // Log pour le debugging
    console.log(`Scroll position: ${scrollTop + clientHeight}/${scrollHeight}, threshold: ${threshold}, remaining: ${scrollHeight - scrollTop - clientHeight}`);
    
    // Uniquement charger si on est proche de la fin du scroll
    // CORRECTION: Réduire le seuil pour être plus sensible
    if (scrollHeight > clientHeight && scrollHeight - scrollTop - clientHeight < threshold) {
      loadMoreCalledRecently.current = true;
      console.log('📜 Approaching end of scroll, loading more...');
      loadMore();
      loaderShown.current = true;
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

  // Gestion du scroll uniquement - hook optimisé
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;
  
    // Plus long délai pour le throttle - RÉDUIRE pour plus de réactivité
    scrollEventRef.current = throttle(checkScrollPosition, 200); // Réduit de 500ms à 200ms
    scrollElement.addEventListener('scroll', scrollEventRef.current);
    
    // IMPORTANT: Vérifier aussi au montage du composant
    setTimeout(() => checkScrollPosition(), 500);
    
    return () => {
      if (scrollElement && scrollEventRef.current) {
        scrollElement.removeEventListener('scroll', scrollEventRef.current);
      }
    };
  }, []);

  // Réinitialiser le flag quand isLoading change
  useEffect(() => {
    if (!isLoading) {
      // Attendre un moment après la fin du chargement pour permettre un nouveau chargement
      setTimeout(() => {
        loadMoreCalledRecently.current = false;
      }, 500);
    }
  }, [isLoading]);

  // Chargement initial - UNIQUEMENT au premier rendu et si demandé
  useEffect(() => {
    if (initialLoad && hasMore && !isLoading && !initialLoadDone.current) {
      initialLoadDone.current = true;
      console.log('🔍 Initial load triggered');
      loadMore();
    }
  }, []);

  return (
    <div 
      ref={scrollRef}
      className={`overflow-y-auto ${className}`}
      style={{ height }}
    >
      {/* Contenu */}
      {children}
      
      {/* Loader - uniquement si on charge */}
      {isLoading && loader}
      
      {/* Message de fin */}
      {!hasMore && !isLoading && endMessage}
    </div>
  );
};

export default InfiniteScroll;
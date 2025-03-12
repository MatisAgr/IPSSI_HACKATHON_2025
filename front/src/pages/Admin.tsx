import { useState, useEffect } from "react";
import { FiLoader, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

// Type générique pour les données
type ApiData = any[] | Record<string, any>;

export default function Admin() {
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour récupérer les données
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5000/api');
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
      console.log(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Chargement initial des données
  useEffect(() => {
    fetchData();
  }, []);

  // Fonction pour déterminer si les données sont un tableau ou un objet
  const isArray = Array.isArray(data);
  
  // Fonction pour extraire les entêtes du tableau
  const getHeaders = () => {
    if (!data) return [];
    
    if (isArray && data.length > 0) {
      // Pour un tableau, prendre les clés du premier élément
      return Object.keys(data[0]);
    } else if (!isArray) {
      // Pour un objet, prendre ses propres clés
      return Object.keys(data);
    }
    return [];
  };

  // Fonction pour rendre correctement une valeur
  const renderValue = (value: any) => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400">null</span>;
    } else if (typeof value === 'object') {
      return <span className="text-blue-500 cursor-pointer hover:underline" 
                 onClick={() => alert(JSON.stringify(value, null, 2))}>
               {Array.isArray(value) ? `Array(${value.length})` : 'Object'}
             </span>;
    } else if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }
    return String(value);
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-20 pb-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-800">Panneau d'administration</h1>
              <button 
                onClick={fetchData}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center gap-2"
              >
                <FiRefreshCw className="w-4 h-4" /> Actualiser
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <FiLoader className="w-8 h-8 animate-spin text-indigo-600" />
              <span className="ml-2 text-lg text-gray-600">Chargement des données...</span>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-64 flex-col">
              <FiAlertTriangle className="w-12 h-12 text-red-500 mb-4" />
              <p className="text-red-500 text-center max-w-md">{error}</p>
              <button 
                onClick={fetchData}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Réessayer
              </button>
            </div>
          ) : data ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {getHeaders().map((header) => (
                      <th 
                        key={header} 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isArray ? (
                    // Si data est un tableau, afficher chaque élément en ligne
                    data.map((item, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-gray-50">
                        {getHeaders().map((header) => (
                          <td key={header} className="px-6 py-4 whitespace-nowrap">
                            {renderValue(item[header])}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    // Si data est un objet, afficher une seule ligne
                    <tr className="hover:bg-gray-50">
                      {getHeaders().map((header) => (
                        <td key={header} className="px-6 py-4 whitespace-nowrap">
                          {renderValue(data[header])}
                        </td>
                      ))}
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-500">Aucune donnée disponible</p>
            </div>
          )}
        </div>

        {/* Section pour afficher les données brutes */}
        {data && (
          <div className="mt-8 bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Données brutes</h2>
            </div>
            <div className="p-6 overflow-x-auto">
              <pre className="bg-gray-50 p-4 rounded-md text-sm">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
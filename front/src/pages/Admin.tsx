import { useState, useEffect } from "react";
import { FiLoader, FiAlertTriangle, FiRefreshCw, FiSearch, FiChevronDown, FiChevronUp, FiFilter, FiEdit, FiTrash2, FiCamera } from 'react-icons/fi';

import WebcamSnapshotRecorder from '../utils/WebcamSnapshotRecorder';

// Type générique pour les données
type ApiData = any[] | Record<string, any>;

interface ApiEndpoint {
  name: string;
  url: string;
  description: string;
}

export default function Admin() {
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<{key: string; direction: 'asc' | 'desc'} | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('posts');
  const [showWebcam, setShowWebcam] = useState<boolean>(false);

  // Liste des endpoints disponibles
  const apiEndpoints: ApiEndpoint[] = [
    { name: 'posts', url: 'http://localhost:5000/api/search/posts/test', description: 'Publications' },
    { name: 'emotion', url: 'http://10.74.0.54:8000/emotions', description: 'Émotions' },
  ];

  // Fonction pour récupérer les données
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    const endpoint = apiEndpoints.find(e => e.name === selectedEndpoint);
    if (!endpoint) {
      setError('Endpoint invalide');
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch(endpoint.url);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
      console.log(`Données chargées depuis ${endpoint.name}:`, result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      console.error('Erreur lors du chargement des données:', err);
    } finally {
      setLoading(false);
    }
  };

  // Chargement initial des données
  useEffect(() => {
    fetchData();
  }, [selectedEndpoint]);

  // Détermine si les données sont un tableau
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

  // Fonction pour filtrer les données
  const getFilteredData = () => {
    if (!data || !isArray) return data;

    return data.filter(item => {
      return Object.values(item).some(value => {
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  };

  // Fonction pour trier les données
  const getSortedData = () => {
    const filteredData = getFilteredData();
    if (!filteredData || !isArray || !sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      // Gestion des valeurs null et undefined
      if (aValue === null || aValue === undefined) return sortConfig.direction === 'asc' ? -1 : 1;
      if (bValue === null || bValue === undefined) return sortConfig.direction === 'asc' ? 1 : -1;

      // Comparaison selon le type
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }

      // Pour les nombres ou autres valeurs
      return sortConfig.direction === 'asc' 
        ? (aValue > bValue ? 1 : -1) 
        : (aValue < bValue ? 1 : -1);
    });
  };

  // Gestionnaire de tri
  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Gestion de l'expansion des lignes
  const toggleRowExpansion = (rowIndex: number) => {
    const newExpandedRows = new Set(expandedRows);
    if (expandedRows.has(rowIndex)) {
      newExpandedRows.delete(rowIndex);
    } else {
      newExpandedRows.add(rowIndex);
    }
    setExpandedRows(newExpandedRows);
  };

  // Fonction pour rendre correctement une valeur
  const renderValue = (value: any, rowIndex?: number, expanded = false) => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400">null</span>;
    } 
    
    else if (typeof value === 'object') {
      if (expanded) {
        // Affichage détaillé si la ligne est expansée
        return (
          <div className="text-sm bg-gray-50 p-3 rounded">
            <pre className="whitespace-pre-wrap break-all">
              {JSON.stringify(value, null, 2)}
            </pre>
          </div>
        );
      }
      
      // Affichage compact
      return (
        <span 
          className={`text-blue-600 font-medium ${rowIndex !== undefined ? 'cursor-pointer hover:underline' : ''}`}
          onClick={rowIndex !== undefined ? () => toggleRowExpansion(rowIndex) : undefined}
        >
          {Array.isArray(value) 
            ? `Array(${value.length})` 
            : `Object{${Object.keys(value).length}}`}
        </span>
      );
    } 
    
    else if (typeof value === 'boolean') {
      return (
        <span className={value ? 'text-green-600' : 'text-red-600'}>
          {value ? 'true' : 'false'}
        </span>
      );
    }
    
    else if (typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://'))) {
      if (value.match(/\.(jpeg|jpg|gif|png)$/)) {
        return (
          <img 
            src={value} 
            alt="Preview" 
            className="h-10 w-10 object-cover rounded hover:scale-150 transition-transform" 
          />
        );
      }
      return (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
          {value.length > 30 ? `${value.substring(0, 30)}...` : value}
        </a>
      );
    }
    
    else if (typeof value === 'string' && value.length > 100 && !expanded) {
      return `${value.substring(0, 100)}...`;
    }
    
    return String(value);
  };

  const processedData = getSortedData();

  return (
    <div className="min-h-screen bg-gray-100 pt-20 pb-10 px-4">

<div className="mb-8 flex justify-end">
          <button
            onClick={() => setShowWebcam(!showWebcam)}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center gap-2"
          >
            <FiCamera className="w-4 h-4" />
            {showWebcam ? 'Cacher la webcam' : 'Afficher la webcam'}
          </button>
        </div>

        {/* Section de webcam conditionnelle */}
        {showWebcam && (
          <WebcamSnapshotRecorder onClose={() => setShowWebcam(false)} />
        )}


      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-800">Panneau d'administration</h1>
              
              {/* Sélecteur d'endpoint */}
              <div className="flex items-center space-x-4">
                <label className="text-gray-600">Données :</label>
                <div className="relative">
                  <select
                    value={selectedEndpoint}
                    onChange={(e) => setSelectedEndpoint(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {apiEndpoints.map(endpoint => (
                      <option key={endpoint.name} value={endpoint.name}>
                        {endpoint.description}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <FiChevronDown />
                  </div>
                </div>
                
                <button 
                  onClick={fetchData}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center gap-2"
                >
                  <FiRefreshCw className="w-4 h-4" /> Actualiser
                </button>
              </div>
            </div>
          </div>

          {/* Barre de recherche */}
          {isArray && data && data.length > 0 && (
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher dans les données..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Contenu principal */}
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
            isArray && data.length === 0 ? (
              <div className="flex justify-center items-center h-64">
                <p className="text-gray-500">Aucune donnée disponible</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {isArray && <th className="w-10 px-4 py-3"></th>}
                      {getHeaders().map((header) => (
                        <th 
                          key={header} 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => requestSort(header)}
                        >
                          <div className="flex items-center space-x-1">
                            <span>{header}</span>
                            {sortConfig?.key === header && (
                              sortConfig.direction === 'asc' 
                                ? <FiChevronUp className="w-4 h-4" /> 
                                : <FiChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </th>
                      ))}
                      {isArray && <th className="w-20 px-4 py-3">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {isArray ? (
                      // Affichage des données de type tableau
                      processedData.map((item, rowIndex) => (
                        <>
                          <tr key={rowIndex} className={`${expandedRows.has(rowIndex) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                            <td className="px-4 py-4">
                              <button 
                                onClick={() => toggleRowExpansion(rowIndex)}
                                className="p-1 rounded-full hover:bg-gray-200"
                              >
                                {expandedRows.has(rowIndex) 
                                  ? <FiChevronUp className="w-4 h-4 text-gray-600" /> 
                                  : <FiChevronDown className="w-4 h-4 text-gray-600" />}
                              </button>
                            </td>
                            {getHeaders().map((header) => (
                              <td key={header} className="px-6 py-4 whitespace-nowrap">
                                {renderValue(item[header], rowIndex)}
                              </td>
                            ))}
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex space-x-2">
                                <button className="p-1 text-blue-600 hover:bg-blue-100 rounded-full">
                                  <FiEdit className="w-4 h-4" />
                                </button>
                                <button className="p-1 text-red-600 hover:bg-red-100 rounded-full">
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                          {expandedRows.has(rowIndex) && (
                            <tr className="bg-gray-50">
                              <td colSpan={getHeaders().length + 2} className="px-6 py-4">
                                <div className="bg-white p-4 rounded-md border border-gray-200">
                                  {Object.entries(item).map(([key, value]) => (
                                    <div key={key} className="mb-3">
                                      <div className="font-medium text-gray-700 mb-1">{key}:</div>
                                      <div className="pl-2 border-l-2 border-gray-200">
                                        {renderValue(value, undefined, true)}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      ))
                    ) : (
                      // Affichage des données de type objet
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
            )
          ) : (
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-500">Aucune donnée disponible</p>
            </div>
          )}
        </div>


        {/* Section des données brutes */}
        {data && (
          <div className="mt-8 bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Données brutes</h2>
            </div>
            <div className="p-6 overflow-x-auto">
              <pre className="bg-gray-50 p-4 rounded-md text-sm overflow-auto max-h-96">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
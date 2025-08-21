// KML Visualizer Application
class KMLVisualizer {
    constructor() {
        this.map = null;
        this.loadedLayers = new Map();
        this.colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
            '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
            '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
        ];
        this.colorIndex = 0;
        this.kmlFiles = [];

        this.initializeMap();
        this.loadKMLFilesFromFolder();
    }
    
    initializeMap() {
        // Initialize the map centered on a default location
        this.map = L.map('map').setView([40.7128, -74.0060], 10);

        // Define different base layers
        const baseLayers = {
            // Balanced - shows major cities and countries but clean
            'Balanced (Major Cities)': L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
                maxZoom: 19
            }),

            // Clean minimal style - some labels but very light
            'Clean (Minimal Labels)': L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
                maxZoom: 19
            }),

            // Very clean - just roads and boundaries, no city names
            'Minimal (No Labels)': L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
                maxZoom: 19
            }),

            // Standard OpenStreetMap (with all labels)
            'Standard (All Labels)': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19
            }),

            // Satellite view option
            'Satellite': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
                maxZoom: 19
            })
        };

        // Add the balanced layer by default (shows major cities)
        baseLayers['Balanced (Major Cities)'].addTo(this.map);

        // Add layer control to switch between different base maps
        L.control.layers(baseLayers).addTo(this.map);

        // Add scale control
        L.control.scale().addTo(this.map);
    }
    


    async loadKMLFilesFromFolder() {
        try {
            // Clear existing layers first
            this.clearAllLayers();

            // List of KML files to load (you can expand this list)
            const kmlFiles = [
                'input_folder/Trip Start from 2024.kml'
                // Add more files here as needed
            ];

            let loadedCount = 0;
            let errorCount = 0;

            for (const filePath of kmlFiles) {
                try {
                    await this.loadKMLFromPath(filePath);
                    loadedCount++;
                } catch (error) {
                    console.error(`Error loading ${filePath}:`, error);
                    errorCount++;
                }
            }

            if (loadedCount > 0) {
                this.fitMapToLayers();
                console.log(`✅ Loaded ${loadedCount} KML file(s)${errorCount > 0 ? ` (${errorCount} failed)` : ''}`);
            } else {
                console.log('❌ No KML files could be loaded');
            }

        } catch (error) {
            console.error('❌ Error loading KML files:', error);
        }
    }

    async loadKMLFromPath(filePath) {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${filePath}: ${response.status}`);
        }

        const kmlText = await response.text();
        const parser = new DOMParser();
        const kmlDoc = parser.parseFromString(kmlText, 'text/xml');

        // Check for parsing errors
        const parseError = kmlDoc.querySelector('parsererror');
        if (parseError) {
            throw new Error(`Invalid KML format in file: ${filePath}`);
        }

        // Convert KML to GeoJSON
        const geoJson = toGeoJSON.kml(kmlDoc);

        if (!geoJson.features || geoJson.features.length === 0) {
            throw new Error(`No valid features found in file: ${filePath}`);
        }

        // Extract filename from path
        const fileName = filePath.split('/').pop();

        // Create layer and add to map
        this.createLayerFromGeoJSON(geoJson, fileName);
    }



    async handleFileSelection(event) {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;
        

        
        try {
            for (const file of files) {
                await this.processKMLFile(file);
            }
            
            // Fit map to show all loaded data
            this.fitMapToLayers();

        } catch (error) {
            console.error(`Error processing files: ${error.message}`);
        }
    }
    
    async processKMLFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const kmlText = e.target.result;
                    const parser = new DOMParser();
                    const kmlDoc = parser.parseFromString(kmlText, 'text/xml');
                    
                    // Check for parsing errors
                    const parseError = kmlDoc.querySelector('parsererror');
                    if (parseError) {
                        throw new Error(`Invalid KML format in file: ${file.name}`);
                    }
                    
                    // Convert KML to GeoJSON
                    const geoJson = toGeoJSON.kml(kmlDoc);
                    
                    if (!geoJson.features || geoJson.features.length === 0) {
                        throw new Error(`No valid features found in file: ${file.name}`);
                    }
                    
                    // Create layer and add to map
                    this.createLayerFromGeoJSON(geoJson, file.name);
                    resolve();
                    
                } catch (error) {
                    reject(new Error(`Error processing ${file.name}: ${error.message}`));
                }
            };
            
            reader.onerror = () => {
                reject(new Error(`Error reading file: ${file.name}`));
            };
            
            reader.readAsText(file);
        });
    }
    
    createLayerFromGeoJSON(geoJson, fileName) {
        const color = this.colors[this.colorIndex % this.colors.length];
        this.colorIndex++;

        // Create main layer for tracks (lines/polygons)
        const layer = L.geoJSON(geoJson, {
            style: (feature) => {
                return {
                    color: color,
                    weight: 3,
                    opacity: 0.8,
                    fillColor: color,
                    fillOpacity: 0.3
                };
            },
            pointToLayer: (feature, latlng) => {
                // Return null to hide point markers - only show lines/polygons
                return null;
            },
            filter: (feature) => {
                // Only show LineString and Polygon features, hide Point features
                return feature.geometry.type !== 'Point';
            },
            onEachFeature: (feature, layer) => {
                // Create popup content
                let popupContent = `<strong>File:</strong> ${fileName}<br>`;
                
                if (feature.properties) {
                    if (feature.properties.name) {
                        popupContent += `<strong>Name:</strong> ${feature.properties.name}<br>`;
                    }
                    if (feature.properties.description) {
                        popupContent += `<strong>Description:</strong> ${feature.properties.description}<br>`;
                    }
                    
                    // Add other properties
                    Object.keys(feature.properties).forEach(key => {
                        if (key !== 'name' && key !== 'description' && feature.properties[key]) {
                            popupContent += `<strong>${key}:</strong> ${feature.properties[key]}<br>`;
                        }
                    });
                }
                
                layer.bindPopup(popupContent);
            }
        });
        
        layer.addTo(this.map);

        // Count non-Point features for display
        const nonPointFeatures = geoJson.features.filter(f => f.geometry.type !== 'Point').length;

        // Store layer info
        this.loadedLayers.set(fileName, {
            layer: layer,
            color: color,
            featureCount: nonPointFeatures,
            originalFeatureCount: geoJson.features.length,
            geoJson: geoJson // Store original data for color changes
        });
    }



    fitMapToLayers() {
        if (this.loadedLayers.size === 0) return;
        
        const group = new L.featureGroup();
        this.loadedLayers.forEach(layerInfo => {
            group.addLayer(layerInfo.layer);
        });
        
        this.map.fitBounds(group.getBounds(), { padding: [20, 20] });
    }
    

    

    
    removeLayer(fileName) {
        const layerInfo = this.loadedLayers.get(fileName);

        if (layerInfo) {
            this.map.removeLayer(layerInfo.layer);
            this.loadedLayers.delete(fileName);
        }



        // Refit map if there are still layers
        if (this.loadedLayers.size > 0) {
            this.fitMapToLayers();
        }
    }
    
    clearAllLayers() {
        this.loadedLayers.forEach((layerInfo) => {
            this.map.removeLayer(layerInfo.layer);
        });

        this.loadedLayers.clear();
        this.colorIndex = 0;

        // Reset map view
        this.map.setView([40.7128, -74.0060], 10);
    }





    changeLayerColor(fileName, newColor) {
        const layerInfo = this.loadedLayers.get(fileName);

        if (!layerInfo) return;

        // Update stored color
        layerInfo.color = newColor;

        // Remove old layer
        this.map.removeLayer(layerInfo.layer);

        // Create new layer with new color
        const newLayer = L.geoJSON(layerInfo.geoJson, {
            style: (feature) => {
                return {
                    color: newColor,
                    weight: 3,
                    opacity: 0.8,
                    fillColor: newColor,
                    fillOpacity: 0.3
                };
            },
            pointToLayer: (feature, latlng) => {
                return null;
            },
            filter: (feature) => {
                return feature.geometry.type !== 'Point';
            },
            onEachFeature: (feature, layer) => {
                let popupContent = `<strong>File:</strong> ${fileName}<br>`;

                if (feature.properties) {
                    if (feature.properties.name) {
                        popupContent += `<strong>Name:</strong> ${feature.properties.name}<br>`;
                    }
                    if (feature.properties.description) {
                        popupContent += `<strong>Description:</strong> ${feature.properties.description}<br>`;
                    }

                    Object.keys(feature.properties).forEach(key => {
                        if (key !== 'name' && key !== 'description' && feature.properties[key]) {
                            popupContent += `<strong>${key}:</strong> ${feature.properties[key]}<br>`;
                        }
                    });
                }

                layer.bindPopup(popupContent);
            }
        });

        // Add new layer to map
        newLayer.addTo(this.map);
        layerInfo.layer = newLayer;


    }
    

}

// Initialize the application when the page loads
let kmlVisualizer;
document.addEventListener('DOMContentLoaded', () => {
    kmlVisualizer = new KMLVisualizer();
});

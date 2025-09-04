// Updated useProjectData.js - Removed phases, updated structure
import { useState, useCallback } from 'react';
import { INITIAL_PROJECT_DATA } from '../utils/constants';

export const useProjectData = () => {
  const [projectData, setProjectData] = useState(INITIAL_PROJECT_DATA);

  const updateProjectData = useCallback((updates) => {
    setProjectData(prev => ({
      ...prev,
      ...updates,
      lastSaved: Date.now(),
      isDirty: true
    }));
  }, []);

  const updateStep = useCallback((step, data) => {
    setProjectData(prev => ({
      ...prev,
      [step]: { ...prev[step], ...data },
      lastSaved: Date.now(),
      isDirty: true
    }));
  }, []);

  const updateTower = useCallback((towerId, towerData) => {
    setProjectData(prev => ({
      ...prev,
      towers: prev.towers.map(tower => 
        tower.id === towerId ? { ...tower, ...towerData } : tower
      ),
      lastSaved: Date.now(),
      isDirty: true
    }));
  }, []);

  const addTower = useCallback((towerData) => {
    const newTowerId = `tower-${Date.now()}`;
    const newTower = {
      id: newTowerId,
      ...towerData,
      wings: towerData.wings || []
    };

    setProjectData(prev => ({
      ...prev,
      towers: [...prev.towers, newTower],
      lastSaved: Date.now(),
      isDirty: true
    }));

    return newTowerId;
  }, []);

  const removeTower = useCallback((towerId) => {
    setProjectData(prev => ({
      ...prev,
      towers: prev.towers.filter(tower => tower.id !== towerId),
      lastSaved: Date.now(),
      isDirty: true
    }));
  }, []);

  const updateWing = useCallback((towerId, wingId, wingData) => {
    setProjectData(prev => ({
      ...prev,
      towers: prev.towers.map(tower => 
        tower.id === towerId 
          ? {
              ...tower,
              wings: tower.wings.map(wing => 
                wing.id === wingId ? { ...wing, ...wingData } : wing
              )
            }
          : tower
      ),
      lastSaved: Date.now(),
      isDirty: true
    }));
  }, []);

  const addWingToTower = useCallback((towerId, wingData) => {
    const newWingId = `wing-${Date.now()}`;
    const newWing = {
      id: newWingId,
      ...wingData
    };

    setProjectData(prev => ({
      ...prev,
      towers: prev.towers.map(tower => 
        tower.id === towerId 
          ? { ...tower, wings: [...tower.wings, newWing] }
          : tower
      ),
      lastSaved: Date.now(),
      isDirty: true
    }));

    return newWingId;
  }, []);

  const removeWingFromTower = useCallback((towerId, wingId) => {
    setProjectData(prev => ({
      ...prev,
      towers: prev.towers.map(tower => 
        tower.id === towerId 
          ? { ...tower, wings: tower.wings.filter(wing => wing.id !== wingId) }
          : tower
      ),
      lastSaved: Date.now(),
      isDirty: true
    }));
  }, []);

  const updateFloorConfiguration = useCallback((towerId, wingId, floorType, configData) => {
    const configKey = `${towerId}-${wingId}-${floorType}`;
    
    setProjectData(prev => ({
      ...prev,
      floorConfigurations: {
        ...prev.floorConfigurations,
        [configKey]: configData
      },
      lastSaved: Date.now(),
      isDirty: true
    }));
  }, []);

  const getFloorConfiguration = useCallback((towerId, wingId, floorType) => {
    const configKey = `${towerId}-${wingId}-${floorType}`;
    return projectData.floorConfigurations[configKey] || {};
  }, [projectData.floorConfigurations]);

  const resetProjectData = useCallback(() => {
    setProjectData(INITIAL_PROJECT_DATA);
  }, []);

  const saveProjectData = useCallback(() => {
    // Simulate save to backend/localStorage
    console.log('Saving project data:', projectData);
    setProjectData(prev => ({
      ...prev,
      lastSaved: Date.now(),
      isDirty: false
    }));
    return Promise.resolve();
  }, [projectData]);

  const loadProjectData = useCallback((data) => {
    setProjectData({
      ...INITIAL_PROJECT_DATA,
      ...data,
      lastSaved: Date.now(),
      isDirty: false
    });
  }, []);

  // Helper functions
  const getTotalWings = useCallback(() => {
    return projectData.towers.reduce((total, tower) => total + tower.wings.length, 0);
  }, [projectData.towers]);

  const getTotalFloors = useCallback(() => {
    let total = 0;
    projectData.towers.forEach(tower => {
      tower.wings.forEach(wing => {
        Object.values(wing.floorTypes || {}).forEach(floorType => {
          if (floorType.enabled) {
            total += floorType.count;
          }
        });
      });
    });
    return total;
  }, [projectData.towers]);

  return {
    projectData,
    updateProjectData,
    updateStep,
    updateTower,
    addTower,
    removeTower,
    updateWing,
    addWingToTower,
    removeWingFromTower,
    updateFloorConfiguration,
    getFloorConfiguration,
    resetProjectData,
    saveProjectData,
    loadProjectData,
    // Helper functions
    getTotalWings,
    getTotalFloors
  };
};
export const generateProjectJSON = (projectData) => {
  return {
    project: {
      name: projectData.projectName,
      code: projectData.projectCode,
      type: projectData.projectType,
      location: {
        address: projectData.address,
        city: projectData.city,
        state: projectData.state,
        pincode: projectData.pincode,
      },
      dates: {
        start: projectData.startDate,
        end: projectData.endDate,
      },
      manager: projectData.manager,
      towers: generateTowersJSON(projectData.towers),
      units: generateUnitsJSON(projectData.units),
      amenities: generateAmenitiesJSON(projectData.amenities),
      floorConfigurations: projectData.floorConfigurations,
      statistics: generateStatsJSON(projectData)
    },
  };
};

const generateTowersJSON = (towers) => {
  if (!towers) return [];

  return towers.map(tower => ({
    id: tower.id,
    name: tower.name || tower.customName,
    wings: tower.wings?.map(wing => ({
      id: wing.id,
      name: wing.name,
      type: wing.type,
      lifts: wing.lifts,
      floorTypes: wing.floorTypes
    })) || []
  }));
};

const generateUnitsJSON = (units) => {
  if (!units) return {};

  const processedUnits = {};
  
  Object.entries(units).forEach(([floorKey, floorUnits]) => {
    processedUnits[floorKey] = floorUnits.map(unit => ({
      id: unit.id,
      type: unit.type,
      carpetArea: unit.carpetArea,
      builtUpArea: unit.builtUpArea,
      balconies: unit.balconies,
      balconyArea: unit.balconyArea,
      washrooms: {
        attached: unit.attachedWashrooms,
        common: unit.commonWashrooms
      },
      facing: unit.facing,
      status: unit.status,
      ...(unit.frontage && { frontage: unit.frontage }),
      ...(unit.monthlyRent && { monthlyRent: unit.monthlyRent }),
      ...(unit.parkingSpaces && { parkingSpaces: unit.parkingSpaces })
    }));
  });

  return processedUnits;
};

const generateStatsJSON = (projectData) => {
  const stats = {
    totalTowers: projectData.towers?.length || 0,
    totalWings: 0,
    totalFloors: 0,
    totalUnits: 0,
    totalCarpetArea: 0,
    unitBreakdown: {},
    parkingSpaces: 0
  };

  // Calculate from towers
  projectData.towers?.forEach(tower => {
    stats.totalWings += tower.wings?.length || 0;
    tower.wings?.forEach(wing => {
      Object.values(wing.floorTypes || {}).forEach(floorType => {
        if (floorType.enabled) {
          stats.totalFloors += floorType.count;
        }
      });
    });
  });

  // Calculate from units
  Object.values(projectData.units || {}).forEach(floorUnits => {
    floorUnits.forEach(unit => {
      stats.totalUnits++;
      stats.totalCarpetArea += unit.carpetArea || 0;
      stats.unitBreakdown[unit.type] = (stats.unitBreakdown[unit.type] || 0) + 1;
    });
  });

  // Calculate parking
  if (projectData.amenities?.parking) {
    const parking = projectData.amenities.parking;
    stats.parkingSpaces = (parking.covered?.cars || 0) + (parking.open?.cars || 0) + (parking.visitor?.cars || 0);
  }

  return stats;
};

const generateAmenitiesJSON = (amenities) => {
  if (!amenities) return {};

  return {
    recreational: amenities.recreational || {},
    security: amenities.security || {},
    utilities: amenities.utilities || {},
    maintenance: amenities.maintenance || {},
    parking: {
      covered: amenities.parking?.covered || { cars: 0, bikes: 0 },
      open: amenities.parking?.open || { cars: 0, bikes: 0 },
      visitor: amenities.parking?.visitor || { cars: 0, bikes: 0 },
      evCharging: amenities.parking?.evCharging || { enabled: false }
    },
  };
};

export const downloadJSON = (data, filename = "project-data.json") => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const copyToClipboard = async (data) => {
  const jsonString = JSON.stringify(data, null, 2);

  try {
    await navigator.clipboard.writeText(jsonString);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = jsonString;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    return true;
  }
};

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
      floorConfigurations: projectData.floorConfigurations,
      flatNumberingType: projectData.flatNumberingType,
      customTemplates: projectData.customTemplates,
      statistics: generateStatsJSON(projectData),
    },
  };
};

const generateTowersJSON = (towers) => {
  if (!towers) return [];

  return towers.map((tower) => ({
    id: tower.id,
    name: tower.name || tower.customName,
    wings:
      tower.wings?.map((wing) => ({
        id: wing.id,
        name: wing.name,
        type: wing.type,
        lifts: wing.lifts,
        floorTypes: wing.floorTypes,
      })) || [],
  }));
};

const generateUnitsJSON = (units) => {
  if (!units) return {};

  const processedUnits = {};

  Object.entries(units).forEach(([floorKey, floorUnits]) => {
    processedUnits[floorKey] = (
      Array.isArray(floorUnits) ? floorUnits : []
    ).map((unit) => ({
      id: unit.id,
      type: unit.type,
      templateName: unit.templateName,
      carpetArea: unit.carpetArea,
      builtUpArea: unit.builtUpArea,
      balconies: unit.balconies,
      balconyArea: unit.balconyArea,
      washrooms: {
        attached: unit.attachedWashrooms,
        common: unit.commonWashrooms,
      },
      facing: unit.facing,
      status: unit.status,
      roomLayout: unit.roomLayout,
      ...(unit.frontage && { frontage: unit.frontage }),
      ...(unit.monthlyRent && { monthlyRent: unit.monthlyRent }),
      ...(unit.parkingSpaces && { parkingSpaces: unit.parkingSpaces }),
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
    totalBuiltUpArea: 0,
    unitBreakdown: {},
    roomBreakdown: {},
    floorTypeBreakdown: {},
    parkingSpaces: 0,
    templatesUsed: 0,
    unitsWithLayouts: 0,
  };

  // Calculate from towers
  projectData.towers?.forEach((tower) => {
    stats.totalWings += tower.wings?.length || 0;
    tower.wings?.forEach((wing) => {
      Object.values(wing.floorTypes || {}).forEach((floorType) => {
        if (floorType.enabled) {
          stats.totalFloors += floorType.count;
          const floorTypeName = floorType.name || "Unknown";
          stats.floorTypeBreakdown[floorTypeName] =
            (stats.floorTypeBreakdown[floorTypeName] || 0) + floorType.count;
        }
      });
    });
  });

  // Calculate from units
  Object.values(projectData.units || {}).forEach((floorUnits) => {
    if (!Array.isArray(floorUnits)) return;

    floorUnits.forEach((unit) => {
      stats.totalUnits++;
      stats.totalCarpetArea += unit.carpetArea || 0;
      stats.totalBuiltUpArea += unit.builtUpArea || 0;
      stats.unitBreakdown[unit.type] =
        (stats.unitBreakdown[unit.type] || 0) + 1;

      // Count templates
      if (unit.templateName) {
        stats.templatesUsed++;
      }

      // Count units with room layouts
      if (
        unit.roomLayout &&
        unit.roomLayout.children &&
        unit.roomLayout.children.length > 0
      ) {
        stats.unitsWithLayouts++;

        // Count rooms recursively
        const countRooms = (rooms) => {
          rooms.forEach((room) => {
            const roomType = room.type || "unknown";
            stats.roomBreakdown[roomType] =
              (stats.roomBreakdown[roomType] || 0) + 1;
            if (room.children && room.children.length > 0) {
              countRooms(room.children);
            }
          });
        };
        countRooms(unit.roomLayout.children);
      }
    });
  });

  return stats;
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

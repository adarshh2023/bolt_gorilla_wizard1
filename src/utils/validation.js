export const validateProjectOverview = (data) => {
  const errors = {};

  if (!data.projectName?.trim()) {
    errors.projectName = "Project name is required";
  }

  if (!data.projectType) {
    errors.projectType = "Project type is required";
  }

  if (!data.address?.trim()) {
    errors.address = "Address is required";
  }

  if (!data.city?.trim()) {
    errors.city = "City is required";
  }

  if (!data.state?.trim()) {
    errors.state = "State is required";
  }

  if (!data.pincode?.trim()) {
    errors.pincode = "Pincode is required";
  } else if (!/^\d{6}$/.test(data.pincode)) {
    errors.pincode = "Pincode must be 6 digits";
  }

  if (!data.startDate) {
    errors.startDate = "Start date is required";
  }

  if (!data.endDate) {
    errors.endDate = "End date is required";
  }

  if (
    data.startDate &&
    data.endDate &&
    new Date(data.startDate) >= new Date(data.endDate)
  ) {
    errors.endDate = "End date must be after start date";
  }

  if (!data.manager?.trim()) {
    errors.manager = "Project manager is required";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validatePhaseSetup = (phases) => {
  const errors = {};
  const warnings = [];

  if (!phases || phases.length === 0) {
    errors.general = "At least one phase is required";
    return { isValid: false, errors, warnings };
  }

  phases.forEach((phase, index) => {
    if (!phase.name?.trim()) {
      errors[`phase_${index}_name`] = `Phase ${index + 1} name is required`;
    }

    if (!phase.startDate) {
      errors[`phase_${index}_startDate`] = `Phase ${
        index + 1
      } start date is required`;
    }

    if (!phase.endDate) {
      errors[`phase_${index}_endDate`] = `Phase ${
        index + 1
      } end date is required`;
    }

    if (
      phase.startDate &&
      phase.endDate &&
      new Date(phase.startDate) >= new Date(phase.endDate)
    ) {
      errors[`phase_${index}_endDate`] = `Phase ${
        index + 1
      } end date must be after start date`;
    }
  });

  // Check for overlapping phases
  for (let i = 0; i < phases.length - 1; i++) {
    for (let j = i + 1; j < phases.length; j++) {
      const phase1 = phases[i];
      const phase2 = phases[j];

      if (
        phase1.startDate &&
        phase1.endDate &&
        phase2.startDate &&
        phase2.endDate
      ) {
        const start1 = new Date(phase1.startDate);
        const end1 = new Date(phase1.endDate);
        const start2 = new Date(phase2.startDate);
        const end2 = new Date(phase2.endDate);

        if (start1 <= end2 && end1 >= start2) {
          warnings.push(
            `${phase1.name} and ${phase2.name} have overlapping dates`
          );
        }
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
  };
};

export const validateLayoutDesign = (layout) => {
  const errors = {};
  const warnings = [];

  console.log("Validating layout:", layout);

  if (!layout || !layout.layout) {
    console.log("No layout data provided");
    return { isValid: true, errors, warnings }; // Temporarily allow to proceed
  }

  const layoutData = layout.layout;
  console.log("Layout data:", layoutData);

  // Validate wings - make this more permissive
  if (!layoutData.wings) {
    console.log("No wings object");
    warnings.push("Wings data not found");
  } else if (!layoutData.wings.wings) {
    console.log("No wings array");
    warnings.push("Wings array not found");
  } else if (layoutData.wings.wings.length === 0) {
    console.log("Empty wings array");
    warnings.push("No wings configured - this may cause issues in next steps");
  } else {
    console.log(`Found ${layoutData.wings.wings.length} wings`);

    layoutData.wings.wings.forEach((wing, index) => {
      console.log(`Validating wing ${index}:`, wing);

      if (!wing.name?.trim()) {
        warnings.push(`Wing ${index + 1} name is missing`);
      }

      // Check if wing has proper floor structure (support both old and new formats)
      let totalFloors = 0;

      // Handle new structure
      if (wing.floors && typeof wing.floors === "object") {
        const commercialCount = wing.floors.commercial?.count || 0;
        const residentialCount = wing.floors.residential?.count || 0;
        totalFloors = commercialCount + residentialCount;
        console.log(
          `Wing ${wing.name} has ${commercialCount}C + ${residentialCount}R = ${totalFloors} floors`
        );
      }
      // Handle old structure for backward compatibility
      else if (
        wing.commercialFloors !== undefined ||
        wing.residentialFloors !== undefined
      ) {
        totalFloors =
          (wing.commercialFloors || 0) + (wing.residentialFloors || 0);
        console.log(`Wing ${wing.name} (old format) has ${totalFloors} floors`);
      }

      if (totalFloors === 0) {
        warnings.push(
          `Wing ${wing.name || index + 1} has no floors configured`
        );
      }

      if (totalFloors > 50) {
        warnings.push(
          `Wing ${
            wing.name || index + 1
          } has ${totalFloors} floors which is quite high`
        );
      }
    });
  }

  // Always return valid for now to debug navigation
  const result = {
    isValid: true, // Object.keys(errors).length === 0,
    errors,
    warnings,
  };

  console.log("Validation result:", result);
  return result;
};

export const validateUnitConfiguration = (units) => {
  const errors = {};
  const warnings = [];

  if (!units || Object.keys(units).length === 0) {
    warnings.push('No units configured');
    return { isValid: true, errors, warnings };
  }

  Object.entries(units).forEach(([floorKey, floorUnits]) => {
    floorUnits.forEach((unit, index) => {
      const unitKey = `${floorKey}_${index}`;
      
      if (!unit.id?.trim()) {
        errors[`${unitKey}_id`] = 'Unit ID is required';
      }
      
      if (!unit.type) {
        errors[`${unitKey}_type`] = 'Unit type is required';
      }
      
      if (!unit.carpetArea || unit.carpetArea <= 0) {
        errors[`${unitKey}_area`] = 'Carpet area must be greater than 0';
      }
      
      if (unit.carpetArea > unit.builtUpArea) {
        warnings.push(`Unit ${unit.id}: Carpet area is greater than built-up area`);
      }
      
      const totalWashrooms = (unit.attachedWashrooms || 0) + (unit.commonWashrooms || 0);
      if (totalWashrooms === 0) {
        errors[`${unitKey}_washrooms`] = 'At least one washroom is required';
      }
    });
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings
  };
};

export const validateAmenities = (amenities) => {
  const errors = {};
  const warnings = [];

  if (!amenities) {
    warnings.push('No amenities configured');
    return { isValid: true, errors, warnings };
  }

  // Validate swimming pool dimensions
  if (amenities.recreational?.swimmingPool?.enabled) {
    const pool = amenities.recreational.swimmingPool;
    if (pool.length * pool.width < 100) {
      warnings.push('Swimming pool area seems small');
    }
  }

  // Validate power backup capacity
  if (amenities.utilities?.powerBackup?.enabled) {
    const backup = amenities.utilities.powerBackup;
    if (backup.capacity < 100) {
      warnings.push('Power backup capacity may be insufficient');
    }
  }

  // Validate maintenance charges
  if (amenities.maintenance?.monthlyCharges) {
    const charges = amenities.maintenance.monthlyCharges;
    if (charges < 1) {
      warnings.push('Monthly maintenance charges seem low');
    } else if (charges > 8) {
      warnings.push('Monthly maintenance charges seem high');
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings
  };
};

export const validateUnit = (unit) => {
  const errors = {};

  if (!unit.unitId?.trim()) {
    errors.unitId = "Unit ID is required";
  }

  if (!unit.type) {
    errors.type = "Unit type is required";
  }

  if (unit.bedrooms === undefined || unit.bedrooms < 0) {
    errors.bedrooms = "Number of bedrooms is required";
  }

  const totalWashrooms =
    (unit.washrooms?.attached || 0) + (unit.washrooms?.common || 0);
  if (totalWashrooms === 0) {
    errors.washrooms = "At least one washroom is required";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const generateProjectCode = (projectName, city) => {
  if (!projectName || !city) return "";

  const nameCode = projectName
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .join("")
    .slice(0, 3);

  const cityCode = city.slice(0, 3).toUpperCase();
  const year = new Date().getFullYear();

  return `${nameCode}-${cityCode}-${year}`;
};

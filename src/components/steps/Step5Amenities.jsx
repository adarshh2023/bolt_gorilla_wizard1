import React, { useState, useEffect } from 'react';
import { Waves,Settings, Dumbbell, Users, Shield, Zap, Droplets, Recycle, Car, Wifi, TreePine } from 'lucide-react';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import StepNavigation from '../wizard/StepNavigation';
import ValidationSummary from '../wizard/ValidationSummary';

const Step5Amenities = ({ 
  data, 
  onUpdate, 
  onNext,
  onPrevious,
  onSave
}) => {
  const [amenities, setAmenities] = useState(() => ({
    recreational: {
      swimmingPool: {
        enabled: false,
        type: 'Adults',
        length: 25,
        width: 12,
        depth: 4,
        features: []
      },
      gymnasium: {
        enabled: false,
        area: 1500,
        equipmentBudget: 500000,
        features: []
      },
      clubhouse: {
        enabled: false,
        area: 2000,
        facilities: []
      },
      garden: {
        enabled: false,
        area: 5000,
        features: []
      },
      playArea: {
        enabled: false,
        area: 800,
        ageGroups: []
      },
      sports: {
        enabled: false,
        facilities: []
      }
    },
    security: {
      cctv: {
        enabled: false,
        cameras: 50,
        coverage: '24x7',
        storage: '30 days'
      },
      securityGuards: {
        enabled: false,
        shifts: '24x7',
        count: 6,
        training: 'Basic'
      },
      accessControl: {
        enabled: false,
        type: 'Card + Biometric',
        locations: []
      },
      intercom: {
        enabled: false,
        type: 'Video',
        coverage: 'All units'
      }
    },
    utilities: {
      powerBackup: {
        enabled: false,
        capacity: 500,
        type: 'DG Set',
        coverage: '100%',
        fuelType: 'Diesel'
      },
      waterSupply: {
        sources: [],
        storageCapacity: 100000,
        treatment: false,
        recycling: false
      },
      sewageManagement: {
        stp: false,
        capacity: 50000,
        treatment: 'Tertiary',
        reuse: false
      },
      wasteManagement: {
        segregation: false,
        composting: false,
        recycling: false,
        collection: 'Daily'
      },
      internet: {
        enabled: false,
        provider: 'Fiber',
        speed: '100 Mbps',
        coverage: 'All units'
      }
    },
    maintenance: {
      managementCompany: '',
      monthlyCharges: 3,
      sinkingFund: 10,
      maintenanceScope: [],
      emergencyFund: 5
    },
    parking: {
      covered: {
        cars: 0,
        bikes: 0
      },
      open: {
        cars: 0,
        bikes: 0
      },
      visitor: {
        cars: 0,
        bikes: 0
      },
      valet: false,
      evCharging: {
        enabled: false,
        stations: 0,
        type: 'AC'
      }
    },
    ...data.amenities
  }));

  const [validationResult, setValidationResult] = useState({ isValid: true, errors: {}, warnings: [] });
  const [expandedSections, setExpandedSections] = useState({
    recreational: true,
    security: false,
    utilities: false,
    maintenance: false,
    parking: false
  });

  useEffect(() => {
    // Validate amenities configuration
    const errors = {};
    const warnings = [];

    // Check if swimming pool dimensions are reasonable
    if (amenities.recreational.swimmingPool.enabled) {
      const poolArea = amenities.recreational.swimmingPool.length * amenities.recreational.swimmingPool.width;
      if (poolArea < 100) {
        warnings.push('Swimming pool area seems small for a residential project');
      }
    }

    // Check power backup capacity
    if (amenities.utilities.powerBackup.enabled && amenities.utilities.powerBackup.capacity < 100) {
      warnings.push('Power backup capacity may be insufficient for the project size');
    }

    // Check parking ratios
    const totalUnits = Object.values(data.units || {}).reduce((sum, floorUnits) => sum + floorUnits.length, 0);
    const totalParkingSpaces = amenities.parking.covered.cars + amenities.parking.open.cars;
    
    if (totalUnits > 0 && totalParkingSpaces > 0) {
      const parkingRatio = totalParkingSpaces / totalUnits;
      if (parkingRatio < 0.8) {
        warnings.push(`Parking ratio (${parkingRatio.toFixed(2)}) is below recommended 0.8 spaces per unit`);
      }
    }

    setValidationResult({
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings
    });
  }, [amenities, data.units]);

  const updateAmenity = (section, subsection, field, value) => {
    setAmenities(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: value
        }
      }
    }));
  };

  const updateArrayField = (section, subsection, field, value, checked) => {
    setAmenities(prev => {
      const currentArray = prev[section][subsection][field] || [];
      const updatedArray = checked 
        ? [...currentArray, value]
        : currentArray.filter(item => item !== value);
      
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [subsection]: {
            ...prev[section][subsection],
            [field]: updatedArray
          }
        }
      };
    });
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const loadPresetAmenities = (preset) => {
    const presets = {
      luxury: {
        recreational: {
          swimmingPool: { enabled: true, type: 'Infinity', length: 30, width: 15, depth: 5, features: ['Infinity Edge', 'Underwater Lighting', 'Pool Deck'] },
          gymnasium: { enabled: true, area: 2500, equipmentBudget: 1000000, features: ['Cardio Zone', 'Weight Training', 'Yoga Studio', 'Steam Room'] },
          clubhouse: { enabled: true, area: 3000, facilities: ['Banquet Hall', 'Library', 'Business Center', 'Café'] },
          garden: { enabled: true, area: 8000, features: ['Landscaped Garden', 'Walking Track', 'Meditation Zone', 'Outdoor Seating'] },
          playArea: { enabled: true, area: 1200, ageGroups: ['Toddlers (2-5)', 'Kids (6-12)'] },
          sports: { enabled: true, facilities: ['Badminton Court', 'Tennis Court', 'Basketball Court'] }
        },
        security: {
          cctv: { enabled: true, cameras: 100, coverage: '24x7', storage: '60 days' },
          securityGuards: { enabled: true, shifts: '24x7', count: 12, training: 'Advanced' },
          accessControl: { enabled: true, type: 'Card + Biometric', locations: ['Main Gate', 'Tower Entrance', 'Amenity Areas'] },
          intercom: { enabled: true, type: 'Video', coverage: 'All units' }
        },
        utilities: {
          powerBackup: { enabled: true, capacity: 1000, type: 'Both', coverage: '100%', fuelType: 'Diesel' },
          waterSupply: { sources: ['Bore Well', 'Municipal', 'Rainwater Harvesting'], storageCapacity: 200000, treatment: true, recycling: true },
          sewageManagement: { stp: true, capacity: 100000, treatment: 'Tertiary', reuse: true },
          wasteManagement: { segregation: true, composting: true, recycling: true, collection: 'Twice Daily' },
          internet: { enabled: true, provider: 'Fiber', speed: '1 Gbps', coverage: 'All units' }
        }
      },
      standard: {
        recreational: {
          swimmingPool: { enabled: true, type: 'Adults', length: 25, width: 12, depth: 4, features: ['Pool Deck'] },
          gymnasium: { enabled: true, area: 1500, equipmentBudget: 500000, features: ['Cardio Zone', 'Weight Training'] },
          clubhouse: { enabled: true, area: 1500, facilities: ['Community Hall', 'Library'] },
          garden: { enabled: true, area: 3000, features: ['Landscaped Garden', 'Walking Track'] },
          playArea: { enabled: true, area: 600, ageGroups: ['Kids (6-12)'] },
          sports: { enabled: false, facilities: [] }
        },
        security: {
          cctv: { enabled: true, cameras: 50, coverage: '24x7', storage: '30 days' },
          securityGuards: { enabled: true, shifts: '24x7', count: 6, training: 'Basic' },
          accessControl: { enabled: true, type: 'Card Based', locations: ['Main Gate', 'Tower Entrance'] },
          intercom: { enabled: true, type: 'Audio', coverage: 'All units' }
        },
        utilities: {
          powerBackup: { enabled: true, capacity: 500, type: 'DG Set', coverage: '100%', fuelType: 'Diesel' },
          waterSupply: { sources: ['Bore Well', 'Municipal'], storageCapacity: 100000, treatment: false, recycling: false },
          sewageManagement: { stp: true, capacity: 50000, treatment: 'Secondary', reuse: false },
          wasteManagement: { segregation: true, composting: false, recycling: false, collection: 'Daily' },
          internet: { enabled: true, provider: 'Fiber', speed: '100 Mbps', coverage: 'All units' }
        }
      },
      basic: {
        recreational: {
          swimmingPool: { enabled: false },
          gymnasium: { enabled: true, area: 800, equipmentBudget: 200000, features: ['Basic Equipment'] },
          clubhouse: { enabled: true, area: 800, facilities: ['Community Hall'] },
          garden: { enabled: true, area: 2000, features: ['Basic Landscaping'] },
          playArea: { enabled: true, area: 400, ageGroups: ['Kids (6-12)'] },
          sports: { enabled: false, facilities: [] }
        },
        security: {
          cctv: { enabled: true, cameras: 25, coverage: '12 hours', storage: '15 days' },
          securityGuards: { enabled: true, shifts: 'Day + Night', count: 4, training: 'Basic' },
          accessControl: { enabled: false },
          intercom: { enabled: true, type: 'Audio', coverage: 'All units' }
        },
        utilities: {
          powerBackup: { enabled: true, capacity: 250, type: 'DG Set', coverage: '80%', fuelType: 'Diesel' },
          waterSupply: { sources: ['Municipal'], storageCapacity: 50000, treatment: false, recycling: false },
          sewageManagement: { stp: false },
          wasteManagement: { segregation: false, composting: false, recycling: false, collection: 'Daily' },
          internet: { enabled: true, provider: 'Broadband', speed: '50 Mbps', coverage: 'All units' }
        }
      }
    };

    setAmenities(prev => ({
      ...prev,
      ...presets[preset]
    }));
  };

  const calculateMaintenanceCharges = () => {
    let baseCharge = 2; // ₹2 per sq ft base
    
    // Add charges based on amenities
    if (amenities.recreational.swimmingPool.enabled) baseCharge += 0.5;
    if (amenities.recreational.gymnasium.enabled) baseCharge += 0.3;
    if (amenities.recreational.clubhouse.enabled) baseCharge += 0.4;
    if (amenities.security.securityGuards.enabled) baseCharge += 0.8;
    if (amenities.utilities.powerBackup.enabled) baseCharge += 0.6;
    
    return Math.round(baseCharge * 100) / 100;
  };

  const handleNext = () => {
    if (validationResult.isValid) {
      onUpdate({ amenities });
      onNext();
    }
  };

  const handleSave = () => {
    onUpdate({ amenities });
    onSave?.({ amenities });
  };

  const SectionCard = ({ title, icon: Icon, section, children, color = "blue" }) => {
    const isExpanded = expandedSections[section];
    const colorClasses = {
      blue: 'from-blue-50 to-cyan-50 border-blue-200 text-blue-800',
      green: 'from-green-50 to-emerald-50 border-green-200 text-green-800',
      purple: 'from-purple-50 to-pink-50 border-purple-200 text-purple-800',
      orange: 'from-orange-50 to-yellow-50 border-orange-200 text-orange-800',
      red: 'from-red-50 to-pink-50 border-red-200 text-red-800'
    };

    return (
      <div className={`p-6 bg-gradient-to-r ${colorClasses[color]} rounded-xl border`}>
        <button
          onClick={() => toggleSection(section)}
          className="w-full flex items-center justify-between text-left mb-4"
        >
          <div className="flex items-center space-x-3">
            <Icon className="w-6 h-6" />
            <h4 className="text-lg font-bold">{title}</h4>
          </div>
          <div className="text-sm">
            {isExpanded ? '▼ Collapse' : '▶ Expand'}
          </div>
        </button>
        
        {isExpanded && (
          <div className="animate-slide-up">
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-slide-up">
      <Card className="overflow-hidden">
        <Card.Header>
          <div className="flex items-center justify-between">
            <Card.Title icon={TreePine} gradient>Amenities & Facilities</Card.Title>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => loadPresetAmenities('basic')}>
                Basic Package
              </Button>
              <Button variant="outline" size="sm" onClick={() => loadPresetAmenities('standard')}>
                Standard Package
              </Button>
              <Button variant="outline" size="sm" onClick={() => loadPresetAmenities('luxury')}>
                Luxury Package
              </Button>
            </div>
          </div>
          <Card.Subtitle>
            Configure amenities and facilities that will enhance the living experience and add value to your project.
          </Card.Subtitle>
        </Card.Header>

        <Card.Content>
          <ValidationSummary
            errors={validationResult.errors}
            warnings={validationResult.warnings}
            className="mb-8"
          />

          <div className="space-y-6">
            {/* Recreational Amenities */}
            <SectionCard title="Recreational Amenities" icon={Waves} section="recreational" color="blue">
              <div className="space-y-6">
                {/* Swimming Pool */}
                <div className="p-4 bg-white rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={amenities.recreational.swimmingPool.enabled}
                        onChange={(e) => updateAmenity('recreational', 'swimmingPool', 'enabled', e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded"
                      />
                      <h5 className="font-semibold text-gray-800">Swimming Pool</h5>
                    </div>
                  </div>
                  
                  {amenities.recreational.swimmingPool.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Select
                        label="Pool Type"
                        options={['Adults', 'Kids', 'Infinity', 'Lap Pool', 'Multi-level']}
                        value={amenities.recreational.swimmingPool.type}
                        onChange={(e) => updateAmenity('recreational', 'swimmingPool', 'type', e.target.value)}
                      />
                      <Input.Number
                        label="Length (meters)"
                        value={amenities.recreational.swimmingPool.length}
                        onChange={(e) => updateAmenity('recreational', 'swimmingPool', 'length', parseInt(e.target.value) || 0)}
                        min={10}
                        max={50}
                      />
                      <Input.Number
                        label="Width (meters)"
                        value={amenities.recreational.swimmingPool.width}
                        onChange={(e) => updateAmenity('recreational', 'swimmingPool', 'width', parseInt(e.target.value) || 0)}
                        min={5}
                        max={25}
                      />
                    </div>
                  )}
                </div>

                {/* Gymnasium */}
                <div className="p-4 bg-white rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={amenities.recreational.gymnasium.enabled}
                        onChange={(e) => updateAmenity('recreational', 'gymnasium', 'enabled', e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded"
                      />
                      <h5 className="font-semibold text-gray-800">Gymnasium</h5>
                    </div>
                  </div>
                  
                  {amenities.recreational.gymnasium.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input.Number
                        label="Area (sq ft)"
                        value={amenities.recreational.gymnasium.area}
                        onChange={(e) => updateAmenity('recreational', 'gymnasium', 'area', parseInt(e.target.value) || 0)}
                        min={500}
                        max={5000}
                      />
                      <Input.Number
                        label="Equipment Budget (₹)"
                        value={amenities.recreational.gymnasium.equipmentBudget}
                        onChange={(e) => updateAmenity('recreational', 'gymnasium', 'equipmentBudget', parseInt(e.target.value) || 0)}
                        min={100000}
                        max={2000000}
                      />
                    </div>
                  )}
                </div>

                {/* Other recreational amenities */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Clubhouse */}
                  <div className="p-4 bg-white rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <input
                        type="checkbox"
                        checked={amenities.recreational.clubhouse.enabled}
                        onChange={(e) => updateAmenity('recreational', 'clubhouse', 'enabled', e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded"
                      />
                      <h5 className="font-semibold text-gray-800">Clubhouse</h5>
                    </div>
                    {amenities.recreational.clubhouse.enabled && (
                      <Input.Number
                        label="Area (sq ft)"
                        value={amenities.recreational.clubhouse.area}
                        onChange={(e) => updateAmenity('recreational', 'clubhouse', 'area', parseInt(e.target.value) || 0)}
                        min={800}
                        max={5000}
                      />
                    )}
                  </div>

                  {/* Garden */}
                  <div className="p-4 bg-white rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <input
                        type="checkbox"
                        checked={amenities.recreational.garden.enabled}
                        onChange={(e) => updateAmenity('recreational', 'garden', 'enabled', e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded"
                      />
                      <h5 className="font-semibold text-gray-800">Landscaped Garden</h5>
                    </div>
                    {amenities.recreational.garden.enabled && (
                      <Input.Number
                        label="Area (sq ft)"
                        value={amenities.recreational.garden.area}
                        onChange={(e) => updateAmenity('recreational', 'garden', 'area', parseInt(e.target.value) || 0)}
                        min={1000}
                        max={20000}
                      />
                    )}
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Security Features */}
            <SectionCard title="Security & Safety" icon={Shield} section="security" color="red">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* CCTV */}
                  <div className="p-4 bg-white rounded-lg border border-red-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <input
                        type="checkbox"
                        checked={amenities.security.cctv.enabled}
                        onChange={(e) => updateAmenity('security', 'cctv', 'enabled', e.target.checked)}
                        className="w-5 h-5 text-red-600 rounded"
                      />
                      <h5 className="font-semibold text-gray-800">CCTV Surveillance</h5>
                    </div>
                    {amenities.security.cctv.enabled && (
                      <div className="space-y-3">
                        <Input.Number
                          label="Number of Cameras"
                          value={amenities.security.cctv.cameras}
                          onChange={(e) => updateAmenity('security', 'cctv', 'cameras', parseInt(e.target.value) || 0)}
                          min={10}
                          max={200}
                        />
                        <Select
                          label="Storage Duration"
                          options={['15 days', '30 days', '60 days', '90 days']}
                          value={amenities.security.cctv.storage}
                          onChange={(e) => updateAmenity('security', 'cctv', 'storage', e.target.value)}
                        />
                      </div>
                    )}
                  </div>

                  {/* Security Guards */}
                  <div className="p-4 bg-white rounded-lg border border-red-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <input
                        type="checkbox"
                        checked={amenities.security.securityGuards.enabled}
                        onChange={(e) => updateAmenity('security', 'securityGuards', 'enabled', e.target.checked)}
                        className="w-5 h-5 text-red-600 rounded"
                      />
                      <h5 className="font-semibold text-gray-800">Security Guards</h5>
                    </div>
                    {amenities.security.securityGuards.enabled && (
                      <div className="space-y-3">
                        <Select
                          label="Shift Pattern"
                          options={['24x7', 'Day + Night', 'Day Only', 'Night Only']}
                          value={amenities.security.securityGuards.shifts}
                          onChange={(e) => updateAmenity('security', 'securityGuards', 'shifts', e.target.value)}
                        />
                        <Input.Number
                          label="Total Guards"
                          value={amenities.security.securityGuards.count}
                          onChange={(e) => updateAmenity('security', 'securityGuards', 'count', parseInt(e.target.value) || 0)}
                          min={2}
                          max={20}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Utilities */}
            <SectionCard title="Utilities & Infrastructure" icon={Zap} section="utilities" color="orange">
              <div className="space-y-6">
                {/* Power Backup */}
                <div className="p-4 bg-white rounded-lg border border-orange-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <input
                      type="checkbox"
                      checked={amenities.utilities.powerBackup.enabled}
                      onChange={(e) => updateAmenity('utilities', 'powerBackup', 'enabled', e.target.checked)}
                      className="w-5 h-5 text-orange-600 rounded"
                    />
                    <h5 className="font-semibold text-gray-800">Power Backup</h5>
                  </div>
                  
                  {amenities.utilities.powerBackup.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input.Number
                        label="Capacity (KVA)"
                        value={amenities.utilities.powerBackup.capacity}
                        onChange={(e) => updateAmenity('utilities', 'powerBackup', 'capacity', parseInt(e.target.value) || 0)}
                        min={100}
                        max={2000}
                      />
                      <Select
                        label="Backup Type"
                        options={['DG Set', 'UPS', 'Both', 'Solar + Battery']}
                        value={amenities.utilities.powerBackup.type}
                        onChange={(e) => updateAmenity('utilities', 'powerBackup', 'type', e.target.value)}
                      />
                      <Select
                        label="Coverage"
                        options={['100%', '80%', '60%', 'Essential loads only']}
                        value={amenities.utilities.powerBackup.coverage}
                        onChange={(e) => updateAmenity('utilities', 'powerBackup', 'coverage', e.target.value)}
                      />
                    </div>
                  )}
                </div>

                {/* Water Supply */}
                <div className="p-4 bg-white rounded-lg border border-orange-200">
                  <h5 className="font-semibold text-gray-800 mb-4">💧 Water Supply & Management</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="form-label">Water Sources</label>
                      <div className="space-y-2">
                        {['Municipal', 'Bore Well', 'Rainwater Harvesting', 'Tanker Supply'].map(source => (
                          <label key={source} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={amenities.utilities.waterSupply.sources.includes(source)}
                              onChange={(e) => updateArrayField('utilities', 'waterSupply', 'sources', source, e.target.checked)}
                              className="w-4 h-4 text-orange-600 rounded mr-2"
                            />
                            <span className="text-sm text-gray-700">{source}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Input.Number
                        label="Storage Capacity (Liters)"
                        value={amenities.utilities.waterSupply.storageCapacity}
                        onChange={(e) => updateAmenity('utilities', 'waterSupply', 'storageCapacity', parseInt(e.target.value) || 0)}
                        min={10000}
                        max={500000}
                      />
                      <div className="mt-3 space-y-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={amenities.utilities.waterSupply.treatment}
                            onChange={(e) => updateAmenity('utilities', 'waterSupply', 'treatment', e.target.checked)}
                            className="w-4 h-4 text-orange-600 rounded mr-2"
                          />
                          <span className="text-sm text-gray-700">Water Treatment Plant</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={amenities.utilities.waterSupply.recycling}
                            onChange={(e) => updateAmenity('utilities', 'waterSupply', 'recycling', e.target.checked)}
                            className="w-4 h-4 text-orange-600 rounded mr-2"
                          />
                          <span className="text-sm text-gray-700">Water Recycling System</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sewage Management */}
                <div className="p-4 bg-white rounded-lg border border-orange-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <input
                      type="checkbox"
                      checked={amenities.utilities.sewageManagement.stp}
                      onChange={(e) => updateAmenity('utilities', 'sewageManagement', 'stp', e.target.checked)}
                      className="w-5 h-5 text-orange-600 rounded"
                    />
                    <h5 className="font-semibold text-gray-800">Sewage Treatment Plant (STP)</h5>
                  </div>
                  
                  {amenities.utilities.sewageManagement.stp && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input.Number
                        label="Capacity (Liters/day)"
                        value={amenities.utilities.sewageManagement.capacity}
                        onChange={(e) => updateAmenity('utilities', 'sewageManagement', 'capacity', parseInt(e.target.value) || 0)}
                        min={10000}
                        max={200000}
                      />
                      <Select
                        label="Treatment Level"
                        options={['Primary', 'Secondary', 'Tertiary']}
                        value={amenities.utilities.sewageManagement.treatment}
                        onChange={(e) => updateAmenity('utilities', 'sewageManagement', 'treatment', e.target.value)}
                      />
                      <div className="flex items-center pt-6">
                        <input
                          type="checkbox"
                          checked={amenities.utilities.sewageManagement.reuse}
                          onChange={(e) => updateAmenity('utilities', 'sewageManagement', 'reuse', e.target.checked)}
                          className="w-4 h-4 text-orange-600 rounded mr-2"
                        />
                        <label className="text-sm text-gray-700">Treated Water Reuse</label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </SectionCard>

            {/* Parking */}
            <SectionCard title="Parking & Vehicle Management" icon={Car} section="parking" color="purple">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Covered Parking */}
                  <div className="p-4 bg-white rounded-lg border border-purple-200">
                    <h5 className="font-semibold text-gray-800 mb-3">🏠 Covered Parking</h5>
                    <div className="space-y-3">
                      <Input.Number
                        label="Car Spaces"
                        value={amenities.parking.covered.cars}
                        onChange={(e) => updateAmenity('parking', 'covered', 'cars', parseInt(e.target.value) || 0)}
                        min={0}
                        max={1000}
                      />
                      <Input.Number
                        label="Bike Spaces"
                        value={amenities.parking.covered.bikes}
                        onChange={(e) => updateAmenity('parking', 'covered', 'bikes', parseInt(e.target.value) || 0)}
                        min={0}
                        max={2000}
                      />
                    </div>
                  </div>

                  {/* Open Parking */}
                  <div className="p-4 bg-white rounded-lg border border-purple-200">
                    <h5 className="font-semibold text-gray-800 mb-3">🌤️ Open Parking</h5>
                    <div className="space-y-3">
                      <Input.Number
                        label="Car Spaces"
                        value={amenities.parking.open.cars}
                        onChange={(e) => updateAmenity('parking', 'open', 'cars', parseInt(e.target.value) || 0)}
                        min={0}
                        max={500}
                      />
                      <Input.Number
                        label="Bike Spaces"
                        value={amenities.parking.open.bikes}
                        onChange={(e) => updateAmenity('parking', 'open', 'bikes', parseInt(e.target.value) || 0)}
                        min={0}
                        max={1000}
                      />
                    </div>
                  </div>

                  {/* Visitor Parking */}
                  <div className="p-4 bg-white rounded-lg border border-purple-200">
                    <h5 className="font-semibold text-gray-800 mb-3">👥 Visitor Parking</h5>
                    <div className="space-y-3">
                      <Input.Number
                        label="Car Spaces"
                        value={amenities.parking.visitor.cars}
                        onChange={(e) => updateAmenity('parking', 'visitor', 'cars', parseInt(e.target.value) || 0)}
                        min={0}
                        max={100}
                      />
                      <Input.Number
                        label="Bike Spaces"
                        value={amenities.parking.visitor.bikes}
                        onChange={(e) => updateAmenity('parking', 'visitor', 'bikes', parseInt(e.target.value) || 0)}
                        min={0}
                        max={200}
                      />
                    </div>
                  </div>
                </div>

                {/* EV Charging */}
                <div className="p-4 bg-white rounded-lg border border-purple-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <input
                      type="checkbox"
                      checked={amenities.parking.evCharging.enabled}
                      onChange={(e) => updateAmenity('parking', 'evCharging', 'enabled', e.target.checked)}
                      className="w-5 h-5 text-purple-600 rounded"
                    />
                    <h5 className="font-semibold text-gray-800">EV Charging Stations</h5>
                  </div>
                  
                  {amenities.parking.evCharging.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input.Number
                        label="Number of Stations"
                        value={amenities.parking.evCharging.stations}
                        onChange={(e) => updateAmenity('parking', 'evCharging', 'stations', parseInt(e.target.value) || 0)}
                        min={1}
                        max={50}
                      />
                      <Select
                        label="Charging Type"
                        options={['AC (Slow)', 'DC (Fast)', 'Both']}
                        value={amenities.parking.evCharging.type}
                        onChange={(e) => updateAmenity('parking', 'evCharging', 'type', e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </SectionCard>

            {/* Maintenance */}
            <SectionCard title="Maintenance & Management" icon={Settings} section="maintenance" color="green">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Management Company"
                    value={amenities.maintenance.managementCompany}
                    onChange={(e) => updateAmenity('maintenance', 'managementCompany', '', e.target.value)}
                    placeholder="Property management company name"
                  />
                  
                  <div>
                    <Input.Number
                      label="Monthly Charges (₹ per sq ft)"
                      value={amenities.maintenance.monthlyCharges}
                      onChange={(e) => updateAmenity('maintenance', 'monthlyCharges', '', parseFloat(e.target.value) || 0)}
                      min={1}
                      max={10}
                      step={0.1}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Suggested: ₹{calculateMaintenanceCharges()} per sq ft based on selected amenities
                    </p>
                  </div>
                  
                  <Input.Number
                    label="Sinking Fund (%)"
                    value={amenities.maintenance.sinkingFund}
                    onChange={(e) => updateAmenity('maintenance', 'sinkingFund', '', parseInt(e.target.value) || 0)}
                    min={5}
                    max={25}
                    helperText="Percentage of monthly charges"
                  />
                  
                  <Input.Number
                    label="Emergency Fund (%)"
                    value={amenities.maintenance.emergencyFund}
                    onChange={(e) => updateAmenity('maintenance', 'emergencyFund', '', parseInt(e.target.value) || 0)}
                    min={2}
                    max={15}
                    helperText="Percentage of monthly charges"
                  />
                </div>

                <div>
                  <label className="form-label">Maintenance Scope</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {[
                      'Common Area Cleaning', 'Garden Maintenance', 'Security Services',
                      'Elevator Maintenance', 'Generator Maintenance', 'Swimming Pool Maintenance',
                      'Gym Equipment Maintenance', 'CCTV Maintenance', 'Plumbing Services',
                      'Electrical Services', 'Pest Control', 'Waste Management'
                    ].map(scope => (
                      <label key={scope} className="flex items-center p-2 rounded border border-green-200 hover:bg-green-50">
                        <input
                          type="checkbox"
                          checked={amenities.maintenance.maintenanceScope.includes(scope)}
                          onChange={(e) => updateArrayField('maintenance', 'maintenanceScope', '', scope, e.target.checked)}
                          className="w-4 h-4 text-green-600 rounded mr-2"
                        />
                        <span className="text-sm">{scope}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* Amenities Summary */}
          <div className="mt-10 p-6 bg-gradient-to-r from-gray-900 to-blue-900 text-white rounded-2xl">
            <h4 className="text-xl font-bold mb-4">🎯 Amenities Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-300">
                  {Object.values(amenities.recreational).filter(amenity => amenity.enabled).length}
                </div>
                <div className="text-sm text-gray-300">Recreational Amenities</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-300">
                  {Object.values(amenities.security).filter(feature => feature.enabled).length}
                </div>
                <div className="text-sm text-gray-300">Security Features</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-300">
                  {amenities.parking.covered.cars + amenities.parking.open.cars + amenities.parking.visitor.cars}
                </div>
                <div className="text-sm text-gray-300">Total Car Parking</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-300">
                  ₹{amenities.maintenance.monthlyCharges}
                </div>
                <div className="text-sm text-gray-300">Monthly Charges (per sq ft)</div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <h5 className="font-bold mb-4">💰 Estimated Monthly Costs (for 1000 sq ft unit)</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white/10 p-3 rounded-lg">
                  <p className="font-semibold text-yellow-300">Maintenance</p>
                  <p className="text-xl font-bold">₹{(amenities.maintenance.monthlyCharges * 1000).toLocaleString()}</p>
                </div>
                <div className="bg-white/10 p-3 rounded-lg">
                  <p className="font-semibold text-blue-300">Sinking Fund</p>
                  <p className="text-xl font-bold">₹{Math.round(amenities.maintenance.monthlyCharges * 1000 * amenities.maintenance.sinkingFund / 100).toLocaleString()}</p>
                </div>
                <div className="bg-white/10 p-3 rounded-lg">
                  <p className="font-semibold text-purple-300">Total Monthly</p>
                  <p className="text-xl font-bold">₹{Math.round(amenities.maintenance.monthlyCharges * 1000 * (1 + amenities.maintenance.sinkingFund / 100 + amenities.maintenance.emergencyFund / 100)).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </Card.Content>

        <StepNavigation
          onPrevious={onPrevious}
          onNext={handleNext}
          onSave={handleSave}
          isValid={validationResult.isValid}
          nextLabel="Next: Review & Finalize"
          previousLabel="Back: Unit Configuration"
        />
      </Card>
    </div>
  );
};

export default Step5Amenities;
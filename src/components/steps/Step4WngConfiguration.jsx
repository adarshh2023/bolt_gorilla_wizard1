import React, { useState, useEffect } from 'react';
import { Building2, Plus, Trash2, Copy, Settings, ChevronDown, ChevronRight, Zap, Users, Car } from 'lucide-react';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import StepNavigation from '../wizard/StepNavigation';
import ValidationSummary from '../wizard/ValidationSummary';

const Step4WingConfiguration = ({ 
  data, 
  onUpdate, 
  onNext,
  onPrevious,
  onSave
}) => {
  const [wingConfigs, setWingConfigs] = useState(() => {
    // Initialize wing configurations based on layout data
    const layoutWings = data.layout?.wings?.wings || [];
    
    return layoutWings.map((wing, index) => ({
      id: `wing-${index}`,
      name: wing.name,
      basicInfo: {
        description: '',
        totalFloors: (wing.floors?.commercial?.count || 0) + (wing.floors?.residential?.count || 0),
        commercialFloors: wing.floors?.commercial?.count || 0,
        residentialFloors: wing.floors?.residential?.count || 0,
        commercialType: wing.floors?.commercial?.floorType || 'Office',
        residentialType: wing.floors?.residential?.floorType || 'Apartments'
      },
      floorPlanning: {
        typicalFloorArea: 8000, // sq ft
        coreArea: 1200, // sq ft for elevators, stairs, utilities
        efficiency: 85, // percentage
        ceilingHeight: 10, // feet
        floorToFloorHeight: 12 // feet
      },
      circulation: {
        elevators: {
          passenger: { count: 2, capacity: '13 person', speed: 'Standard' },
          service: { count: 1, capacity: '21 person', speed: 'Standard' },
          fireman: { count: 1, capacity: '13 person', speed: 'Standard' }
        },
        staircases: {
          main: { count: 2, width: 'Standard (1.2m)', fireExit: true },
          emergency: { count: 1, width: 'Wide (1.8m)', fireExit: true },
          service: { count: 1, width: 'Standard (1.2m)', fireExit: false }
        },
        lobbies: {
          groundFloor: { area: 2000, doubleHeight: true, reception: true },
          typical: { area: 400, seating: false, reception: false }
        }
      },
      mechanical: {
        hvac: {
          system: 'Central VRF',
          zones: 'Multi-zone',
          freshAir: 'Dedicated OA system',
          controls: 'Smart thermostat'
        },
        electrical: {
          mainPanel: 'Floor-wise distribution',
          backup: 'Generator + UPS',
          lighting: 'LED with daylight sensors',
          power: '100% power backup'
        },
        plumbing: {
          water: 'Pressurized system',
          drainage: 'Separate storm & sewage',
          hotWater: 'Solar + electric backup',
          firefighting: 'Sprinkler + hydrant'
        }
      },
      sustainability: {
        greenFeatures: [],
        certifications: [],
        energyEfficiency: 'Standard',
        waterManagement: 'Rainwater harvesting'
      },
      compliance: {
        fireNOC: false,
        environmentalClearance: false,
        structuralApproval: false,
        electricalApproval: false
      }
    }));
  });

  const [expandedWings, setExpandedWings] = useState({});
  const [validationResult, setValidationResult] = useState({ isValid: true, errors: {}, warnings: [] });

  useEffect(() => {
    // Validate wing configurations
    const errors = {};
    const warnings = [];

    wingConfigs.forEach((wing, index) => {
      if (!wing.name?.trim()) {
        errors[`wing_${index}_name`] = `Wing ${index + 1} name is required`;
      }

      if (wing.floorPlanning.typicalFloorArea < 1000) {
        errors[`wing_${index}_area`] = `Wing ${wing.name} floor area seems too small`;
      }

      if (wing.floorPlanning.efficiency < 60 || wing.floorPlanning.efficiency > 95) {
        warnings.push(`Wing ${wing.name} efficiency (${wing.floorPlanning.efficiency}%) may need review`);
      }

      if (wing.circulation.elevators.passenger.count < Math.ceil(wing.basicInfo.totalFloors / 12)) {
        warnings.push(`Wing ${wing.name} may need more passenger elevators for ${wing.basicInfo.totalFloors} floors`);
      }
    });

    setValidationResult({
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings
    });
  }, [wingConfigs]);

  const toggleWingExpansion = (wingId, section = 'all') => {
    setExpandedWings(prev => ({
      ...prev,
      [wingId]: {
        ...prev[wingId],
        [section]: !prev[wingId]?.[section]
      }
    }));
  };

  const updateWingConfig = (wingId, section, field, value) => {
    setWingConfigs(prev => prev.map(wing => 
      wing.id === wingId 
        ? {
            ...wing,
            [section]: {
              ...wing[section],
              [field]: value
            }
          }
        : wing
    ));
  };

  const updateNestedWingConfig = (wingId, section, subsection, field, value) => {
    setWingConfigs(prev => prev.map(wing => 
      wing.id === wingId 
        ? {
            ...wing,
            [section]: {
              ...wing[section],
              [subsection]: {
                ...wing[section][subsection],
                [field]: value
              }
            }
          }
        : wing
    ));
  };

  const cloneWingConfig = (wingId) => {
    const wingToClone = wingConfigs.find(w => w.id === wingId);
    if (wingToClone) {
      const cloned = {
        ...wingToClone,
        id: `wing-${Date.now()}`,
        name: `${wingToClone.name} (Copy)`
      };
      setWingConfigs(prev => [...prev, cloned]);
    }
  };

  const handleNext = () => {
    if (validationResult.isValid) {
      onUpdate({ wingConfigurations: wingConfigs });
      onNext();
    }
  };

  const handleSave = () => {
    onUpdate({ wingConfigurations: wingConfigs });
    onSave?.({ wingConfigurations: wingConfigs });
  };

  const CirculationSection = ({ wing, wingId }) => (
    <div className="space-y-6">
      {/* Elevators */}
      <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
        <h6 className="font-bold text-blue-800 mb-4 flex items-center">
          <Zap className="w-5 h-5 mr-2" />
          Elevator Configuration
        </h6>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(wing.circulation.elevators).map(([type, config]) => (
            <div key={type} className="p-4 bg-white rounded-lg border border-blue-200">
              <h7 className="font-semibold text-gray-800 mb-3 capitalize">{type} Elevators</h7>
              <div className="space-y-3">
                <Input.Number
                  label="Count"
                  value={config.count}
                  onChange={(e) => updateNestedWingConfig(wingId, 'circulation', 'elevators', type, {
                    ...config,
                    count: parseInt(e.target.value) || 0
                  })}
                  min={0}
                  max={6}
                />
                <Select
                  label="Capacity"
                  options={['8 person', '13 person', '21 person', '26 person']}
                  value={config.capacity}
                  onChange={(e) => updateNestedWingConfig(wingId, 'circulation', 'elevators', type, {
                    ...config,
                    capacity: e.target.value
                  })}
                />
                <Select
                  label="Speed"
                  options={['Standard', 'High Speed', 'Super High Speed']}
                  value={config.speed}
                  onChange={(e) => updateNestedWingConfig(wingId, 'circulation', 'elevators', type, {
                    ...config,
                    speed: e.target.value
                  })}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Staircases */}
      <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
        <h6 className="font-bold text-green-800 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Staircase Configuration
        </h6>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(wing.circulation.staircases).map(([type, config]) => (
            <div key={type} className="p-4 bg-white rounded-lg border border-green-200">
              <h7 className="font-semibold text-gray-800 mb-3 capitalize">{type} Stairs</h7>
              <div className="space-y-3">
                <Input.Number
                  label="Count"
                  value={config.count}
                  onChange={(e) => updateNestedWingConfig(wingId, 'circulation', 'staircases', type, {
                    ...config,
                    count: parseInt(e.target.value) || 0
                  })}
                  min={0}
                  max={4}
                />
                <Select
                  label="Width"
                  options={['Narrow (0.9m)', 'Standard (1.2m)', 'Wide (1.8m)', 'Extra Wide (2.4m)']}
                  value={config.width}
                  onChange={(e) => updateNestedWingConfig(wingId, 'circulation', 'staircases', type, {
                    ...config,
                    width: e.target.value
                  })}
                />
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.fireExit}
                    onChange={(e) => updateNestedWingConfig(wingId, 'circulation', 'staircases', type, {
                      ...config,
                      fireExit: e.target.checked
                    })}
                    className="w-4 h-4 text-green-600 rounded mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">Fire Exit Compliant</label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lobbies */}
      <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
        <h6 className="font-bold text-purple-800 mb-4 flex items-center">
          <Car className="w-5 h-5 mr-2" />
          Lobby Configuration
        </h6>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-white rounded-lg border border-purple-200">
            <h7 className="font-semibold text-gray-800 mb-3">Ground Floor Lobby</h7>
            <div className="space-y-3">
              <Input.Number
                label="Area (sq ft)"
                value={wing.circulation.lobbies.groundFloor.area}
                onChange={(e) => updateNestedWingConfig(wingId, 'circulation', 'lobbies', 'groundFloor', {
                  ...wing.circulation.lobbies.groundFloor,
                  area: parseInt(e.target.value) || 0
                })}
                min={500}
                max={5000}
              />
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={wing.circulation.lobbies.groundFloor.doubleHeight}
                    onChange={(e) => updateNestedWingConfig(wingId, 'circulation', 'lobbies', 'groundFloor', {
                      ...wing.circulation.lobbies.groundFloor,
                      doubleHeight: e.target.checked
                    })}
                    className="w-4 h-4 text-purple-600 rounded mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">Double Height</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={wing.circulation.lobbies.groundFloor.reception}
                    onChange={(e) => updateNestedWingConfig(wingId, 'circulation', 'lobbies', 'groundFloor', {
                      ...wing.circulation.lobbies.groundFloor,
                      reception: e.target.checked
                    })}
                    className="w-4 h-4 text-purple-600 rounded mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">Reception Desk</label>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg border border-purple-200">
            <h7 className="font-semibold text-gray-800 mb-3">Typical Floor Lobby</h7>
            <div className="space-y-3">
              <Input.Number
                label="Area (sq ft)"
                value={wing.circulation.lobbies.typical.area}
                onChange={(e) => updateNestedWingConfig(wingId, 'circulation', 'lobbies', 'typical', {
                  ...wing.circulation.lobbies.typical,
                  area: parseInt(e.target.value) || 0
                })}
                min={200}
                max={1000}
              />
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={wing.circulation.lobbies.typical.seating}
                    onChange={(e) => updateNestedWingConfig(wingId, 'circulation', 'lobbies', 'typical', {
                      ...wing.circulation.lobbies.typical,
                      seating: e.target.checked
                    })}
                    className="w-4 h-4 text-purple-600 rounded mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">Seating Area</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={wing.circulation.lobbies.typical.reception}
                    onChange={(e) => updateNestedWingConfig(wingId, 'circulation', 'lobbies', 'typical', {
                      ...wing.circulation.lobbies.typical,
                      reception: e.target.checked
                    })}
                    className="w-4 h-4 text-purple-600 rounded mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">Floor Reception</label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const MechanicalSection = ({ wing, wingId }) => (
    <div className="space-y-6">
      {/* HVAC */}
      <div className="p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
        <h6 className="font-bold text-orange-800 mb-4">🌡️ HVAC Systems</h6>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Primary System"
            options={['Central VRF', 'Split AC', 'Chilled Water', 'Package Units', 'Heat Pump']}
            value={wing.mechanical.hvac.system}
            onChange={(e) => updateNestedWingConfig(wingId, 'mechanical', 'hvac', 'system', e.target.value)}
          />
          <Select
            label="Zone Control"
            options={['Single Zone', 'Multi-zone', 'VAV System', 'Individual Control']}
            value={wing.mechanical.hvac.zones}
            onChange={(e) => updateNestedWingConfig(wingId, 'mechanical', 'hvac', 'zones', e.target.value)}
          />
          <Select
            label="Fresh Air System"
            options={['Dedicated OA system', 'Mixed with return air', 'Natural ventilation', 'Energy recovery']}
            value={wing.mechanical.hvac.freshAir}
            onChange={(e) => updateNestedWingConfig(wingId, 'mechanical', 'hvac', 'freshAir', e.target.value)}
          />
          <Select
            label="Controls"
            options={['Manual controls', 'Smart thermostat', 'BMS integrated', 'IoT enabled']}
            value={wing.mechanical.hvac.controls}
            onChange={(e) => updateNestedWingConfig(wingId, 'mechanical', 'hvac', 'controls', e.target.value)}
          />
        </div>
      </div>

      {/* Electrical */}
      <div className="p-6 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-200">
        <h6 className="font-bold text-yellow-800 mb-4">⚡ Electrical Systems</h6>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Distribution"
            options={['Floor-wise distribution', 'Zone-wise distribution', 'Centralized', 'Mixed system']}
            value={wing.mechanical.electrical.mainPanel}
            onChange={(e) => updateNestedWingConfig(wingId, 'mechanical', 'electrical', 'mainPanel', e.target.value)}
          />
          <Select
            label="Backup Power"
            options={['Generator only', 'UPS only', 'Generator + UPS', 'Solar + battery', 'No backup']}
            value={wing.mechanical.electrical.backup}
            onChange={(e) => updateNestedWingConfig(wingId, 'mechanical', 'electrical', 'backup', e.target.value)}
          />
          <Select
            label="Lighting System"
            options={['LED with daylight sensors', 'LED standard', 'Fluorescent', 'Smart LED', 'Mixed lighting']}
            value={wing.mechanical.electrical.lighting}
            onChange={(e) => updateNestedWingConfig(wingId, 'mechanical', 'electrical', 'lighting', e.target.value)}
          />
          <Select
            label="Power Backup Coverage"
            options={['100% power backup', '80% power backup', '50% power backup', 'Essential loads only']}
            value={wing.mechanical.electrical.power}
            onChange={(e) => updateNestedWingConfig(wingId, 'mechanical', 'electrical', 'power', e.target.value)}
          />
        </div>
      </div>

      {/* Plumbing */}
      <div className="p-6 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl border border-teal-200">
        <h6 className="font-bold text-teal-800 mb-4">🚰 Plumbing Systems</h6>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Water Supply"
            options={['Pressurized system', 'Gravity fed', 'Booster pump', 'Combination system']}
            value={wing.mechanical.plumbing.water}
            onChange={(e) => updateNestedWingConfig(wingId, 'mechanical', 'plumbing', 'water', e.target.value)}
          />
          <Select
            label="Drainage System"
            options={['Separate storm & sewage', 'Combined system', 'Vacuum system', 'Gravity drainage']}
            value={wing.mechanical.plumbing.drainage}
            onChange={(e) => updateNestedWingConfig(wingId, 'mechanical', 'plumbing', 'drainage', e.target.value)}
          />
          <Select
            label="Hot Water"
            options={['Solar + electric backup', 'Electric only', 'Gas boiler', 'Heat pump', 'Instant heaters']}
            value={wing.mechanical.plumbing.hotWater}
            onChange={(e) => updateNestedWingConfig(wingId, 'mechanical', 'plumbing', 'hotWater', e.target.value)}
          />
          <Select
            label="Fire Fighting"
            options={['Sprinkler + hydrant', 'Sprinkler only', 'Hydrant only', 'Foam system', 'Gas suppression']}
            value={wing.mechanical.plumbing.firefighting}
            onChange={(e) => updateNestedWingConfig(wingId, 'mechanical', 'plumbing', 'firefighting', e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-slide-up">
      <Card className="overflow-hidden">
        <Card.Header>
          <div className="flex items-center justify-between">
            <Card.Title icon={Building2} gradient>Wing Configuration</Card.Title>
            <div className="text-sm text-gray-600">
              {wingConfigs.length} Wing{wingConfigs.length !== 1 ? 's' : ''} to Configure
            </div>
          </div>
          <Card.Subtitle>
            Configure detailed specifications for each wing including circulation, mechanical systems, 
            and compliance requirements. Each wing can have unique configurations based on its purpose.
          </Card.Subtitle>
        </Card.Header>

        <Card.Content>
          <ValidationSummary
            errors={validationResult.errors}
            warnings={validationResult.warnings}
            className="mb-8"
          />

          <div className="space-y-8">
            {wingConfigs.map((wing, index) => (
              <div key={wing.id} className="step-card">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl flex items-center justify-center font-bold text-lg">
                      {wing.name.charAt(wing.name.length - 1)}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">{wing.name}</h3>
                      <p className="text-sm text-gray-600">
                        {wing.basicInfo.totalFloors} floors ({wing.basicInfo.commercialFloors}C + {wing.basicInfo.residentialFloors}R)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => cloneWingConfig(wing.id)}
                      icon={Copy}
                    >
                      Clone
                    </Button>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input.TextArea
                      label="Wing Description"
                      value={wing.basicInfo.description}
                      onChange={(e) => updateWingConfig(wing.id, 'basicInfo', 'description', e.target.value)}
                      placeholder="Describe this wing's purpose and key features"
                      rows={3}
                    />
                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
                        <h5 className="font-semibold text-gray-800 mb-2">Floor Distribution</h5>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Commercial: {wing.basicInfo.commercialFloors} floors ({wing.basicInfo.commercialType})</p>
                          <p>Residential: {wing.basicInfo.residentialFloors} floors ({wing.basicInfo.residentialType})</p>
                          <p className="font-medium">Total: {wing.basicInfo.totalFloors} floors</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floor Planning */}
                <div className="mb-8">
                  <div 
                    className="flex items-center justify-between cursor-pointer p-2 -m-2 rounded-lg hover:bg-gray-50"
                    onClick={() => toggleWingExpansion(wing.id, 'floorPlanning')}
                  >
                    <h4 className="text-lg font-semibold text-gray-800">Circulation Systems</h4>
                    {expandedWings[wing.id]?.circulation ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </div>
                  
                  {expandedWings[wing.id]?.circulation && (
                    <div className="mt-4 animate-slide-up">
                      <CirculationSection wing={wing} wingId={wing.id} />
                    </div>
                  )}
                </div>

                {/* Mechanical Systems */}
                <div className="mb-8">
                  <div 
                    className="flex items-center justify-between cursor-pointer p-2 -m-2 rounded-lg hover:bg-gray-50"
                    onClick={() => toggleWingExpansion(wing.id, 'mechanical')}
                  >
                    <h4 className="text-lg font-semibold text-gray-800">Mechanical & Electrical Systems</h4>
                    {expandedWings[wing.id]?.mechanical ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </div>
                  
                  {expandedWings[wing.id]?.mechanical && (
                    <div className="mt-4 animate-slide-up">
                      <MechanicalSection wing={wing} wingId={wing.id} />
                    </div>
                  )}
                </div>

                {/* Sustainability & Green Features */}
                <div className="mb-8">
                  <div 
                    className="flex items-center justify-between cursor-pointer p-2 -m-2 rounded-lg hover:bg-gray-50"
                    onClick={() => toggleWingExpansion(wing.id, 'sustainability')}
                  >
                    <h4 className="text-lg font-semibold text-gray-800">Sustainability & Green Features</h4>
                    {expandedWings[wing.id]?.sustainability ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </div>
                  
                  {expandedWings[wing.id]?.sustainability && (
                    <div className="mt-4 p-6 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl border border-green-200 animate-slide-up">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="form-label">Green Building Features</label>
                          <div className="space-y-2">
                            {[
                              'Solar panels', 'Rainwater harvesting', 'STP plant', 'LED lighting',
                              'Energy-efficient HVAC', 'Green roof', 'Natural ventilation', 
                              'Daylight optimization', 'Waste segregation', 'EV charging stations'
                            ].map(feature => (
                              <label key={feature} className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={wing.sustainability.greenFeatures.includes(feature)}
                                  onChange={(e) => {
                                    const features = wing.sustainability.greenFeatures;
                                    const updatedFeatures = e.target.checked 
                                      ? [...features, feature]
                                      : features.filter(f => f !== feature);
                                    updateWingConfig(wing.id, 'sustainability', 'greenFeatures', updatedFeatures);
                                  }}
                                  className="w-4 h-4 text-green-600 rounded mr-2"
                                />
                                <span className="text-sm text-gray-700">{feature}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="form-label">Targeted Certifications</label>
                            <div className="space-y-2">
                              {['LEED', 'BREEAM', 'GRIHA', 'IGBC', 'EDGE'].map(cert => (
                                <label key={cert} className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={wing.sustainability.certifications.includes(cert)}
                                    onChange={(e) => {
                                      const certs = wing.sustainability.certifications;
                                      const updatedCerts = e.target.checked 
                                        ? [...certs, cert]
                                        : certs.filter(c => c !== cert);
                                      updateWingConfig(wing.id, 'sustainability', 'certifications', updatedCerts);
                                    }}
                                    className="w-4 h-4 text-green-600 rounded mr-2"
                                  />
                                  <span className="text-sm text-gray-700">{cert}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <Select
                            label="Energy Efficiency Target"
                            options={['Standard', 'High Efficiency', 'Net Zero', 'Passive House', 'Zero Energy']}
                            value={wing.sustainability.energyEfficiency}
                            onChange={(e) => updateWingConfig(wing.id, 'sustainability', 'energyEfficiency', e.target.value)}
                          />

                          <Select
                            label="Water Management"
                            options={['Standard', 'Rainwater harvesting', 'Greywater recycling', 'Complete water recycling']}
                            value={wing.sustainability.waterManagement}
                            onChange={(e) => updateWingConfig(wing.id, 'sustainability', 'waterManagement', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Compliance & Approvals */}
                <div className="mb-8">
                  <div 
                    className="flex items-center justify-between cursor-pointer p-2 -m-2 rounded-lg hover:bg-gray-50"
                    onClick={() => toggleWingExpansion(wing.id, 'compliance')}
                  >
                    <h4 className="text-lg font-semibold text-gray-800">Compliance & Approvals</h4>
                    {expandedWings[wing.id]?.compliance ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </div>
                  
                  {expandedWings[wing.id]?.compliance && (
                    <div className="mt-4 p-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-200 animate-slide-up">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {Object.entries({
                          fireNOC: 'Fire NOC',
                          environmentalClearance: 'Environmental Clearance',
                          structuralApproval: 'Structural Approval',
                          electricalApproval: 'Electrical Approval'
                        }).map(([key, label]) => (
                          <div key={key} className="flex items-center p-3 bg-white rounded-lg border border-red-200">
                            <input
                              type="checkbox"
                              checked={wing.compliance[key]}
                              onChange={(e) => updateWingConfig(wing.id, 'compliance', key, e.target.checked)}
                              className="w-4 h-4 text-red-600 rounded mr-3"
                            />
                            <label className="text-sm font-medium text-gray-700">{label}</label>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 p-4 bg-white rounded-lg border border-red-200">
                        <h5 className="font-semibold text-red-800 mb-2">📋 Approval Status</h5>
                        <div className="text-sm">
                          {Object.values(wing.compliance).every(status => status) ? (
                            <p className="text-green-700 font-medium">✅ All approvals obtained</p>
                          ) : (
                            <p className="text-red-700">
                              ⚠️ {Object.values(wing.compliance).filter(status => !status).length} approvals pending
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Wing Summary Card */}
                <div className="p-6 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 rounded-xl border border-blue-200">
                  <h5 className="font-bold text-gray-800 mb-4">📊 {wing.name} Configuration Summary</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                    <div>
                      <h6 className="font-semibold text-blue-800 mb-2">📐 Space Planning</h6>
                      <ul className="space-y-1 text-gray-700">
                        <li>Floor Area: {wing.floorPlanning.typicalFloorArea.toLocaleString()} sq ft</li>
                        <li>Efficiency: {wing.floorPlanning.efficiency}%</li>
                        <li>Height: {wing.floorPlanning.floorToFloorHeight * wing.basicInfo.totalFloors} ft</li>
                      </ul>
                    </div>

                    <div>
                      <h6 className="font-semibold text-green-800 mb-2">🚇 Circulation</h6>
                      <ul className="space-y-1 text-gray-700">
                        <li>Elevators: {Object.values(wing.circulation.elevators).reduce((sum, e) => sum + e.count, 0)} total</li>
                        <li>Staircases: {Object.values(wing.circulation.staircases).reduce((sum, s) => sum + s.count, 0)} total</li>
                        <li>Ground Lobby: {wing.circulation.lobbies.groundFloor.area} sq ft</li>
                      </ul>
                    </div>

                    <div>
                      <h6 className="font-semibold text-purple-800 mb-2">🌱 Sustainability</h6>
                      <ul className="space-y-1 text-gray-700">
                        <li>Green Features: {wing.sustainability.greenFeatures.length}</li>
                        <li>Certifications: {wing.sustainability.certifications.join(', ') || 'None'}</li>
                        <li>Energy: {wing.sustainability.energyEfficiency}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Overall Project Summary */}
          <div className="mt-10 p-6 bg-gradient-to-r from-gray-900 to-blue-900 text-white rounded-2xl">
            <h4 className="text-xl font-bold mb-4">🎯 Complete Project Configuration Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-300">
                  {wingConfigs.reduce((sum, wing) => sum + wing.basicInfo.totalFloors, 0)}
                </div>
                <div className="text-sm text-gray-300">Total Floors</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-300">
                  {wingConfigs.reduce((sum, wing) => sum + wing.floorPlanning.typicalFloorArea * wing.basicInfo.totalFloors, 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-300">Total Area (sq ft)</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-300">
                  {wingConfigs.reduce((sum, wing) => sum + Object.values(wing.circulation.elevators).reduce((elevSum, e) => elevSum + e.count, 0), 0)}
                </div>
                <div className="text-sm text-gray-300">Total Elevators</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-300">
                  {Math.round(wingConfigs.reduce((sum, wing) => sum + wing.floorPlanning.efficiency, 0) / wingConfigs.length)}%
                </div>
                <div className="text-sm text-gray-300">Avg Efficiency</div>
              </div>
            </div>
          </div>
        </Card.Content>

        <StepNavigation
          onPrevious={onPrevious}
          onNext={handleNext}
          onSave={handleSave}
          isValid={validationResult.isValid}
          nextLabel="Next: Floor Setup"
          previousLabel="Back: Layout Design"
        />
      </Card>
    </div>
  );
};

export default Step4WingConfiguration;
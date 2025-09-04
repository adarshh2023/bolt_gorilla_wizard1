import React, { useState, useEffect } from 'react';
import { Home, Plus, Trash2, Sparkles, Building2, Settings, ChevronDown, ChevronRight, Edit3, Copy } from 'lucide-react';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import StepNavigation from '../wizard/StepNavigation';
import ValidationSummary from '../wizard/ValidationSummary';
import { validateLayoutDesign } from '../../utils/validation';
import { PROJECT_TEMPLATES, USAGE_TYPES } from '../../utils/templates';

const Step3LayoutDesign = ({ 
  data, 
  onUpdate, 
  onNext,
  onPrevious,
  onSave
}) => {
  const [layoutData, setLayoutData] = useState(() => {
    // Initialize with default structure
    const defaultData = {
      basements: { 
        enabled: false, 
        count: 0, 
        floors: [],
        globalSettings: {
          hasCommonFeatures: false,
          commonUsage: 'Parking',
          individualConfig: true
        }
      },
      ground: { enabled: true, usage: 'Lobby', customUsage: '', description: '' },
      podiums: { 
        enabled: false, 
        count: 0, 
        floors: [],
        globalSettings: {
          hasCommonFeatures: false,
          commonUsage: 'Amenities',
          individualConfig: true
        }
      },
      wings: { 
        count: 1, 
        wings: [{ 
          name: 'Wing A', 
          floors: {
            commercial: { count: 0, startFloor: 1, floorType: 'Office' },
            residential: { count: 12, startFloor: 1, floorType: 'Apartments' }
          }
        }] 
      },
      amenities: {
        clubhouse: true,
        swimmingPool: false,
        garden: true,
        gym: false,
        playArea: true,
        parking: { capacity: 100 }
      }
    };

    // Merge with existing data if available
    if (data.layout) {
      const existingLayout = data.layout;
      
      // Migrate old wing format to new format if necessary
      if (existingLayout.wings && existingLayout.wings.wings) {
        const migratedWings = existingLayout.wings.wings.map(wing => {
          // Check if wing has old format
          if (wing.commercialFloors !== undefined || wing.residentialFloors !== undefined) {
            return {
              name: wing.name,
              floors: {
                commercial: { 
                  count: wing.commercialFloors || 0, 
                  startFloor: 1,
                  floorType: 'Office'
                },
                residential: { 
                  count: wing.residentialFloors || 0, 
                  startFloor: (wing.commercialFloors || 0) + 1,
                  floorType: 'Apartments'
                }
              }
            };
          }
          
          // If already in new format, ensure all properties exist
          return {
            name: wing.name,
            floors: {
              commercial: {
                count: wing.floors?.commercial?.count || 0,
                startFloor: wing.floors?.commercial?.startFloor || 1,
                floorType: wing.floors?.commercial?.floorType || 'Office'
              },
              residential: {
                count: wing.floors?.residential?.count || 0,
                startFloor: wing.floors?.residential?.startFloor || 1,
                floorType: wing.floors?.residential?.floorType || 'Apartments'
              }
            }
          };
        });

        existingLayout.wings = {
          count: migratedWings.length,
          wings: migratedWings
        };
      }

      // Ensure basement floors have proper structure
      if (existingLayout.basements?.floors) {
        existingLayout.basements.floors = existingLayout.basements.floors.map((floor, index) => ({
          id: floor.id || floor.level || `B${index + 1}`,
          level: floor.level || `B${index + 1}`,
          name: floor.name || `Basement ${index + 1}`,
          usage: floor.usage || 'Parking',
          description: floor.description || `Basement level ${index + 1}`,
          customUsage: floor.customUsage || '',
          features: floor.features || [],
          capacity: floor.capacity || 60,
          accessibility: floor.accessibility !== undefined ? floor.accessibility : true,
          ventilation: floor.ventilation || 'Mechanical',
          fireDetection: floor.fireDetection !== undefined ? floor.fireDetection : true,
          additionalNotes: floor.additionalNotes || ''
        }));
      }

      // Ensure podium floors have proper structure
      if (existingLayout.podiums?.floors) {
        existingLayout.podiums.floors = existingLayout.podiums.floors.map((floor, index) => ({
          id: floor.id || floor.level || `P${index + 1}`,
          level: floor.level || `P${index + 1}`,
          name: floor.name || `Podium Level ${index + 1}`,
          usage: floor.usage || 'Amenities',
          description: floor.description || `Podium level ${index + 1}`,
          customUsage: floor.customUsage || '',
          features: floor.features || [],
          capacity: floor.capacity || 50,
          openArea: floor.openArea !== undefined ? floor.openArea : true,
          landscaping: floor.landscaping !== undefined ? floor.landscaping : false,
          accessibility: floor.accessibility !== undefined ? floor.accessibility : true,
          additionalNotes: floor.additionalNotes || ''
        }));
      }

      return {
        ...defaultData,
        ...existingLayout
      };
    }

    return defaultData;
  });

  const [validationResult, setValidationResult] = useState({ isValid: true, errors: {}, warnings: [] });
  const [expandedSections, setExpandedSections] = useState({
    basements: false,
    podiums: false,
    wings: true
  });

  useEffect(() => {
    // Ensure we have proper data structure before validation
    if (!layoutData.wings || !layoutData.wings.wings) {
      console.log('Invalid wings data structure:', layoutData.wings);
      setValidationResult({
        isValid: false,
        errors: { wings: 'Wing data is not properly initialized' },
        warnings: []
      });
      return;
    }

    const result = validateLayoutDesign({ layout: layoutData });
    console.log('Step 3 Validation Result:', result);
    setValidationResult(result);
  }, [layoutData]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const applyTemplate = (templateName) => {
    const template = PROJECT_TEMPLATES[templateName];
    if (template) {
      // Convert old template format to new format
      const convertedTemplate = {
        ...template,
        wings: {
          count: template.wings.count,
          wings: template.wings.wings.map(wing => ({
            name: wing.name,
            floors: {
              commercial: { 
                count: wing.commercialFloors || 0, 
                startFloor: 1,
                floorType: 'Office'
              },
              residential: { 
                count: wing.residentialFloors || 0, 
                startFloor: (wing.commercialFloors || 0) + 1,
                floorType: 'Apartments'
              }
            }
          }))
        }
      };
      setLayoutData(convertedTemplate);
    }
  };

  const updateBasementCount = (count) => {
    const floors = Array.from({ length: count }, (_, i) => ({
      id: `B${count - i}`,
      level: `B${count - i}`,
      name: `Basement ${count - i}`,
      usage: 'Parking',
      description: `Basement level ${count - i}`,
      customUsage: '',
      features: [],
      capacity: count - i === 1 ? 80 : 60, // Different capacities for different levels
      accessibility: true,
      ventilation: 'Mechanical',
      fireDetection: true,
      additionalNotes: ''
    }));
    
    setLayoutData(prev => ({
      ...prev,
      basements: { ...prev.basements, count, floors }
    }));
  };

  const updateBasementFloor = (index, field, value) => {
    const newFloors = [...layoutData.basements.floors];
    newFloors[index] = { ...newFloors[index], [field]: value };
    setLayoutData(prev => ({
      ...prev,
      basements: { ...prev.basements, floors: newFloors }
    }));
  };

  const cloneBasementFloor = (index) => {
    const floorToClone = layoutData.basements.floors[index];
    const clonedFloor = {
      ...floorToClone,
      id: `${floorToClone.id}-copy`,
      level: `${floorToClone.level}-Copy`,
      name: `${floorToClone.name} (Copy)`,
      description: `${floorToClone.description} - Copy`
    };
    
    const newFloors = [...layoutData.basements.floors];
    newFloors.splice(index + 1, 0, clonedFloor);
    
    setLayoutData(prev => ({
      ...prev,
      basements: { 
        ...prev.basements, 
        floors: newFloors,
        count: newFloors.length
      }
    }));
  };

  const updatePodiumCount = (count) => {
    const floors = Array.from({ length: count }, (_, i) => ({
      id: `P${i + 1}`,
      level: `P${i + 1}`,
      name: `Podium Level ${i + 1}`,
      usage: i === 0 ? 'Amenities' : i === 1 ? 'Recreation' : 'Mixed',
      description: i === 0 ? 'Swimming pool, gym, clubhouse' : 
                   i === 1 ? 'Sports courts, party hall' : 
                   `Podium level ${i + 1}`,
      customUsage: '',
      features: i === 0 ? ['Swimming Pool', 'Gym'] : 
                i === 1 ? ['Badminton Court', 'Party Hall'] : [],
      capacity: (i + 1) * 50,
      openArea: true,
      landscaping: i === count - 1, // Top podium has landscaping
      accessibility: true,
      additionalNotes: ''
    }));
    
    setLayoutData(prev => ({
      ...prev,
      podiums: { ...prev.podiums, count, floors }
    }));
  };

  const updatePodiumFloor = (index, field, value) => {
    const newFloors = [...layoutData.podiums.floors];
    if (field === 'features') {
      // Handle features as an array
      newFloors[index] = { ...newFloors[index], [field]: value };
    } else {
      newFloors[index] = { ...newFloors[index], [field]: value };
    }
    setLayoutData(prev => ({
      ...prev,
      podiums: { ...prev.podiums, floors: newFloors }
    }));
  };

  const clonePodiumFloor = (index) => {
    const floorToClone = layoutData.podiums.floors[index];
    const clonedFloor = {
      ...floorToClone,
      id: `${floorToClone.id}-copy`,
      level: `${floorToClone.level}-Copy`,
      name: `${floorToClone.name} (Copy)`,
      description: `${floorToClone.description} - Copy`,
      features: [...floorToClone.features]
    };
    
    const newFloors = [...layoutData.podiums.floors];
    newFloors.splice(index + 1, 0, clonedFloor);
    
    setLayoutData(prev => ({
      ...prev,
      podiums: { 
        ...prev.podiums, 
        floors: newFloors,
        count: newFloors.length
      }
    }));
  };

  const updateWing = (index, field, value) => {
    const newWings = [...layoutData.wings.wings];
    if (field.includes('.')) {
      const [parent, child, subfield] = field.split('.');
      if (subfield) {
        newWings[index][parent][child][subfield] = value;
      } else {
        newWings[index][parent][child] = value;
      }
    } else {
      newWings[index][field] = value;
    }
    
    // Auto-adjust floor numbering when commercial floors change
    if (field === 'floors.commercial.count') {
      newWings[index].floors.residential.startFloor = value + 1;
    }
    
    setLayoutData(prev => ({
      ...prev,
      wings: { ...prev.wings, wings: newWings }
    }));
  };

  const addWing = () => {
    const newWing = {
      name: `Wing ${String.fromCharCode(65 + layoutData.wings.wings.length)}`,
      floors: {
        commercial: { count: 0, startFloor: 1, floorType: 'Office' },
        residential: { count: 12, startFloor: 1, floorType: 'Apartments' }
      }
    };
    setLayoutData(prev => ({
      ...prev,
      wings: {
        count: prev.wings.count + 1,
        wings: [...prev.wings.wings, newWing]
      }
    }));
  };

  const removeWing = (index) => {
    if (layoutData.wings.wings.length > 1) {
      const newWings = layoutData.wings.wings.filter((_, i) => i !== index);
      setLayoutData(prev => ({
        ...prev,
        wings: { count: newWings.length, wings: newWings }
      }));
    }
  };

  const handleNext = () => {
    console.log('Step 3 - handleNext called');
    console.log('Validation Result:', validationResult);
    
    if (validationResult.isValid) {
      console.log('Validation passed, updating data and proceeding to next step');
      onUpdate({ layout: layoutData });
      onNext();
    } else {
      console.log('Validation failed:', validationResult.errors);
    }
  };

  const handleSave = () => {
    onUpdate({ layout: layoutData });
    onSave?.({ layout: layoutData });
  };

  // Enhanced Floor Configuration Component for Basements
  const BasementFloorConfig = ({ floor, index, onUpdate, onClone }) => {
    const [expanded, setExpanded] = useState(false);

    return (
      <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg flex items-center justify-center font-bold">
              {floor.level}
            </div>
            <div>
              <Input
                value={floor.name}
                onChange={(e) => onUpdate(index, 'name', e.target.value)}
                className="font-semibold text-lg border-0 bg-transparent p-0 focus:bg-white focus:border focus:p-2 rounded"
                placeholder="Floor name"
              />
              <p className="text-sm text-blue-600">{floor.level}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onClone(index)}
              icon={Copy}
              className="hover:bg-blue-100"
            >
              Clone
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              icon={expanded ? ChevronDown : ChevronRight}
              className="hover:bg-blue-100"
            >
              {expanded ? 'Less' : 'More'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <Select
            label="Primary Usage"
            options={USAGE_TYPES.basement}
            value={floor.usage}
            onChange={(e) => onUpdate(index, 'usage', e.target.value)}
          />
          
          <Input.Number
            label="Capacity/Area"
            value={floor.capacity}
            onChange={(e) => onUpdate(index, 'capacity', parseInt(e.target.value) || 0)}
            helperText="Parking spaces or sq.ft"
            min={0}
          />

          <div>
            <label className="form-label">Fire Detection</label>
            <div className="flex items-center space-x-4 mt-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={floor.fireDetection}
                  onChange={(e) => onUpdate(index, 'fireDetection', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded mr-2"
                />
                <span className="text-sm">Fire Detection System</span>
              </label>
            </div>
          </div>
        </div>

        <Input.TextArea
          label="Description"
          value={floor.description}
          onChange={(e) => onUpdate(index, 'description', e.target.value)}
          placeholder="Describe the purpose and features of this floor"
          rows={2}
        />

        {floor.usage === 'Custom' && (
          <div className="mt-4 animate-slide-up">
            <Input
              label="Custom Usage Details"
              value={floor.customUsage || ''}
              onChange={(e) => onUpdate(index, 'customUsage', e.target.value)}
              placeholder="Specify custom usage"
            />
          </div>
        )}

        {expanded && (
          <div className="mt-6 pt-4 border-t border-blue-200 animate-slide-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Ventilation System"
                options={['Natural', 'Mechanical', 'Hybrid', 'None']}
                value={floor.ventilation}
                onChange={(e) => onUpdate(index, 'ventilation', e.target.value)}
              />
              
              <div>
                <label className="form-label">Accessibility Features</label>
                <div className="flex items-center space-x-4 mt-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={floor.accessibility}
                      onChange={(e) => onUpdate(index, 'accessibility', e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded mr-2"
                    />
                    <span className="text-sm">Wheelchair Accessible</span>
                  </label>
                </div>
              </div>
            </div>

            <Input.TextArea
              label="Additional Notes"
              value={floor.additionalNotes || ''}
              onChange={(e) => onUpdate(index, 'additionalNotes', e.target.value)}
              placeholder="Any additional specifications or requirements"
              rows={2}
              className="mt-4"
            />
          </div>
        )}
      </div>
    );
  };

  // Enhanced Floor Configuration Component for Podiums
  const PodiumFloorConfig = ({ floor, index, onUpdate, onClone }) => {
    const [expanded, setExpanded] = useState(false);

    const availableFeatures = [
      'Swimming Pool', 'Gym', 'Clubhouse', 'Badminton Court', 'Tennis Court',
      'Party Hall', 'Business Center', 'Spa', 'Yoga Studio', 'Kids Play Area',
      'Library', 'Café', 'Terrace Garden', 'BBQ Area', 'Amphitheatre'
    ];

    const toggleFeature = (feature) => {
      const currentFeatures = floor.features || [];
      const updatedFeatures = currentFeatures.includes(feature)
        ? currentFeatures.filter(f => f !== feature)
        : [...currentFeatures, feature];
      onUpdate(index, 'features', updatedFeatures);
    };

    return (
      <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg flex items-center justify-center font-bold">
              {floor.level}
            </div>
            <div>
              <Input
                value={floor.name}
                onChange={(e) => onUpdate(index, 'name', e.target.value)}
                className="font-semibold text-lg border-0 bg-transparent p-0 focus:bg-white focus:border focus:p-2 rounded"
                placeholder="Floor name"
              />
              <p className="text-sm text-purple-600">{floor.level}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onClone(index)}
              icon={Copy}
              className="hover:bg-purple-100"
            >
              Clone
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              icon={expanded ? ChevronDown : ChevronRight}
              className="hover:bg-purple-100"
            >
              {expanded ? 'Less' : 'More'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <Select
            label="Primary Usage"
            options={USAGE_TYPES.podium}
            value={floor.usage}
            onChange={(e) => onUpdate(index, 'usage', e.target.value)}
          />
          
          <Input.Number
            label="Capacity"
            value={floor.capacity}
            onChange={(e) => onUpdate(index, 'capacity', parseInt(e.target.value) || 0)}
            helperText="Max occupancy"
            min={0}
          />

          <div>
            <label className="form-label">Outdoor Features</label>
            <div className="flex items-center space-x-4 mt-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={floor.openArea}
                  onChange={(e) => onUpdate(index, 'openArea', e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded mr-2"
                />
                <span className="text-sm">Open Air Area</span>
              </label>
            </div>
          </div>
        </div>

        <Input.TextArea
          label="Description"
          value={floor.description}
          onChange={(e) => onUpdate(index, 'description', e.target.value)}
          placeholder="Describe the purpose and layout of this podium level"
          rows={2}
        />

        {/* Features Selection */}
        <div className="mt-4">
          <label className="form-label">Available Features</label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-2">
            {availableFeatures.map(feature => (
              <label 
                key={feature} 
                className="flex items-center p-2 rounded-lg border border-gray-200 hover:bg-white transition-colors cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={(floor.features || []).includes(feature)}
                  onChange={() => toggleFeature(feature)}
                  className="w-4 h-4 text-purple-600 rounded mr-2"
                />
                <span className="text-sm">{feature}</span>
              </label>
            ))}
          </div>
        </div>

        {floor.usage === 'Custom' && (
          <div className="mt-4 animate-slide-up">
            <Input
              label="Custom Usage Details"
              value={floor.customUsage || ''}
              onChange={(e) => onUpdate(index, 'customUsage', e.target.value)}
              placeholder="Specify custom usage"
            />
          </div>
        )}

        {expanded && (
          <div className="mt-6 pt-4 border-t border-purple-200 animate-slide-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Landscaping</label>
                <div className="flex items-center space-x-4 mt-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={floor.landscaping}
                      onChange={(e) => onUpdate(index, 'landscaping', e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded mr-2"
                    />
                    <span className="text-sm">Landscaped Areas</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="form-label">Accessibility</label>
                <div className="flex items-center space-x-4 mt-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={floor.accessibility}
                      onChange={(e) => onUpdate(index, 'accessibility', e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded mr-2"
                    />
                    <span className="text-sm">Barrier-free Access</span>
                  </label>
                </div>
              </div>
            </div>

            <Input.TextArea
              label="Additional Specifications"
              value={floor.additionalNotes || ''}
              onChange={(e) => onUpdate(index, 'additionalNotes', e.target.value)}
              placeholder="Special requirements, technical specifications, or design notes"
              rows={2}
              className="mt-4"
            />
          </div>
        )}

        {/* Features Summary */}
        {(floor.features || []).length > 0 && (
          <div className="mt-4 p-3 bg-white rounded-lg border border-purple-200">
            <h6 className="font-semibold text-purple-800 mb-2">Selected Features:</h6>
            <div className="flex flex-wrap gap-2">
              {(floor.features || []).map(feature => (
                <span 
                  key={feature}
                  className="px-2 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs rounded-full font-medium"
                >
                  {feature}
                </span>
              ))}
            </div>
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
            <Card.Title icon={Home} gradient>Enhanced Layout Design</Card.Title>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {/* Template modal logic */}}
              icon={Sparkles}
              className="animate-bounce-gentle"
            >
              Quick Templates
            </Button>
          </div>
          <Card.Subtitle>
            Configure your building structure with detailed floor-by-floor specifications. 
            Each basement and podium level can have unique purposes, features, and configurations.
          </Card.Subtitle>
        </Card.Header>

        <Card.Content>
          <ValidationSummary
            errors={validationResult.errors}
            warnings={validationResult.warnings}
            className="mb-8"
          />

          {/* Debug Info - Remove this after fixing */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-yellow-800">🐛 Debug Info</h4>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setLayoutData(prev => ({
                      ...prev,
                      wings: {
                        count: 1,
                        wings: [{
                          name: 'Wing A',
                          floors: {
                            commercial: { count: 0, startFloor: 1, floorType: 'Office' },
                            residential: { count: 12, startFloor: 1, floorType: 'Apartments' }
                          }
                        }]
                      }
                    }));
                  }}
                >
                  Reset Wings
                </Button>
              </div>
              <div className="text-sm text-yellow-700">
                <p><strong>Wings Count:</strong> {layoutData.wings?.count || 0}</p>
                <p><strong>Wings Array Length:</strong> {layoutData.wings?.wings?.length || 0}</p>
                <p><strong>Validation Errors:</strong> {Object.keys(validationResult.errors).join(', ') || 'None'}</p>
                <p><strong>Wings Data:</strong></p>
                <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-32">
                  {JSON.stringify(layoutData.wings, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Template Selection */}
          <div className="mb-10 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
              Quick Start Templates
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.keys(PROJECT_TEMPLATES).map(template => (
                <button
                  key={template}
                  onClick={() => applyTemplate(template)}
                  className={`
                    group p-6 rounded-xl border-2 text-left transition-all duration-300
                    hover:scale-105 hover:shadow-lg transform
                    ${data.projectType === template 
                      ? 'border-blue-500 bg-gradient-to-br from-blue-100 to-purple-100 shadow-lg' 
                      : 'border-gray-200 hover:border-blue-300 bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50'
                    }
                  `}
                >
                  <div className="font-bold text-gray-800 group-hover:text-blue-700 transition-colors">
                    {template}
                  </div>
                  <div className="text-sm text-gray-600 mt-2 group-hover:text-blue-600 transition-colors">
                    {template === 'Residential' && '🏢 2 Basements + 2 Wings + Full Amenities'}
                    {template === 'Commercial' && '🏬 3 Basements + Office Tower + Parking'}
                    {template === 'Mixed-use' && '🏙️ Commercial + Residential + Mixed Amenities'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            {/* Enhanced Basements Section */}
            <div className="step-card">
              <div 
                className="flex items-center justify-between cursor-pointer p-4 -m-4 rounded-xl hover:bg-blue-50 transition-colors"
                onClick={() => toggleSection('basements')}
              >
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={layoutData.basements.enabled}
                    onChange={(e) => {
                      e.stopPropagation();
                      setLayoutData(prev => ({
                        ...prev,
                        basements: { ...prev.basements, enabled: e.target.checked }
                      }));
                    }}
                    className="w-6 h-6 text-blue-600 rounded-lg focus:ring-blue-500"
                  />
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                      🏢 Basement Levels
                    </h3>
                    <p className="text-sm text-gray-600">Configure individual basement floors with specific purposes</p>
                  </div>
                  {layoutData.basements.enabled && (
                    <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-sm font-bold rounded-full">
                      {layoutData.basements.count} Level{layoutData.basements.count !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                {layoutData.basements.enabled && (
                  <div className="flex items-center space-x-3">
                    <Input.Number
                      value={layoutData.basements.count}
                      onChange={(e) => updateBasementCount(parseInt(e.target.value) || 0)}
                      min={0}
                      max={5}
                      className="w-20 text-center"
                      onClick={(e) => e.stopPropagation()}
                    />
                    {expandedSections.basements ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </div>
                )}
              </div>
              
              {layoutData.basements.enabled && expandedSections.basements && layoutData.basements.count > 0 && (
                <div className="mt-8 space-y-6 animate-slide-up">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                    <h4 className="font-bold text-blue-800 mb-2">💡 Basement Configuration Tips</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Lower levels (B2, B3) are typically used for parking and storage</li>
                      <li>• Upper basement levels (B1) can accommodate gyms, pools, or retail</li>
                      <li>• Consider ventilation and accessibility requirements for each usage type</li>
                    </ul>
                  </div>

                  {layoutData.basements.floors.map((floor, index) => (
                    <BasementFloorConfig
                      key={floor.id}
                      floor={floor}
                      index={index}
                      onUpdate={updateBasementFloor}
                      onClone={cloneBasementFloor}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Ground Floor Section */}
            <div className="step-card">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={layoutData.ground.enabled}
                    onChange={(e) => setLayoutData(prev => ({
                      ...prev,
                      ground: { ...prev.ground, enabled: e.target.checked }
                    }))}
                    className="w-6 h-6 text-green-600 rounded-lg focus:ring-green-500"
                  />
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">🏬 Ground Floor</h3>
                    <p className="text-sm text-gray-600">Main entrance and primary public spaces</p>
                  </div>
                </div>
              </div>
              
              {layoutData.ground.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                  <Select
                    label="Primary Usage"
                    options={USAGE_TYPES.ground}
                    value={layoutData.ground.usage}
                    onChange={(e) => setLayoutData(prev => ({
                      ...prev,
                      ground: { ...prev.ground, usage: e.target.value }
                    }))}
                  />
                  <Input.TextArea
                    label="Description"
                    value={layoutData.ground.description || ''}
                    onChange={(e) => setLayoutData(prev => ({
                      ...prev,
                      ground: { ...prev.ground, description: e.target.value }
                    }))}
                    placeholder="Describe the ground floor layout and features"
                    rows={2}
                  />
                  {layoutData.ground.usage === 'Custom' && (
                    <Input
                      label="Custom Usage Details"
                      value={layoutData.ground.customUsage || ''}
                      onChange={(e) => setLayoutData(prev => ({
                        ...prev,
                        ground: { ...prev.ground, customUsage: e.target.value }
                      }))}
                      placeholder="Specify custom usage"
                      containerClassName="md:col-span-2"
                    />
                  )}
                </div>
              )}
            </div>

            {/* Enhanced Podiums Section */}
            <div className="step-card">
              <div 
                className="flex items-center justify-between cursor-pointer p-4 -m-4 rounded-xl hover:bg-purple-50 transition-colors"
                onClick={() => toggleSection('podiums')}
              >
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={layoutData.podiums.enabled}
                    onChange={(e) => {
                      e.stopPropagation();
                      setLayoutData(prev => ({
                        ...prev,
                        podiums: { ...prev.podiums, enabled: e.target.checked }
                      }));
                    }}
                    className="w-6 h-6 text-purple-600 rounded-lg focus:ring-purple-500"
                  />
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">🏗️ Podium Levels</h3>
                    <p className="text-sm text-gray-600">Elevated platforms with amenities and recreational facilities</p>
                  </div>
                  {layoutData.podiums.enabled && (
                    <span className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 text-sm font-bold rounded-full">
                      {layoutData.podiums.count} Level{layoutData.podiums.count !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                {layoutData.podiums.enabled && (
                  <div className="flex items-center space-x-3">
                    <Input.Number
                      value={layoutData.podiums.count}
                      onChange={(e) => updatePodiumCount(parseInt(e.target.value) || 0)}
                      min={0}
                      max={5}
                      className="w-20 text-center"
                      onClick={(e) => e.stopPropagation()}
                    />
                    {expandedSections.podiums ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </div>
                )}
              </div>
              
              {layoutData.podiums.enabled && expandedSections.podiums && layoutData.podiums.count > 0 && (
                <div className="mt-8 space-y-6 animate-slide-up">
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                    <h4 className="font-bold text-purple-800 mb-2">💡 Podium Design Tips</h4>
                    <ul className="text-sm text-purple-700 space-y-1">
                      <li>• Lower podium levels work well for parking and storage</li>
                      <li>• Mid-level podiums are perfect for recreational facilities</li>
                      <li>• Top podium levels can feature landscaped terraces and outdoor spaces</li>
                      <li>• Consider connectivity between podium levels and main towers</li>
                    </ul>
                  </div>

                  {layoutData.podiums.floors.map((floor, index) => (
                    <PodiumFloorConfig
                      key={floor.id}
                      floor={floor}
                      index={index}
                      onUpdate={updatePodiumFloor}
                      onClone={clonePodiumFloor}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Wings & Towers Section */}
            <div className="step-card">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <Building2 className="w-8 h-8 text-green-600" />
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">Wings & Towers</h3>
                    <p className="text-sm text-gray-600">Main building structures with commercial and residential floors</p>
                  </div>
                  <span className="px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-sm font-bold rounded-full">
                    {layoutData.wings.count} Wing{layoutData.wings.count !== 1 ? 's' : ''}
                  </span>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={addWing}
                  icon={Home}
                  className="hover:scale-105 transition-transform"
                >
                  Add Wing
                </Button>
              </div>
              
              <div className="space-y-6">
                {layoutData.wings.wings.map((wing, index) => {
                  // Safety check to ensure wing has proper structure
                  const safeWing = {
                    name: wing.name || `Wing ${String.fromCharCode(65 + index)}`,
                    floors: {
                      commercial: {
                        count: wing.floors?.commercial?.count || 0,
                        startFloor: wing.floors?.commercial?.startFloor || 1,
                        floorType: wing.floors?.commercial?.floorType || 'Office'
                      },
                      residential: {
                        count: wing.floors?.residential?.count || 0,
                        startFloor: wing.floors?.residential?.startFloor || 1,
                        floorType: wing.floors?.residential?.floorType || 'Apartments'
                      }
                    }
                  };

                  return (
                  <div key={index} className="p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200 animate-scale-in">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-lg font-bold text-gray-800 flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl flex items-center justify-center text-sm font-bold mr-3">
                          {safeWing.name.charAt(safeWing.name.length - 1)}
                        </div>
                        Wing {index + 1}
                      </h4>
                      {layoutData.wings.wings.length > 1 && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => removeWing(index)}
                          icon={Trash2}
                          className="hover:scale-105 transition-transform"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    
                    <div className="space-y-6">
                      <Input
                        label="Wing Name"
                        value={safeWing.name}
                        onChange={(e) => updateWing(index, 'name', e.target.value)}
                        className="font-medium"
                      />
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Commercial Floors */}
                        <div className="p-6 bg-white rounded-xl border border-orange-200 shadow-sm">
                          <h5 className="font-bold text-orange-800 mb-4 flex items-center text-lg">
                            🏢 Commercial Floors
                          </h5>
                          <div className="space-y-4">
                            <Input.Number
                              label="Number of Commercial Floors"
                              value={safeWing.floors.commercial.count}
                              onChange={(e) => updateWing(index, 'floors.commercial.count', parseInt(e.target.value) || 0)}
                              min={0}
                              max={30}
                              helperText="Offices, retail, restaurants, etc."
                            />
                            {safeWing.floors.commercial.count > 0 && (
                              <>
                                <Input.Number
                                  label="Starting Floor Number"
                                  value={safeWing.floors.commercial.startFloor}
                                  onChange={(e) => updateWing(index, 'floors.commercial.startFloor', parseInt(e.target.value) || 1)}
                                  min={1}
                                  max={10}
                                  helperText="Usually starts from ground (1) or first floor"
                                />
                                <Select
                                  label="Commercial Floor Type"
                                  options={['Office', 'Retail', 'Mixed Office-Retail', 'Restaurant', 'Medical', 'Co-working', 'Custom']}
                                  value={safeWing.floors.commercial.floorType}
                                  onChange={(e) => updateWing(index, 'floors.commercial.floorType', e.target.value)}
                                />
                              </>
                            )}
                          </div>
                        </div>
                        
                        {/* Residential Floors */}
                        <div className="p-6 bg-white rounded-xl border border-blue-200 shadow-sm">
                          <h5 className="font-bold text-blue-800 mb-4 flex items-center text-lg">
                            🏠 Residential Floors
                          </h5>
                          <div className="space-y-4">
                            <Input.Number
                              label="Number of Residential Floors"
                              value={safeWing.floors.residential.count}
                              onChange={(e) => updateWing(index, 'floors.residential.count', parseInt(e.target.value) || 0)}
                              min={0}
                              max={50}
                              helperText="Apartments, penthouses, etc."
                            />
                            {safeWing.floors.residential.count > 0 && (
                              <>
                                <Input.Number
                                  label="Starting Floor Number"
                                  value={safeWing.floors.residential.startFloor}
                                  onChange={(e) => updateWing(index, 'floors.residential.startFloor', parseInt(e.target.value) || 1)}
                                  min={1}
                                  max={50}
                                  helperText={`Auto-calculated as ${(safeWing.floors.commercial.count || 0) + 1} (after commercial floors)`}
                                />
                                <Select
                                  label="Residential Floor Type"
                                  options={['Apartments', 'Penthouses', 'Duplexes', 'Studios', 'Mixed Units', 'Service Apartments', 'Custom']}
                                  value={safeWing.floors.residential.floorType}
                                  onChange={(e) => updateWing(index, 'floors.residential.floorType', e.target.value)}
                                />
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Wing Summary */}
                      <div className="p-4 bg-gradient-to-r from-blue-100 to-green-100 rounded-xl">
                        <h6 className="font-bold text-gray-800 mb-3">📊 Wing Summary</h6>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-semibold">
                              <strong>Total Floors:</strong> {(safeWing.floors.commercial.count || 0) + (safeWing.floors.residential.count || 0)}
                            </p>
                            {safeWing.floors.commercial.count > 0 && (
                              <p className="text-orange-700">
                                <strong>Commercial:</strong> Floors {safeWing.floors.commercial.startFloor} - {safeWing.floors.commercial.startFloor + safeWing.floors.commercial.count - 1}
                                <br />
                                <span className="text-xs">Type: {safeWing.floors.commercial.floorType}</span>
                              </p>
                            )}
                          </div>
                          <div>
                            {safeWing.floors.residential.count > 0 && (
                              <p className="text-blue-700">
                                <strong>Residential:</strong> Floors {safeWing.floors.residential.startFloor} - {safeWing.floors.residential.startFloor + safeWing.floors.residential.count - 1}
                                <br />
                                <span className="text-xs">Type: {safeWing.floors.residential.floorType}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Amenities */}
            <div className="step-card">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <Settings className="w-6 h-6 text-purple-600 mr-3" />
                Quick Amenities Selection
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {Object.entries({
                  clubhouse: '🏛️ Clubhouse',
                  swimmingPool: '🏊 Swimming Pool', 
                  garden: '🌳 Garden',
                  gym: '💪 Gym',
                  playArea: '🎮 Play Area'
                }).map(([key, label]) => (
                  <label key={key} className="flex items-center p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={layoutData.amenities[key]}
                      onChange={(e) => setLayoutData(prev => ({
                        ...prev,
                        amenities: { ...prev.amenities, [key]: e.target.checked }
                      }))}
                      className="w-4 h-4 text-blue-600 rounded mr-3"
                    />
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
              
              <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                <h6 className="font-bold text-yellow-800 mb-3">🚗 Parking Configuration</h6>
                <Input.Number
                  label="Estimated Parking Capacity"
                  value={layoutData.amenities.parking.capacity}
                  onChange={(e) => setLayoutData(prev => ({
                    ...prev,
                    amenities: {
                      ...prev.amenities,
                      parking: { capacity: parseInt(e.target.value) || 0 }
                    }
                  }))}
                  min={0}
                  helperText="Total number of parking spaces across all levels"
                  className="max-w-xs"
                />
              </div>
            </div>
          </div>

          {/* Overall Layout Summary */}
          <div className="mt-10 p-6 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl border border-blue-200 animate-slide-up">
            <h4 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              🎯 Complete Layout Summary
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
              {layoutData.basements.enabled && layoutData.basements.floors.length > 0 && (
                <div className="bg-white p-4 rounded-xl shadow-md">
                  <h5 className="font-bold text-gray-800 mb-2">🏢 Foundation</h5>
                  <p>{layoutData.basements.count} Basement Level(s)</p>
                  <div className="text-xs text-gray-600 mt-1 space-y-1">
                    {layoutData.basements.floors.map((f, i) => (
                      <div key={i}>• {f.level}: {f.usage} - {f.name}</div>
                    ))}
                  </div>
                </div>
              )}
              
              {layoutData.ground.enabled && (
                <div className="bg-white p-4 rounded-xl shadow-md">
                  <h5 className="font-bold text-gray-800 mb-2">🏬 Ground Level</h5>
                  <p>Usage: {layoutData.ground.usage}</p>
                  {layoutData.ground.description && (
                    <p className="text-xs text-gray-600 mt-1">{layoutData.ground.description}</p>
                  )}
                </div>
              )}
              
              {layoutData.podiums.enabled && layoutData.podiums.floors.length > 0 && (
                <div className="bg-white p-4 rounded-xl shadow-md">
                  <h5 className="font-bold text-gray-800 mb-2">🏗️ Podium Levels</h5>
                  <p>{layoutData.podiums.count} Podium Level(s)</p>
                  <div className="text-xs text-gray-600 mt-1 space-y-1">
                    {layoutData.podiums.floors.map((f, i) => (
                      <div key={i}>• {f.level}: {f.usage} - {f.name}</div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="bg-white p-4 rounded-xl shadow-md">
                <h5 className="font-bold text-gray-800 mb-2">🏙️ Towers</h5>
                <p>{layoutData.wings.count} Wing(s)</p>
                <div className="text-xs text-gray-600 mt-1">
                  {layoutData.wings.wings.map((w, i) => {
                    // Safety check for wing structure
                    const commercialCount = w.floors?.commercial?.count || 0;
                    const residentialCount = w.floors?.residential?.count || 0;
                    const commercialType = w.floors?.commercial?.floorType || 'Office';
                    const residentialType = w.floors?.residential?.floorType || 'Apartments';
                    
                    return (
                      <div key={i} className="mb-1">
                        • {w.name}: {commercialCount}C + {residentialCount}R floors
                        {commercialCount > 0 && (
                          <div className="ml-2 text-orange-600">Commercial: {commercialType}</div>
                        )}
                        {residentialCount > 0 && (
                          <div className="ml-2 text-blue-600">Residential: {residentialType}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-xl shadow-md">
                <h5 className="font-bold text-gray-800 mb-2">🎯 Amenities</h5>
                <p>{Object.entries(layoutData.amenities).filter(([k,v]) => k !== 'parking' && v).length} Selected</p>
                <p className="text-xs text-gray-600 mt-1">
                  {Object.entries(layoutData.amenities).filter(([k,v]) => k !== 'parking' && v).map(([k]) => k).join(', ') || 'None'}
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-xl shadow-md">
                <h5 className="font-bold text-gray-800 mb-2">🚗 Parking</h5>
                <p>{layoutData.amenities.parking.capacity} Vehicles</p>
                <p className="text-xs text-gray-600 mt-1">Estimated capacity</p>
              </div>
            </div>
          </div>
        </Card.Content>

        <StepNavigation
          onPrevious={onPrevious}
          onNext={handleNext}
          onSave={handleSave}
          isValid={validationResult.isValid}
          nextLabel="Next: Wing Configuration"
          previousLabel="Back: Phase Setup"
        />

        {/* Debug Navigation - Remove after testing */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <h4 className="font-bold text-red-800 mb-3">🚨 Debug Navigation</h4>
            <div className="flex items-center space-x-4">
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  console.log('Force Next - bypassing validation');
                  onUpdate({ layout: layoutData });
                  onNext();
                }}
              >
                Force Next (Bypass Validation)
              </Button>
              <div className="text-sm text-red-700">
                <p><strong>Is Valid:</strong> {validationResult.isValid ? 'Yes' : 'No'}</p>
                <p><strong>Errors:</strong> {Object.keys(validationResult.errors).length}</p>
                <p><strong>Warnings:</strong> {validationResult.warnings.length}</p>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Step3LayoutDesign;
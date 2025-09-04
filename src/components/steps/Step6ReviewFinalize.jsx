import React, { useState, useEffect } from 'react';
import { CheckCircle, Download, FileText, Share2, AlertTriangle, BarChart3, TreePine, Building, Home, Users, Car, Shield, Zap } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import StepNavigation from '../wizard/StepNavigation';
import { generateProjectJSON, downloadJSON, copyToClipboard } from '../../utils/jsonExport';

const Step6ReviewFinalize = ({ 
  data, 
  onUpdate, 
  onNext,
  onPrevious,
  onSave
}) => {
  const [projectStats, setProjectStats] = useState({});
  const [validationSummary, setValidationSummary] = useState({ errors: [], warnings: [], isValid: true });
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    structure: true,
    units: false,
    amenities: false,
    validation: false
  });
  const [exportStatus, setExportStatus] = useState('');

  useEffect(() => {
    calculateProjectStats();
    validateCompleteProject();
  }, [data]);

  const calculateProjectStats = () => {
    const stats = {
      totalTowers: data.towers?.length || 0,
      totalWings: 0,
      totalFloors: 0,
      totalUnits: 0,
      totalCarpetArea: 0,
      totalBuiltUpArea: 0,
      unitBreakdown: {},
      floorTypeBreakdown: {},
      parkingSpaces: {
        covered: 0,
        open: 0,
        visitor: 0,
        total: 0
      },
      amenitiesCount: 0,
      estimatedCost: 0,
      timeline: {
        duration: 0,
        startDate: data.startDate,
        endDate: data.endDate
      }
    };

    // Calculate tower and wing stats
    data.towers?.forEach(tower => {
      stats.totalWings += tower.wings?.length || 0;
      
      tower.wings?.forEach(wing => {
        Object.values(wing.floorTypes || {}).forEach(floorType => {
          if (floorType.enabled) {
            stats.totalFloors += floorType.count;
            stats.floorTypeBreakdown[floorType] = (stats.floorTypeBreakdown[floorType] || 0) + floorType.count;
          }
        });
      });
    });

    // Calculate unit stats
    Object.values(data.units || {}).forEach(floorUnits => {
      floorUnits.forEach(unit => {
        stats.totalUnits++;
        stats.totalCarpetArea += unit.carpetArea || 0;
        stats.totalBuiltUpArea += unit.builtUpArea || 0;
        stats.unitBreakdown[unit.type] = (stats.unitBreakdown[unit.type] || 0) + 1;
      });
    });

    // Calculate parking stats
    if (data.amenities?.parking) {
      const parking = data.amenities.parking;
      stats.parkingSpaces.covered = (parking.covered?.cars || 0) + (parking.covered?.bikes || 0);
      stats.parkingSpaces.open = (parking.open?.cars || 0) + (parking.open?.bikes || 0);
      stats.parkingSpaces.visitor = (parking.visitor?.cars || 0) + (parking.visitor?.bikes || 0);
      stats.parkingSpaces.total = stats.parkingSpaces.covered + stats.parkingSpaces.open + stats.parkingSpaces.visitor;
    }

    // Count amenities
    if (data.amenities) {
      Object.values(data.amenities.recreational || {}).forEach(amenity => {
        if (amenity.enabled) stats.amenitiesCount++;
      });
      Object.values(data.amenities.security || {}).forEach(feature => {
        if (feature.enabled) stats.amenitiesCount++;
      });
    }

    // Calculate timeline
    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      stats.timeline.duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24 * 30)); // months
    }

    setProjectStats(stats);
  };

  const validateCompleteProject = () => {
    const errors = [];
    const warnings = [];

    // Validate basic project info
    if (!data.projectName) errors.push({ step: 1, field: 'projectName', message: 'Project name is required' });
    if (!data.projectType) errors.push({ step: 1, field: 'projectType', message: 'Project type is required' });
    if (!data.address) errors.push({ step: 1, field: 'address', message: 'Project address is required' });

    // Validate towers and wings
    if (!data.towers || data.towers.length === 0) {
      errors.push({ step: 2, field: 'towers', message: 'At least one tower is required' });
    } else {
      data.towers.forEach((tower, tIndex) => {
        if (!tower.name && !tower.customName) {
          errors.push({ step: 2, field: `tower-${tIndex}`, message: `Tower ${tIndex + 1} name is required` });
        }
        if (!tower.wings || tower.wings.length === 0) {
          errors.push({ step: 2, field: `tower-${tIndex}-wings`, message: `Tower ${tIndex + 1} must have at least one wing` });
        }
      });
    }

    // Validate units
    const totalUnits = Object.values(data.units || {}).reduce((sum, floorUnits) => sum + floorUnits.length, 0);
    if (totalUnits === 0) {
      warnings.push({ step: 4, field: 'units', message: 'No units configured - project may be incomplete' });
    }

    // Validate parking ratio
    const totalParkingSpaces = (data.amenities?.parking?.covered?.cars || 0) + 
                              (data.amenities?.parking?.open?.cars || 0);
    if (totalUnits > 0 && totalParkingSpaces > 0) {
      const parkingRatio = totalParkingSpaces / totalUnits;
      if (parkingRatio < 0.8) {
        warnings.push({ step: 5, field: 'parking', message: `Parking ratio (${parkingRatio.toFixed(2)}) is below recommended 0.8 spaces per unit` });
      }
    }

    // Validate amenities for project type
    if (data.projectType === 'Residential' && data.amenities) {
      if (!data.amenities.recreational?.swimmingPool?.enabled && !data.amenities.recreational?.gymnasium?.enabled) {
        warnings.push({ step: 5, field: 'amenities', message: 'Residential projects typically include swimming pool or gymnasium' });
      }
    }

    setValidationSummary({
      errors,
      warnings,
      isValid: errors.length === 0
    });
  };

  const generateProjectTree = () => {
    const tree = [];
    
    data.towers?.forEach((tower, towerIndex) => {
      const towerNode = {
        id: tower.id,
        type: 'tower',
        name: tower.name || tower.customName || `Tower ${towerIndex + 1}`,
        children: []
      };

      tower.wings?.forEach((wing, wingIndex) => {
        const wingNode = {
          id: wing.id,
          type: 'wing',
          name: wing.name,
          wingType: wing.type,
          children: []
        };

        Object.entries(wing.floorTypes || {}).forEach(([floorType, config]) => {
          if (config.enabled && config.count > 0) {
            for (let i = 1; i <= config.count; i++) {
              const floorKey = `${tower.id}-${wing.id}-${floorType}-${i}`;
              const floorUnits = data.units?.[floorKey] || [];
              
              const floorNode = {
                id: floorKey,
                type: 'floor',
                name: `${floorType} ${i}`,
                floorType,
                unitsCount: floorUnits.length,
                children: floorUnits.map(unit => ({
                  id: unit.id,
                  type: 'unit',
                  name: unit.id,
                  unitType: unit.type,
                  area: unit.carpetArea,
                  status: unit.status
                }))
              };
              
              wingNode.children.push(floorNode);
            }
          }
        });

        towerNode.children.push(wingNode);
      });

      tree.push(towerNode);
    });

    return tree;
  };

  const exportProject = async (format) => {
    setExportStatus(`Generating ${format.toUpperCase()}...`);
    
    try {
      const projectJSON = generateProjectJSON(data);
      
      switch (format) {
        case 'json':
          downloadJSON(projectJSON, `${data.projectName || 'project'}-data.json`);
          break;
        case 'copy':
          await copyToClipboard(projectJSON);
          setExportStatus('Copied to clipboard!');
          setTimeout(() => setExportStatus(''), 2000);
          return;
        default:
          setExportStatus('Export format not supported yet');
      }
      
      setExportStatus(`${format.toUpperCase()} exported successfully!`);
      setTimeout(() => setExportStatus(''), 3000);
    } catch (error) {
      setExportStatus(`Export failed: ${error.message}`);
      setTimeout(() => setExportStatus(''), 3000);
    }
  };

  const TreeNode = ({ node, level = 0 }) => {
    const [isExpanded, setIsExpanded] = useState(level < 2);
    
    const getNodeIcon = () => {
      switch (node.type) {
        case 'tower': return <Building className="w-4 h-4 text-blue-600" />;
        case 'wing': return <Building2 className="w-4 h-4 text-green-600" />;
        case 'floor': return <Layers className="w-4 h-4 text-purple-600" />;
        case 'unit': return <Home className="w-4 h-4 text-orange-600" />;
        default: return null;
      }
    };

    const getNodeColor = () => {
      switch (node.type) {
        case 'tower': return 'bg-blue-50 border-blue-200 text-blue-800';
        case 'wing': return 'bg-green-50 border-green-200 text-green-800';
        case 'floor': return 'bg-purple-50 border-purple-200 text-purple-800';
        case 'unit': return `bg-orange-50 border-orange-200 text-orange-800 ${node.status === 'Sold' ? 'opacity-60' : ''}`;
        default: return 'bg-gray-50 border-gray-200 text-gray-800';
      }
    };

    const getNodeDetails = () => {
      switch (node.type) {
        case 'wing':
          return `${node.wingType} • ${node.children?.length || 0} floors`;
        case 'floor':
          return `${node.unitsCount} units`;
        case 'unit':
          return `${node.unitType} • ${node.area} sq ft • ${node.status}`;
        default:
          return '';
      }
    };

    return (
      <div className={`ml-${level * 4}`}>
        <div className={`
          flex items-center p-3 rounded-lg border mb-2 transition-all duration-200
          ${getNodeColor()}
          hover:shadow-md cursor-pointer
        `}>
          <div className="flex items-center space-x-3 flex-1">
            {node.children && node.children.length > 0 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-gray-500 hover:text-gray-700"
              >
                {isExpanded ? '▼' : '▶'}
              </button>
            )}
            {getNodeIcon()}
            <div className="flex-1">
              <div className="font-medium">{node.name}</div>
              {getNodeDetails() && (
                <div className="text-sm opacity-75">{getNodeDetails()}</div>
              )}
            </div>
          </div>
        </div>
        
        {isExpanded && node.children && (
          <div className="ml-4 animate-slide-up">
            {node.children.map(child => (
              <TreeNode key={child.id} node={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleFinalize = () => {
    if (validationSummary.isValid) {
      onUpdate({ 
        finalizedAt: new Date().toISOString(),
        projectStats,
        validationSummary 
      });
      onNext();
    }
  };

  const projectTree = generateProjectTree();

  return (
    <div className="space-y-8 animate-slide-up">
      <Card className="overflow-hidden">
        <Card.Header>
          <div className="flex items-center justify-between">
            <Card.Title icon={CheckCircle} gradient>Review & Finalize</Card.Title>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportProject('json')}
                icon={Download}
              >
                Export JSON
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportProject('copy')}
                icon={Share2}
              >
                Copy Data
              </Button>
            </div>
          </div>
          <Card.Subtitle>
            Review your complete project configuration, validate all settings, and finalize the project creation.
          </Card.Subtitle>
          {exportStatus && (
            <div className="mt-2 p-2 bg-green-100 text-green-800 rounded text-sm">
              {exportStatus}
            </div>
          )}
        </Card.Header>

        <Card.Content>
          {/* Validation Summary */}
          <div 
            className="mb-8 p-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-200 cursor-pointer"
            onClick={() => toggleSection('validation')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <h4 className="text-lg font-bold text-red-800">Project Validation</h4>
              </div>
              <div className="text-sm text-red-600">
                {expandedSections.validation ? '▼ Hide' : '▶ Show'} • {validationSummary.errors.length} errors, {validationSummary.warnings.length} warnings
              </div>
            </div>
            
            {expandedSections.validation && (
              <div className="mt-4 space-y-4 animate-slide-up">
                {validationSummary.errors.length > 0 && (
                  <div className="p-4 bg-white rounded-lg border border-red-200">
                    <h5 className="font-semibold text-red-800 mb-3">❌ Errors (Must Fix)</h5>
                    <ul className="space-y-2">
                      {validationSummary.errors.map((error, index) => (
                        <li key={index} className="text-sm text-red-700 flex items-start">
                          <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span><strong>Step {error.step}:</strong> {error.message}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {validationSummary.warnings.length > 0 && (
                  <div className="p-4 bg-white rounded-lg border border-yellow-200">
                    <h5 className="font-semibold text-yellow-800 mb-3">⚠️ Warnings (Recommended)</h5>
                    <ul className="space-y-2">
                      {validationSummary.warnings.map((warning, index) => (
                        <li key={index} className="text-sm text-yellow-700 flex items-start">
                          <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span><strong>Step {warning.step}:</strong> {warning.message}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {validationSummary.errors.length === 0 && validationSummary.warnings.length === 0 && (
                  <div className="p-4 bg-white rounded-lg border border-green-200">
                    <div className="flex items-center space-x-3 text-green-800">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-semibold">All validations passed! Project is ready to finalize.</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Project Overview */}
          <div 
            className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 cursor-pointer"
            onClick={() => toggleSection('overview')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                <h4 className="text-lg font-bold text-blue-800">Project Statistics</h4>
              </div>
              <div className="text-sm text-blue-600">
                {expandedSections.overview ? '▼ Hide' : '▶ Show'}
              </div>
            </div>
            
            {expandedSections.overview && (
              <div className="animate-slide-up">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
                    <div className="text-3xl font-bold text-blue-600">{projectStats.totalTowers}</div>
                    <div className="text-sm text-gray-600">Towers</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
                    <div className="text-3xl font-bold text-green-600">{projectStats.totalWings}</div>
                    <div className="text-sm text-gray-600">Wings</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
                    <div className="text-3xl font-bold text-purple-600">{projectStats.totalFloors}</div>
                    <div className="text-sm text-gray-600">Floors</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
                    <div className="text-3xl font-bold text-orange-600">{projectStats.totalUnits}</div>
                    <div className="text-sm text-gray-600">Units</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-white rounded-lg border border-blue-200">
                    <h5 className="font-semibold text-gray-800 mb-3">📐 Area Summary</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Carpet Area:</span>
                        <span className="font-medium">{projectStats.totalCarpetArea?.toLocaleString()} sq ft</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Built-up Area:</span>
                        <span className="font-medium">{projectStats.totalBuiltUpArea?.toLocaleString()} sq ft</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average Unit Size:</span>
                        <span className="font-medium">
                          {projectStats.totalUnits > 0 ? Math.round(projectStats.totalCarpetArea / projectStats.totalUnits) : 0} sq ft
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-lg border border-blue-200">
                    <h5 className="font-semibold text-gray-800 mb-3">🏠 Unit Breakdown</h5>
                    <div className="space-y-2 text-sm">
                      {Object.entries(projectStats.unitBreakdown).map(([type, count]) => (
                        <div key={type} className="flex justify-between">
                          <span>{type}:</span>
                          <span className="font-medium">{count} units</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Project Structure Tree */}
          <div 
            className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 cursor-pointer"
            onClick={() => toggleSection('structure')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <TreePine className="w-6 h-6 text-green-600" />
                <h4 className="text-lg font-bold text-green-800">Project Structure</h4>
              </div>
              <div className="text-sm text-green-600">
                {expandedSections.structure ? '▼ Hide' : '▶ Show'} Tree View
              </div>
            </div>
            
            {expandedSections.structure && (
              <div className="animate-slide-up">
                <div className="bg-white p-4 rounded-lg border border-green-200 max-h-96 overflow-y-auto">
                  {projectTree.map(node => (
                    <TreeNode key={node.id} node={node} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Amenities Summary */}
          <div 
            className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 cursor-pointer"
            onClick={() => toggleSection('amenities')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Users className="w-6 h-6 text-purple-600" />
                <h4 className="text-lg font-bold text-purple-800">Amenities Overview</h4>
              </div>
              <div className="text-sm text-purple-600">
                {expandedSections.amenities ? '▼ Hide' : '▶ Show'} • {projectStats.amenitiesCount} amenities
              </div>
            </div>
            
            {expandedSections.amenities && (
              <div className="animate-slide-up">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Recreational */}
                  <div className="p-4 bg-white rounded-lg border border-purple-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <Waves className="w-5 h-5 text-blue-600" />
                      <h5 className="font-semibold text-gray-800">Recreational</h5>
                    </div>
                    <ul className="text-sm space-y-1">
                      {data.amenities?.recreational?.swimmingPool?.enabled && <li>✓ Swimming Pool</li>}
                      {data.amenities?.recreational?.gymnasium?.enabled && <li>✓ Gymnasium</li>}
                      {data.amenities?.recreational?.clubhouse?.enabled && <li>✓ Clubhouse</li>}
                      {data.amenities?.recreational?.garden?.enabled && <li>✓ Garden</li>}
                      {data.amenities?.recreational?.playArea?.enabled && <li>✓ Play Area</li>}
                    </ul>
                  </div>

                  {/* Security */}
                  <div className="p-4 bg-white rounded-lg border border-purple-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <Shield className="w-5 h-5 text-red-600" />
                      <h5 className="font-semibold text-gray-800">Security</h5>
                    </div>
                    <ul className="text-sm space-y-1">
                      {data.amenities?.security?.cctv?.enabled && <li>✓ CCTV Surveillance</li>}
                      {data.amenities?.security?.securityGuards?.enabled && <li>✓ Security Guards</li>}
                      {data.amenities?.security?.accessControl?.enabled && <li>✓ Access Control</li>}
                      {data.amenities?.security?.intercom?.enabled && <li>✓ Intercom System</li>}
                    </ul>
                  </div>

                  {/* Utilities */}
                  <div className="p-4 bg-white rounded-lg border border-purple-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <Zap className="w-5 h-5 text-yellow-600" />
                      <h5 className="font-semibold text-gray-800">Utilities</h5>
                    </div>
                    <ul className="text-sm space-y-1">
                      {data.amenities?.utilities?.powerBackup?.enabled && <li>✓ Power Backup</li>}
                      {data.amenities?.utilities?.waterSupply?.sources?.length > 0 && <li>✓ Water Supply</li>}
                      {data.amenities?.utilities?.sewageManagement?.stp && <li>✓ STP Plant</li>}
                      {data.amenities?.utilities?.internet?.enabled && <li>✓ Internet/WiFi</li>}
                    </ul>
                  </div>

                  {/* Parking */}
                  <div className="p-4 bg-white rounded-lg border border-purple-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <Car className="w-5 h-5 text-purple-600" />
                      <h5 className="font-semibold text-gray-800">Parking</h5>
                    </div>
                    <ul className="text-sm space-y-1">
                      <li>Covered: {projectStats.parkingSpaces.covered} spaces</li>
                      <li>Open: {projectStats.parkingSpaces.open} spaces</li>
                      <li>Visitor: {projectStats.parkingSpaces.visitor} spaces</li>
                      <li className="font-medium">Total: {projectStats.parkingSpaces.total} spaces</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Project Summary Card */}
          <div className="p-8 bg-gradient-to-r from-gray-900 to-blue-900 text-white rounded-2xl">
            <h4 className="text-2xl font-bold mb-6 text-center">🎯 Complete Project Summary</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center">
                <h5 className="font-bold text-blue-300 mb-4">📋 Project Details</h5>
                <div className="space-y-2 text-sm">
                  <div><strong>Name:</strong> {data.projectName}</div>
                  <div><strong>Type:</strong> {data.projectType}</div>
                  <div><strong>Location:</strong> {data.city}, {data.state}</div>
                  <div><strong>Manager:</strong> {data.manager}</div>
                  <div><strong>Duration:</strong> {projectStats.timeline.duration} months</div>
                </div>
              </div>

              <div className="text-center">
                <h5 className="font-bold text-green-300 mb-4">🏗️ Structure</h5>
                <div className="space-y-2 text-sm">
                  <div><strong>Towers:</strong> {projectStats.totalTowers}</div>
                  <div><strong>Wings:</strong> {projectStats.totalWings}</div>
                  <div><strong>Floors:</strong> {projectStats.totalFloors}</div>
                  <div><strong>Units:</strong> {projectStats.totalUnits}</div>
                  <div><strong>Total Area:</strong> {projectStats.totalCarpetArea?.toLocaleString()} sq ft</div>
                </div>
              </div>

              <div className="text-center">
                <h5 className="font-bold text-purple-300 mb-4">🎪 Amenities</h5>
                <div className="space-y-2 text-sm">
                  <div><strong>Total Amenities:</strong> {projectStats.amenitiesCount}</div>
                  <div><strong>Parking Spaces:</strong> {projectStats.parkingSpaces.total}</div>
                  <div><strong>Maintenance:</strong> ₹{data.amenities?.maintenance?.monthlyCharges}/sq ft</div>
                  <div><strong>Sinking Fund:</strong> {data.amenities?.maintenance?.sinkingFund}%</div>
                  <div><strong>Management:</strong> {data.amenities?.maintenance?.managementCompany || 'TBD'}</div>
                </div>
              </div>
            </div>

            {/* Key Highlights */}
            <div className="mt-8 pt-6 border-t border-gray-700">
              <h5 className="font-bold text-center mb-4 text-yellow-300">✨ Project Highlights</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <ul className="space-y-2">
                  {data.amenities?.recreational?.swimmingPool?.enabled && (
                    <li>🏊‍♂️ {data.amenities.recreational.swimmingPool.type} Swimming Pool</li>
                  )}
                  {data.amenities?.recreational?.gymnasium?.enabled && (
                    <li>💪 Fully Equipped Gymnasium</li>
                  )}
                  {data.amenities?.security?.cctv?.enabled && (
                    <li>📹 24x7 CCTV Surveillance</li>
                  )}
                  {data.amenities?.utilities?.powerBackup?.enabled && (
                    <li>⚡ {data.amenities.utilities.powerBackup.coverage} Power Backup</li>
                  )}
                </ul>
                <ul className="space-y-2">
                  {data.amenities?.recreational?.garden?.enabled && (
                    <li>🌳 Landscaped Gardens</li>
                  )}
                  {data.amenities?.parking?.evCharging?.enabled && (
                    <li>🔋 EV Charging Stations</li>
                  )}
                  {data.amenities?.utilities?.sewageManagement?.stp && (
                    <li>♻️ Sewage Treatment Plant</li>
                  )}
                  {data.amenities?.utilities?.waterSupply?.sources?.includes('Rainwater Harvesting') && (
                    <li>🌧️ Rainwater Harvesting</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Final Actions */}
          <div className="p-6 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-200">
            <h4 className="font-bold text-yellow-800 mb-4">📤 Export & Share Options</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                onClick={() => exportProject('json')}
                icon={FileText}
                className="w-full"
              >
                Download JSON
              </Button>
              <Button
                variant="outline"
                onClick={() => exportProject('copy')}
                icon={Share2}
                className="w-full"
              >
                Copy to Clipboard
              </Button>
              <Button
                variant="outline"
                onClick={() => console.log('PDF export coming soon')}
                icon={Download}
                className="w-full"
                disabled
              >
                Generate PDF (Soon)
              </Button>
            </div>
          </div>
        </Card.Content>

        <StepNavigation
          onPrevious={onPrevious}
          onNext={handleFinalize}
          onSave={handleSave}
          isValid={validationSummary.isValid}
          isLastStep={true}
          nextLabel="🎉 Finalize Project"
          previousLabel="Back: Amenities"
        />
      </Card>
    </div>
  );
};

export default Step6ReviewFinalize;
// TemplateBuilder.jsx - Fixed drag and drop with search and dynamic component creation
import React, { useState, useCallback, useEffect } from 'react';
import { X, Save, Plus, Trash2, Move, Home, Bed, Bath, Car, Utensils, Sofa, TreePine, Building, Users, Briefcase, Settings, CheckSquare, Search, Edit } from 'lucide-react';
import Button from './Button';
import Input from './Input';
import Select from './Select';

const ROOM_TYPES = {
  living_room: { icon: Sofa, label: 'Living Room', color: 'bg-blue-100 border-blue-300 text-blue-800' },
  bedroom: { icon: Bed, label: 'Bedroom', color: 'bg-green-100 border-green-300 text-green-800' },
  washroom: { icon: Bath, label: 'Washroom', color: 'bg-purple-100 border-purple-300 text-purple-800' },
  kitchen: { icon: Utensils, label: 'Kitchen', color: 'bg-orange-100 border-orange-300 text-orange-800' },
  balcony: { icon: TreePine, label: 'Balcony', color: 'bg-emerald-100 border-emerald-300 text-emerald-800' },
  entrance: { icon: Home, label: 'Entrance', color: 'bg-gray-100 border-gray-300 text-gray-800' },
  dining: { icon: Users, label: 'Dining Room', color: 'bg-pink-100 border-pink-300 text-pink-800' },
  study: { icon: Briefcase, label: 'Study Room', color: 'bg-indigo-100 border-indigo-300 text-indigo-800' },
  storage: { icon: Building, label: 'Storage', color: 'bg-yellow-100 border-yellow-300 text-yellow-800' },
  // Commercial rooms
  reception: { icon: Users, label: 'Reception', color: 'bg-cyan-100 border-cyan-300 text-cyan-800' },
  workspace: { icon: Briefcase, label: 'Workspace', color: 'bg-blue-100 border-blue-300 text-blue-800' },
  cabin: { icon: Building, label: 'Cabin', color: 'bg-purple-100 border-purple-300 text-purple-800' },
  meeting_room: { icon: Users, label: 'Meeting Room', color: 'bg-green-100 border-green-300 text-green-800' },
  pantry: { icon: Utensils, label: 'Pantry', color: 'bg-orange-100 border-orange-300 text-orange-800' },
  server_room: { icon: Building, label: 'Server Room', color: 'bg-red-100 border-red-300 text-red-800' }
};

const PREDEFINED_TEMPLATES = {
  'Standard 2BHK': {
    type: '2BHK',
    balconies: 2,
    attachedWashrooms: 2,
    commonWashrooms: 1,
    roomLayout: {
      id: 'root',
      name: 'Unit',
      type: 'unit',
      children: [
        {
          id: 'living_1',
          name: 'Living Room',
          type: 'living_room',
          children: []
        },
        {
          id: 'bedroom_1',
          name: 'Master Bedroom',
          type: 'bedroom',
          children: [
            {
              id: 'washroom_1',
              name: 'Attached Washroom',
              type: 'washroom',
              children: []
            }
          ]
        },
        {
          id: 'bedroom_2',
          name: 'Bedroom 2',
          type: 'bedroom',
          children: []
        },
        {
          id: 'kitchen_1',
          name: 'Kitchen',
          type: 'kitchen',
          children: []
        },
        {
          id: 'washroom_2',
          name: 'Common Washroom',
          type: 'washroom',
          children: []
        },
        {
          id: 'balcony_1',
          name: 'Main Balcony',
          type: 'balcony',
          children: []
        },
        {
          id: 'balcony_2',
          name: 'Kitchen Balcony',
          type: 'balcony',
          children: []
        }
      ]
    }
  },
  'Luxury 3BHK': {
    type: '3BHK',
    balconies: 3,
    attachedWashrooms: 3,
    commonWashrooms: 1,
    roomLayout: {
      id: 'root',
      name: 'Unit',
      type: 'unit',
      children: [
        {
          id: 'entrance_1',
          name: 'Entrance',
          type: 'entrance',
          children: []
        },
        {
          id: 'living_1',
          name: 'Living Room',
          type: 'living_room',
          children: []
        },
        {
          id: 'dining_1',
          name: 'Dining Room',
          type: 'dining',
          children: []
        },
        {
          id: 'bedroom_1',
          name: 'Master Bedroom',
          type: 'bedroom',
          children: [
            {
              id: 'washroom_1',
              name: 'Master Washroom',
              type: 'washroom',
              children: []
            },
            {
              id: 'balcony_1',
              name: 'Master Balcony',
              type: 'balcony',
              children: []
            }
          ]
        },
        {
          id: 'bedroom_2',
          name: 'Bedroom 2',
          type: 'bedroom',
          children: [
            {
              id: 'washroom_2',
              name: 'Attached Washroom 2',
              type: 'washroom',
              children: []
            }
          ]
        },
        {
          id: 'bedroom_3',
          name: 'Bedroom 3',
          type: 'bedroom',
          children: [
            {
              id: 'washroom_3',
              name: 'Attached Washroom 3',
              type: 'washroom',
              children: []
            }
          ]
        },
        {
          id: 'kitchen_1',
          name: 'Kitchen',
          type: 'kitchen',
          children: [
            {
              id: 'balcony_2',
              name: 'Kitchen Balcony',
              type: 'balcony',
              children: []
            }
          ]
        },
        {
          id: 'study_1',
          name: 'Study Room',
          type: 'study',
          children: []
        },
        {
          id: 'washroom_4',
          name: 'Common Washroom',
          type: 'washroom',
          children: []
        },
        {
          id: 'balcony_3',
          name: 'Living Room Balcony',
          type: 'balcony',
          children: []
        },
        {
          id: 'storage_1',
          name: 'Storage',
          type: 'storage',
          children: []
        }
      ]
    }
  },
  'Compact Studio': {
    type: 'Studio',
    balconies: 1,
    attachedWashrooms: 1,
    commonWashrooms: 0,
    roomLayout: {
      id: 'root',
      name: 'Unit',
      type: 'unit',
      children: [
        {
          id: 'living_1',
          name: 'Living/Bedroom Area',
          type: 'living_room',
          children: []
        },
        {
          id: 'kitchen_1',
          name: 'Kitchenette',
          type: 'kitchen',
          children: []
        },
        {
          id: 'washroom_1',
          name: 'Washroom',
          type: 'washroom',
          children: []
        },
        {
          id: 'balcony_1',
          name: 'Balcony',
          type: 'balcony',
          children: []
        }
      ]
    }
  },
  'Office Space': {
    type: 'Office',
    balconies: 0,
    attachedWashrooms: 0,
    commonWashrooms: 2,
    roomLayout: {
      id: 'root',
      name: 'Office Unit',
      type: 'unit',
      children: [
        {
          id: 'reception_1',
          name: 'Reception',
          type: 'reception',
          children: []
        },
        {
          id: 'workspace_1',
          name: 'Open Workspace',
          type: 'workspace',
          children: []
        },
        {
          id: 'cabin_1',
          name: 'Manager Cabin',
          type: 'cabin',
          children: []
        },
        {
          id: 'cabin_2',
          name: 'Director Cabin',
          type: 'cabin',
          children: []
        },
        {
          id: 'meeting_1',
          name: 'Meeting Room',
          type: 'meeting_room',
          children: []
        },
        {
          id: 'pantry_1',
          name: 'Pantry',
          type: 'pantry',
          children: []
        },
        {
          id: 'washroom_1',
          name: 'Washroom 1',
          type: 'washroom',
          children: []
        },
        {
          id: 'washroom_2',
          name: 'Washroom 2',
          type: 'washroom',
          children: []
        },
        {
          id: 'storage_1',
          name: 'Storage',
          type: 'storage',
          children: []
        }
      ]
    }
  }
};

const TemplateBuilder = ({ 
  onClose, 
  onSave, 
  existingTemplates = {}, 
  selectedUnit = null,
  onApplyToSelected 
}) => {
  const [templateName, setTemplateName] = useState('');
  const [templateType, setTemplateType] = useState('2BHK');
  const [roomLayout, setRoomLayout] = useState({
    id: 'root',
    name: 'Unit',
    type: 'unit',
    children: []
  });
  const [draggedItem, setDraggedItem] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set(['root']));
  const [selectedNode, setSelectedNode] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [unitConfig, setUnitConfig] = useState({
    balconies: 2,
    attachedWashrooms: 2,
    commonWashrooms: 1
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [customRoomTypes, setCustomRoomTypes] = useState({});
  const [showNewRoomForm, setShowNewRoomForm] = useState(false);
  const [newRoomData, setNewRoomData] = useState({
    key: '',
    label: '',
    icon: 'Home',
    color: 'bg-gray-100 border-gray-300 text-gray-800'
  });
  const [templateColor, setTemplateColor] = useState('bg-blue-100 border-blue-300 text-blue-800');

  // Available template colors
  const TEMPLATE_COLORS = [
    { value: 'bg-blue-100 border-blue-300 text-blue-800', label: 'Blue', preview: 'bg-blue-500' },
    { value: 'bg-yellow-100 border-yellow-300 text-yellow-800', label: 'Yellow', preview: 'bg-yellow-500' },
    { value: 'bg-green-100 border-green-300 text-green-800', label: 'Green', preview: 'bg-green-500' },
    { value: 'bg-purple-100 border-purple-300 text-purple-800', label: 'Purple', preview: 'bg-purple-500' },
    { value: 'bg-red-100 border-red-300 text-red-800', label: 'Red', preview: 'bg-red-500' },
    { value: 'bg-pink-100 border-pink-300 text-pink-800', label: 'Pink', preview: 'bg-pink-500' },
    { value: 'bg-indigo-100 border-indigo-300 text-indigo-800', label: 'Indigo', preview: 'bg-indigo-500' },
    { value: 'bg-orange-100 border-orange-300 text-orange-800', label: 'Orange', preview: 'bg-orange-500' },
    { value: 'bg-cyan-100 border-cyan-300 text-cyan-800', label: 'Cyan', preview: 'bg-cyan-500' },
    { value: 'bg-emerald-100 border-emerald-300 text-emerald-800', label: 'Emerald', preview: 'bg-emerald-500' },
    { value: 'bg-gray-100 border-gray-300 text-gray-800', label: 'Gray', preview: 'bg-gray-500' },
    { value: 'bg-slate-100 border-slate-300 text-slate-800', label: 'Slate', preview: 'bg-slate-500' }
  ];

  // Initialize template color based on selected unit or default
  useEffect(() => {
    if (selectedUnit && selectedUnit.templateColor) {
      setTemplateColor(selectedUnit.templateColor);
    }
  });

  // Initialize with selected unit data if available
  useEffect(() => {
    if (selectedUnit) {
      setTemplateType(selectedUnit.type);
      setUnitConfig({
        balconies: selectedUnit.balconies || 2,
        attachedWashrooms: selectedUnit.attachedWashrooms || 2,
        commonWashrooms: selectedUnit.commonWashrooms || 1
      });
      if (selectedUnit.roomLayout) {
        setRoomLayout(selectedUnit.roomLayout);
      }
    }
  }, [selectedUnit]);

  const generateId = () => `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const addRoomToParent = (parentId, roomType) => {
    const allRoomTypes = { ...ROOM_TYPES, ...customRoomTypes };
    const newRoom = {
      id: generateId(),
      name: allRoomTypes[roomType].label,
      type: roomType,
      children: []
    };

    const addToNode = (node) => {
      if (node.id === parentId) {
        return { ...node, children: [...node.children, newRoom] };
      }
      return { ...node, children: node.children.map(addToNode) };
    };

    setRoomLayout(addToNode);
    setExpandedNodes(prev => new Set([...prev, parentId]));
    setDropTarget(null);
  };

  const removeRoom = (roomId) => {
    const removeFromNode = (node) => {
      return {
        ...node,
        children: node.children
          .filter(child => child.id !== roomId)
          .map(removeFromNode)
      };
    };

    setRoomLayout(removeFromNode);
    setSelectedNode(null);
  };

  const updateRoom = (roomId, updates) => {
    const updateNode = (node) => {
      if (node.id === roomId) {
        return { ...node, ...updates };
      }
      return { ...node, children: node.children.map(updateNode) };
    };

    setRoomLayout(updateNode);
  };

  const moveRoom = (sourceId, targetId) => {
    if (sourceId === targetId) return;
    
    let roomToMove = null;

    // Find and remove the room
    const removeFromNode = (node) => {
      const filteredChildren = node.children.filter(child => {
        if (child.id === sourceId) {
          roomToMove = child;
          return false;
        }
        return true;
      });

      return {
        ...node,
        children: filteredChildren.map(removeFromNode)
      };
    };

    // Add room to new parent
    const addToNode = (node) => {
      if (node.id === targetId && roomToMove) {
        return { ...node, children: [...node.children, roomToMove] };
      }
      return { ...node, children: node.children.map(addToNode) };
    };

    const layoutWithoutRoom = removeFromNode(roomLayout);
    if (roomToMove) {
      setRoomLayout(addToNode(layoutWithoutRoom));
      setExpandedNodes(prev => new Set([...prev, targetId]));
    }
  };

  const toggleNodeExpansion = (nodeId) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const handleDragStart = (e, roomType) => {
    setDraggedItem(roomType);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedItem) {
      addRoomToParent(targetId, draggedItem);
      setDraggedItem(null);
    }
  };

  const handleRoomMove = (e, sourceId) => {
    e.dataTransfer.setData('sourceId', sourceId);
  };

  const handleRoomDrop = (e, targetId) => {
    e.preventDefault();
    e.stopPropagation();
    const sourceId = e.dataTransfer.getData('sourceId');
    if (sourceId && sourceId !== targetId) {
      moveRoom(sourceId, targetId);
    }
  };

  const handleDragEnter = (e, nodeId) => {
    e.preventDefault();
    setDropTarget(nodeId);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    // Only clear drop target if we're leaving the component entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDropTarget(null);
    }
  };

  const saveTemplate = () => {
    if (!templateName.trim()) {
      alert('Please enter a template name');
      return;
    }

    const template = {
      name: templateName,
      type: templateType,
      ...unitConfig,
      roomLayout,
      createdAt: new Date().toISOString(),
      templateColor
    };

    onSave(template);
    onClose();
  };

  const applyToSelected = () => {
    if (!templateName.trim()) {
      alert('Please enter a template name');
      return;
    }

    const template = {
      name: templateName,
      type: templateType,
      ...unitConfig,
      roomLayout,
      templateColor
    };

    onApplyToSelected(template);
  };

  const addCustomRoomType = () => {
    if (!newRoomData.key || !newRoomData.label) {
      alert('Please enter both key and label for the new room type');
      return;
    }

    const iconMap = {
      'Home': Home,
      'Bed': Bed,
      'Bath': Bath,
      'Car': Car,
      'Utensils': Utensils,
      'Sofa': Sofa,
      'TreePine': TreePine,
      'Building': Building,
      'Users': Users,
      'Briefcase': Briefcase,
      'Settings': Settings
    };

    setCustomRoomTypes(prev => ({
      ...prev,
      [newRoomData.key]: {
        icon: iconMap[newRoomData.icon] || Home,
        label: newRoomData.label,
        color: newRoomData.color
      }
    }));

    setNewRoomData({
      key: '',
      label: '',
      icon: 'Home',
      color: 'bg-gray-100 border-gray-300 text-gray-800'
    });
    setShowNewRoomForm(false);
  };

  const allRoomTypes = { ...ROOM_TYPES, ...customRoomTypes };
  const filteredRoomTypes = Object.entries(allRoomTypes).filter(([key, config]) =>
    config.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const RoomNode = ({ node, level = 0, parentId = null }) => {
    const roomType = allRoomTypes[node.type] || allRoomTypes.living_room;
    const Icon = roomType.icon;
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedNode === node.id;
    const hasChildren = node.children && node.children.length > 0;
    const isDropTarget = dropTarget === node.id;

    return (
      <div className={`ml-${level * 4}`}>
        <div
          className={`
            flex items-center p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer group
            ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}
            ${isDropTarget ? 'border-green-500 bg-green-50 shadow-lg' : ''}
            ${roomType.color}
          `}
          onClick={() => setSelectedNode(node.id)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, node.id)}
          onDragEnter={(e) => handleDragEnter(e, node.id)}
          onDragLeave={handleDragLeave}
          draggable={node.id !== 'root'}
          onDragStart={(e) => handleRoomMove(e, node.id)}
        >
          <div className="flex items-center space-x-3 flex-1">
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNodeExpansion(node.id);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                {isExpanded ? '▼' : '▶'}
              </button>
            )}
            
            <Icon className="w-5 h-5" />
            
            <div className="flex-1">
              <div className="font-medium">{node.name}</div>
              <div className="text-xs text-gray-600 capitalize">{node.type.replace('_', ' ')}</div>
            </div>
          </div>

          {node.id !== 'root' && (
            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNode(node.id);
                }}
                className="p-1 text-blue-600 hover:bg-blue-100 rounded"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeRoom(node.id);
                }}
                className="p-1 text-red-600 hover:bg-red-100 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Drop indicator */}
          {isDropTarget && (
            <div className="absolute inset-0 border-2 border-green-500 border-dashed rounded-lg pointer-events-none animate-pulse"></div>
          )}
        </div>

        {isExpanded && hasChildren && (
          <div className="mt-2 space-y-2">
            {node.children.map(child => (
              <RoomNode key={child.id} node={child} level={level + 1} parentId={node.id} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">🏗️ Room Layout Template Builder</h3>
            <p className="text-gray-600 mt-1">Design custom room layouts using drag and drop</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} icon={X}>
            Close
          </Button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Left Panel - Room Components */}
          <div className="w-80 border-r border-gray-200 p-6 overflow-y-auto bg-gray-50">
            <h4 className="font-bold text-gray-800 mb-4">🧩 Room Components</h4>
            
            {/* Search */}
            <div className="mb-4">
              <Input
                placeholder="Search components..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={Search}
                className="text-sm"
              />
            </div>

            {/* Add Custom Room Type */}
            <div className="mb-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNewRoomForm(!showNewRoomForm)}
                icon={Plus}
                className="w-full"
              >
                Create Custom Component
              </Button>
              
              {showNewRoomForm && (
                <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 space-y-3">
                  <Input
                    label="Component Key"
                    placeholder="e.g., study_room"
                    value={newRoomData.key}
                    onChange={(e) => setNewRoomData(prev => ({ ...prev, key: e.target.value.toLowerCase().replace(/\s+/g, '_') }))}
                    className="text-sm"
                  />
                  <Input
                    label="Display Name"
                    placeholder="e.g., Study Room"
                    value={newRoomData.label}
                    onChange={(e) => setNewRoomData(prev => ({ ...prev, label: e.target.value }))}
                    className="text-sm"
                  />
                  <Select
                    label="Icon"
                    options={['Home', 'Bed', 'Bath', 'Car', 'Utensils', 'Sofa', 'TreePine', 'Building', 'Users', 'Briefcase', 'Settings']}
                    value={newRoomData.icon}
                    onChange={(e) => setNewRoomData(prev => ({ ...prev, icon: e.target.value }))}
                  />
                  <Select
                    label="Color Theme"
                    options={[
                      { value: 'bg-blue-100 border-blue-300 text-blue-800', label: 'Blue' },
                      { value: 'bg-green-100 border-green-300 text-green-800', label: 'Green' },
                      { value: 'bg-purple-100 border-purple-300 text-purple-800', label: 'Purple' },
                      { value: 'bg-orange-100 border-orange-300 text-orange-800', label: 'Orange' },
                      { value: 'bg-pink-100 border-pink-300 text-pink-800', label: 'Pink' },
                      { value: 'bg-gray-100 border-gray-300 text-gray-800', label: 'Gray' }
                    ]}
                    value={newRoomData.color}
                    onChange={(e) => setNewRoomData(prev => ({ ...prev, color: e.target.value }))}
                  />
                  <div className="flex space-x-2">
                    <Button
                      variant="success"
                      size="sm"
                      onClick={addCustomRoomType}
                      disabled={!newRoomData.key || !newRoomData.label}
                    >
                      Add
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowNewRoomForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            <p className="text-sm text-gray-600 mb-6">Drag rooms into the layout area or into other rooms to create nested structures</p>
            
            <div className="space-y-3">
              {filteredRoomTypes.map(([type, config]) => {
                const Icon = config.icon;
                return (
                  <div
                    key={type}
                    draggable
                    onDragStart={(e) => handleDragStart(e, type)}
                    className={`
                      flex items-center p-3 rounded-lg border-2 cursor-move transition-all duration-200
                      hover:shadow-md hover:scale-105 ${config.color}
                    `}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    <span className="font-medium">{config.label}</span>
                    <Move className="w-4 h-4 ml-auto text-gray-500" />
                  </div>
                );
              })}
            </div>

            {/* Template Configuration */}
            <div className="mt-8 pt-6 border-t border-gray-300">
              <h5 className="font-bold text-gray-800 mb-4">⚙️ Template Settings</h5>
              <div className="space-y-4">
                <Input
                  label="Template Name"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., Luxury 3BHK"
                  required
                />
                
                <Select
                  label="Unit Type"
                  options={['1BHK', '2BHK', '3BHK', '4BHK', 'Duplex', 'Penthouse', 'Studio', 'Office', 'Retail']}
                  value={templateType}
                  onChange={(e) => setTemplateType(e.target.value)}
                />
                
                <Input.Number
                  label="Balconies"
                  value={unitConfig.balconies}
                  onChange={(e) => setUnitConfig(prev => ({ ...prev, balconies: parseInt(e.target.value) || 0 }))}
                  min={0}
                  max={5}
                />
                
                <Input.Number
                  label="Attached Washrooms"
                  value={unitConfig.attachedWashrooms}
                  onChange={(e) => setUnitConfig(prev => ({ ...prev, attachedWashrooms: parseInt(e.target.value) || 0 }))}
                  min={0}
                  max={5}
                />
                
                <Input.Number
                  label="Common Washrooms"
                  value={unitConfig.commonWashrooms}
                  onChange={(e) => setUnitConfig(prev => ({ ...prev, commonWashrooms: parseInt(e.target.value) || 0 }))}
                  min={0}
                  max={3}
                />
                
                {/* Template Color Selection */}
                <div>
                  <label className="form-label">Template Color</label>
                  <div className="grid grid-cols-3 gap-2">
                    {TEMPLATE_COLORS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setTemplateColor(color.value)}
                        className={`
                          flex items-center p-2 rounded-lg border-2 text-xs transition-all duration-200
                          ${templateColor === color.value 
                            ? 'ring-2 ring-blue-500 ring-offset-1 shadow-md' 
                            : 'hover:shadow-sm'
                          }
                          ${color.value}
                        `}
                      >
                        <div className={`w-3 h-3 rounded-full mr-2 ${color.preview}`}></div>
                        <span className="font-medium">{color.label}</span>
                      </button>
                    ))}
                  </div>
                  
                  {/* Template Preview */}
                  <div className="mt-3">
                    <div className={`
                      inline-block px-3 py-2 rounded-lg border-2 text-sm font-medium
                      ${templateColor}
                    `}>
                      Preview: {templateName || 'Template Name'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Center Panel - Layout Builder */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-bold text-gray-800">🏠 Room Layout Design</h4>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRoomLayout({
                    id: 'root',
                    name: 'Unit',
                    type: 'unit',
                    children: []
                  })}
                  icon={Trash2}
                >
                  Clear All
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    // Load a predefined template
                    const template = Object.values(PREDEFINED_TEMPLATES)[0];
                    if (template.roomLayout) {
                      setRoomLayout(template.roomLayout);
                      setUnitConfig({
                        balconies: template.balconies,
                        attachedWashrooms: template.attachedWashrooms,
                        commonWashrooms: template.commonWashrooms
                      });
                    }
                  }}
                >
                  Load Sample
                </Button>
              </div>
            </div>

            {/* Drop Zone */}
            <div
              className={`
                min-h-96 border-2 border-dashed rounded-xl p-6 transition-all duration-200
                ${dropTarget === 'root' 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-300 bg-gradient-to-br from-blue-50 to-purple-50'
                }
              `}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'root')}
              onDragEnter={(e) => handleDragEnter(e, 'root')}
              onDragLeave={handleDragLeave}
            >
              {roomLayout.children.length === 0 ? (
                <div className="text-center py-12">
                  <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-600 mb-2">Start Building Your Layout</h4>
                  <p className="text-gray-500">Drag room components from the left panel to create your unit layout</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <RoomNode node={roomLayout} />
                </div>
              )}
            </div>

            {/* Layout Statistics */}
            {roomLayout.children.length > 0 && (
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg border border-blue-200">
                <h5 className="font-semibold text-blue-800 mb-3">📊 Layout Statistics</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-blue-700">Total Rooms:</span>
                    <span className="ml-2 font-bold">{roomLayout.children.length}</span>
                  </div>
                  <div>
                    <span className="font-medium text-green-700">Bedrooms:</span>
                    <span className="ml-2 font-bold">
                      {roomLayout.children.filter(room => room.type === 'bedroom').length}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-purple-700">Washrooms:</span>
                    <span className="ml-2 font-bold">
                      {roomLayout.children.filter(room => room.type === 'washroom').length + 
                       roomLayout.children.reduce((sum, room) => 
                         sum + (room.children?.filter(child => child.type === 'washroom').length || 0), 0)}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-orange-700">Balconies:</span>
                    <span className="ml-2 font-bold">
                      {roomLayout.children.filter(room => room.type === 'balcony').length + 
                       roomLayout.children.reduce((sum, room) => 
                         sum + (room.children?.filter(child => child.type === 'balcony').length || 0), 0)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Room Properties */}
          <div className="w-80 border-l border-gray-200 p-6 overflow-y-auto bg-gray-50">
            <h4 className="font-bold text-gray-800 mb-4">🔧 Room Properties</h4>
            
            {selectedNode ? (
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <h5 className="font-semibold text-gray-800 mb-3">Edit Room</h5>
                  
                  {/* Find the selected room */}
                  {(() => {
                    let selectedRoom = null;
                    const findRoom = (node) => {
                      if (node.id === selectedNode) {
                        selectedRoom = node;
                        return;
                      }
                      node.children?.forEach(findRoom);
                    };
                    findRoom(roomLayout);

                    if (!selectedRoom) return <p className="text-gray-500">Room not found</p>;

                    return (
                      <div className="space-y-3">
                        <Input
                          label="Room Name"
                          value={selectedRoom.name}
                          onChange={(e) => updateRoom(selectedNode, { name: e.target.value })}
                        />

                        <Select
                          label="Room Type"
                          options={Object.entries(allRoomTypes).map(([key, config]) => ({
                            value: key,
                            label: config.label
                          }))}
                          value={selectedRoom.type}
                          onChange={(e) => updateRoom(selectedNode, { type: e.target.value })}
                        />

                        <div className="pt-3 border-t border-gray-200">
                          <h6 className="font-medium text-gray-700 mb-2">Add Sub-rooms</h6>
                          <div className="grid grid-cols-2 gap-2">
                            {['washroom', 'balcony', 'storage'].map(roomType => {
                              const config = allRoomTypes[roomType];
                              const Icon = config.icon;
                              return (
                                <button
                                  key={roomType}
                                  onClick={() => addRoomToParent(selectedNode, roomType)}
                                  className="flex items-center p-2 text-xs rounded border border-gray-200 hover:bg-gray-100"
                                >
                                  <Icon className="w-3 h-3 mr-1" />
                                  {config.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {selectedRoom.id !== 'root' && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => removeRoom(selectedNode)}
                            icon={Trash2}
                            className="w-full"
                          >
                            Remove Room
                          </Button>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Select a room to edit its properties</p>
              </div>
            )}

            {/* Quick Templates */}
            <div className="mt-8 pt-6 border-t border-gray-300">
              <h5 className="font-bold text-gray-800 mb-4">⚡ Quick Templates</h5>
              <div className="space-y-2">
                {Object.entries(PREDEFINED_TEMPLATES).map(([name, template]) => (
                  <button
                    key={name}
                    onClick={() => {
                      setRoomLayout(template.roomLayout);
                      setTemplateType(template.type);
                      setUnitConfig({
                        balconies: template.balconies,
                        attachedWashrooms: template.attachedWashrooms,
                        commonWashrooms: template.commonWashrooms
                      });
                      setExpandedNodes(new Set(['root']));
                    }}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <div className="font-medium text-gray-800">{name}</div>
                    <div className="text-xs text-gray-600">{template.type}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {roomLayout.children.length} rooms configured
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            
            {onApplyToSelected && selectedUnit && (
              <Button
                variant="success"
                onClick={applyToSelected}
                disabled={!templateName.trim()}
                icon={CheckSquare}
              >
                Apply to Selected Units
              </Button>
            )}
            
            <Button
              variant="primary"
              onClick={saveTemplate}
              disabled={!templateName.trim()}
              icon={Save}
            >
              Save Template
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateBuilder;
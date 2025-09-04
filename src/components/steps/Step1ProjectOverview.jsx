import React, { useState, useEffect } from 'react';
import { Building, MapPin, Calendar, User, Sparkles } from 'lucide-react';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import StepNavigation from '../wizard/StepNavigation';
import { PROJECT_TYPES, INDIAN_STATES, SAMPLE_PROJECT_DATA } from '../../utils/constants';
import { validateProjectOverview, generateProjectCode } from '../../utils/validation';

const Step1ProjectOverview = ({ 
  data, 
  onUpdate, 
  onNext,
  onSave
}) => {
  const [formData, setFormData] = useState({
    projectName: '',
    projectCode: '',
    projectType: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    startDate: '',
    endDate: '',
    manager: '',
    phaseType: 'Single',
    ...data
  });

  const [errors, setErrors] = useState({});
  const [autoGenerateCode, setAutoGenerateCode] = useState(true);

  // Auto-generate project code when name or city changes
  useEffect(() => {
    if (autoGenerateCode && formData.projectName && formData.city) {
      const newCode = generateProjectCode(formData.projectName, formData.city);
      setFormData(prev => ({ ...prev, projectCode: newCode }));
    }
  }, [formData.projectName, formData.city, autoGenerateCode]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const loadSampleData = () => {
    setFormData({ ...formData, ...SAMPLE_PROJECT_DATA });
    setErrors({});
  };

  const handleNext = () => {
    const validation = validateProjectOverview(formData);
    
    if (validation.isValid) {
      onUpdate(formData);
      onNext();
    } else {
      setErrors(validation.errors);
    }
  };

  const handleSave = () => {
    onUpdate(formData);
    onSave?.(formData);
  };

  const managers = [
    { value: 'ankit.shah', label: 'Ankit Shah' },
    { value: 'priya.patel', label: 'Priya Patel' },
    { value: 'rajesh.kumar', label: 'Rajesh Kumar' },
    { value: 'sonia.gupta', label: 'Sonia Gupta' }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <Card.Header>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Building className="w-6 h-6 text-blue-600" />
              <Card.Title>Project Overview</Card.Title>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadSampleData}
              className="flex items-center"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Load Sample Data
            </Button>
          </div>
          <p className="text-gray-600 mt-2">
            Enter the basic information for your project. This will form the foundation of your project hierarchy.
          </p>
        </Card.Header>

        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Project Name */}
            <Input
              label="Project Name"
              placeholder="e.g., Gorealla Heights"
              value={formData.projectName}
              onChange={(e) => handleChange('projectName', e.target.value)}
              error={errors.projectName}
              required
            />

            {/* Project Code */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <label className="form-label mb-0">Project Code</label>
                <label className="flex items-center text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={autoGenerateCode}
                    onChange={(e) => setAutoGenerateCode(e.target.checked)}
                    className="mr-1"
                  />
                  Auto-generate
                </label>
              </div>
              <Input
                placeholder="GH-MUM-2025"
                value={formData.projectCode}
                onChange={(e) => handleChange('projectCode', e.target.value)}
                error={errors.projectCode}
                disabled={autoGenerateCode}
              />
            </div>

            {/* Project Type */}
            <Select
              label="Project Type"
              placeholder="Select project type"
              options={PROJECT_TYPES}
              value={formData.projectType}
              onChange={(e) => handleChange('projectType', e.target.value)}
              error={errors.projectType}
              required
            />

            <div></div> {/* Empty cell for spacing */}

            {/* Location Section */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-medium text-gray-800">Location Information</h3>
              </div>
            </div>

            <Input
              label="Address"
              placeholder="Plot number, street name, area"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              error={errors.address}
              containerClassName="md:col-span-2"
              required
            />

            <Input
              label="City"
              placeholder="City name"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              error={errors.city}
              required
            />

            <Select
              label="State"
              placeholder="Select state"
              options={INDIAN_STATES}
              value={formData.state}
              onChange={(e) => handleChange('state', e.target.value)}
              error={errors.state}
              required
            />

            <Input
              label="Pincode"
              placeholder="6-digit pincode"
              value={formData.pincode}
              onChange={(e) => handleChange('pincode', e.target.value)}
              error={errors.pincode}
              type="text"
              maxLength={6}
              required
            />

            <div></div> {/* Empty cell for spacing */}

            {/* Timeline Section */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-medium text-gray-800">Project Timeline</h3>
              </div>
            </div>

            <Input
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              error={errors.startDate}
              required
            />

            <Input
              label="Expected Completion Date"
              type="date"
              value={formData.endDate}
              onChange={(e) => handleChange('endDate', e.target.value)}
              error={errors.endDate}
              required
            />

            {/* Management Section */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-medium text-gray-800">Project Management</h3>
              </div>
            </div>

            <Select
              label="Project Manager"
              placeholder="Select project manager"
              options={managers}
              value={formData.manager}
              onChange={(e) => handleChange('manager', e.target.value)}
              error={errors.manager}
              required
            />

            <div>
              <label className="form-label">Project Scale</label>
              <div className="flex space-x-6 mt-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="Single"
                    checked={formData.phaseType === 'Single'}
                    onChange={(e) => handleChange('phaseType', e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-gray-700">Single Phase</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="Multiple"
                    checked={formData.phaseType === 'Multiple'}
                    onChange={(e) => handleChange('phaseType', e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-gray-700">Multiple Phases</span>
                </label>
              </div>
            </div>
          </div>
        </Card.Content>

        <StepNavigation
          onNext={handleNext}
          onSave={handleSave}
          isFirstStep={true}
          nextLabel="Next: Phase Setup"
        />
      </Card>
    </div>
  );
};

export default Step1ProjectOverview;
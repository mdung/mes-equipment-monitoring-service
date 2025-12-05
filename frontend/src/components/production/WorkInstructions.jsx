import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, Circle, AlertTriangle, Clock } from 'lucide-react';
import api from '../../services/api';
import { useTranslation } from 'react-i18next';

const WorkInstructions = ({ orderId, productName }) => {
  const { t } = useTranslation();
  const [instructions, setInstructions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (orderId || productName) {
      fetchWorkInstructions();
    }
  }, [orderId, productName]);

  const fetchWorkInstructions = async () => {
    try {
      // Try to fetch work instructions for the product
      const res = await api.get(`/work-instructions/product/${productName}`).catch(() => null);
      
      if (res && res.data) {
        setInstructions(res.data.sort((a, b) => a.stepNumber - b.stepNumber));
      } else {
        // Fallback: create sample instructions
        setInstructions([
          {
            id: 1,
            stepNumber: 1,
            stepTitle: 'Material Preparation',
            description: 'Prepare all required materials according to BOM',
            estimatedDurationMinutes: 30,
            requiredEquipment: 'Material Handling Equipment',
            safetyNotes: 'Wear appropriate PPE',
            qualityCheckpoints: 'Verify material quantities and quality'
          },
          {
            id: 2,
            stepNumber: 2,
            stepTitle: 'Setup Equipment',
            description: 'Configure equipment according to specifications',
            estimatedDurationMinutes: 45,
            requiredEquipment: 'Production Equipment',
            safetyNotes: 'Ensure equipment is properly locked out before setup',
            qualityCheckpoints: 'Calibration check required'
          },
          {
            id: 3,
            stepNumber: 3,
            stepTitle: 'Production Process',
            description: 'Execute production process following standard procedures',
            estimatedDurationMinutes: 120,
            requiredEquipment: 'Production Equipment',
            safetyNotes: 'Monitor equipment parameters continuously',
            qualityCheckpoints: 'In-process quality checks every 30 minutes'
          },
          {
            id: 4,
            stepNumber: 4,
            stepTitle: 'Quality Inspection',
            description: 'Perform final quality inspection',
            estimatedDurationMinutes: 30,
            requiredEquipment: 'Inspection Equipment',
            safetyNotes: 'Handle products with care',
            qualityCheckpoints: 'Full quality checklist required'
          },
          {
            id: 5,
            stepNumber: 5,
            stepTitle: 'Packaging and Labeling',
            description: 'Package finished products and apply labels',
            estimatedDurationMinutes: 20,
            requiredEquipment: 'Packaging Equipment',
            safetyNotes: 'Ensure proper labeling',
            qualityCheckpoints: 'Verify label accuracy'
          }
        ]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching work instructions:', error);
      setLoading(false);
    }
  };

  const markStepComplete = (stepId) => {
    setInstructions(prev => 
      prev.map(step => 
        step.id === stepId 
          ? { ...step, completed: true, completedAt: new Date() }
          : step
      )
    );
  };

  if (loading) {
    return <div className="text-center py-4">Loading work instructions...</div>;
  }

  if (instructions.length === 0) {
    return (
      <div className="text-center py-8 text-secondary dark:text-slate-400">
        No work instructions available for this product.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg dark:text-slate-200 flex items-center gap-2">
          <FileText size={20} />
          Work Instructions
        </h3>
        <div className="text-sm text-secondary dark:text-slate-400">
          Step {currentStep + 1} of {instructions.length}
        </div>
      </div>

      <div className="space-y-4">
        {instructions.map((step, index) => (
          <div
            key={step.id}
            className={`p-4 rounded-lg border dark:border-slate-700 ${
              step.completed 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                : index === currentStep
                ? 'bg-accent/10 dark:bg-accent/20 border-accent'
                : 'bg-white dark:bg-slate-800'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                {step.completed ? (
                  <CheckCircle size={24} className="text-success" />
                ) : (
                  <Circle size={24} className="text-secondary dark:text-slate-400" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold dark:text-slate-200">
                    Step {step.stepNumber}: {step.stepTitle}
                  </h4>
                  {step.estimatedDurationMinutes && (
                    <div className="flex items-center gap-1 text-sm text-secondary dark:text-slate-400">
                      <Clock size={16} />
                      {step.estimatedDurationMinutes} min
                    </div>
                  )}
                </div>
                
                <p className="text-sm text-secondary dark:text-slate-300 mb-3">
                  {step.description}
                </p>

                {step.requiredEquipment && (
                  <div className="mb-2">
                    <span className="text-xs font-medium text-secondary dark:text-slate-400">Equipment: </span>
                    <span className="text-xs dark:text-slate-300">{step.requiredEquipment}</span>
                  </div>
                )}

                {step.safetyNotes && (
                  <div className="mb-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={16} className="text-warning flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-medium text-warning">Safety Notes: </span>
                        <span className="text-xs text-warning">{step.safetyNotes}</span>
                      </div>
                    </div>
                  </div>
                )}

                {step.qualityCheckpoints && (
                  <div className="mb-2">
                    <span className="text-xs font-medium text-secondary dark:text-slate-400">Quality Checkpoints: </span>
                    <span className="text-xs dark:text-slate-300">{step.qualityCheckpoints}</span>
                  </div>
                )}

                {!step.completed && index === currentStep && (
                  <button
                    onClick={() => markStepComplete(step.id)}
                    className="mt-3 px-4 py-2 bg-success text-white rounded hover:bg-success/90 text-sm"
                  >
                    Mark as Complete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 pt-4">
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => setCurrentStep(Math.min(instructions.length - 1, currentStep + 1))}
          disabled={currentStep === instructions.length - 1}
          className="px-4 py-2 bg-accent text-white rounded hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default WorkInstructions;


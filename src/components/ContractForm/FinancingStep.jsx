// File: src/components/ContractForm/FinancingStep.jsx
// Step 1: Financing details container component - PRODUCTION READY

import React from 'react';
import BasicInfoFields from './BasicInfoFields.jsx';
import FixedInterestFields from './FixedInterestFields.jsx';
import VariableInterestFields from './VariableInterestFields.jsx';
import InterestCalculationDisplay from './InterestCalculationDisplay.jsx';

const FinancingStep = ({ 
  formData, 
  onInputChange, 
  effectiveRate, 
  canShowCalculation 
}) => {
  return (
    <div>
      <BasicInfoFields 
        formData={formData} 
        onInputChange={onInputChange} 
      />

      {formData.interestType === 'fixed' && (
        <FixedInterestFields 
          formData={formData} 
          onInputChange={onInputChange} 
        />
      )}

      {formData.interestType === 'variable' && (
        <>
          <VariableInterestFields 
            formData={formData} 
            onInputChange={onInputChange}
            effectiveRate={effectiveRate}
          />

          {canShowCalculation && (
            <InterestCalculationDisplay formData={formData} />
          )}
        </>
      )}
    </div>
  );
};

export default FinancingStep;
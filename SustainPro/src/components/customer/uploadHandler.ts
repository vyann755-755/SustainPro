// New upload handler code to replace existing handleConsolidatedUpload

const handleConsolidatedUpload = () => {
  if (!selectedBUId || !selectedProjectId) {
    toast.error('Please select both Project and Business Unit');
    return;
  }

  const selectedBU = mockBusinessUnits.find(bu => bu.id === selectedBUId);
  const selectedProject = mockProjects.find(p => p.id === selectedProjectId);
  
  // Create file input
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.xlsx,.xls';
  fileInput.onchange = async (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    try {
      // Read the Excel file
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = 'Activity Data Input';
      const worksheet = workbook.Sheets[sheetName];

      if (!worksheet) {
        toast.error('Invalid template format', {
          description: 'Sheet "Activity Data Input" not found in the uploaded file'
        });
        return;
      }

      // Convert sheet to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      const headers = jsonData[0] as string[];
      const dataRows = jsonData.slice(1) as any[][];

      // Find column indices
      const activityUIDColIndex = headers.findIndex(h => h === 'Activity UID');
      const activityNameColIndex = headers.findIndex(h => h === 'Activity Name');
      const scopeColIndex = headers.findIndex(h => h === 'Scope');
      const formulaColIndex = headers.findIndex(h => h === 'Formula');
      const paramNameColIndex = headers.findIndex(h => h === 'Parameter Name');
      const unitColIndex = headers.findIndex(h => h === 'Unit');
      const requiredColIndex = headers.findIndex(h => h === 'Required');
      const userInputColIndex = headers.findIndex(h => h === 'User Input Value');

      if (userInputColIndex === -1 || requiredColIndex === -1) {
        toast.error('Invalid template format', {
          description: 'Required columns not found in the template'
        });
        return;
      }

      // Validate all required fields are filled
      const missingRequired: string[] = [];
      let currentActivityName = '';
      let currentActivityUID = '';
      const uniqueActivities = new Set<string>();
      let totalParameters = 0;

      // Parse data by activity
      const activityDataMap = new Map<string, { 
        uid: string; 
        name: string; 
        scope: string;
        formula: string;
        parameters: Map<string, number>; 
      }>();

      dataRows.forEach((row) => {
        // Update current activity if present
        if (row[activityUIDColIndex] && row[activityUIDColIndex].trim() !== '') {
          currentActivityUID = row[activityUIDColIndex].trim();
          currentActivityName = row[activityNameColIndex] || '';
          uniqueActivities.add(currentActivityUID);
          
          if (!activityDataMap.has(currentActivityUID)) {
            activityDataMap.set(currentActivityUID, {
              uid: currentActivityUID,
              name: currentActivityName,
              scope: row[scopeColIndex] || '',
              formula: row[formulaColIndex] || '',
              parameters: new Map()
            });
          }
        }

        const isRequired = row[requiredColIndex] === 'Yes';
        const userInputValue = row[userInputColIndex];
        const paramName = row[paramNameColIndex];

        if (paramName) {
          totalParameters++;
          
          // Check if required field is empty
          if (isRequired && (userInputValue === undefined || userInputValue === null || userInputValue === '')) {
            missingRequired.push(`${currentActivityName} - ${paramName}`);
          } else if (userInputValue !== undefined && userInputValue !== null && userInputValue !== '') {
            // Store the parameter value
            const activityData = activityDataMap.get(currentActivityUID);
            if (activityData) {
              activityData.parameters.set(paramName, parseFloat(userInputValue) || 0);
            }
          }
        }
      });

      // Show validation dialog
      setValidationResults({
        passed: missingRequired.length === 0,
        missingFields: missingRequired,
        totalActivities: uniqueActivities.size,
        totalParameters: totalParameters,
        fileName: file.name,
        parsedData: activityDataMap
      });
      setIsValidationDialogOpen(true);

    } catch (error) {
      console.error('Error processing Excel file:', error);
      toast.error('Failed to process file', {
        description: 'Please ensure you are uploading a valid Excel file'
      });
    }
  };
  fileInput.click();
};

// Handler for confirming upload after validation
const handleConfirmUpload = () => {
  if (!validationResults || !validationResults.passed || !validationResults.parsedData) {
    return;
  }

  const selectedBU = mockBusinessUnits.find(bu => bu.id === selectedBUId);
  const selectedProject = mockProjects.find(p => p.id === selectedProjectId);
  
  if (!selectedBU || !selectedProject) return;

  try {
    // Calculate emissions for each activity using real formulas
    const calculatedData: CalculatedActivityData[] = [];
    
    validationResults.parsedData.forEach((activityData: any, activityUID: string) => {
      // Calculate using the helper function
      const calculation = calculateEmissions(activityUID, activityData.parameters);
      
      // Find the base activity to get GRI categories
      const baseActivity = allActivities.find(a => a.uid === activityUID);
      
      // Build the input parameters list
      const inputParameters: DataPoint[] = [];
      calculation.allParameters.forEach(param => {
        inputParameters.push({
          parameterId: `param-${activityUID}-${param.name}`,
          parameterName: param.name,
          value: String(param.value),
          unit: param.unit
        });
      });
      
      calculatedData.push({
        activityUID: activityUID,
        activityName: activityData.name,
        griCategory: baseActivity?.grpCategories?.[0]?.startsWith('305.1') 
          ? 'GRI 305-1 Direct GHG emissions (Scope 1)'
          : baseActivity?.grpCategories?.[0]?.startsWith('305.2')
          ? 'GRI 305-2 Indirect GHG emissions (Scope 2)'
          : 'GRI 305-3 Indirect GHG emissions (Scope 3)',
        griSubcategory: baseActivity?.grpCategories?.[0] || `305.${activityData.scope}.1`,
        scope: activityData.scope.replace('Scope ', '') as '1' | '2' | '3',
        calculatedValue: calculation.calculatedValue,
        unit: 'kgCO2e',
        formula: calculation.formula,
        inputParameters: inputParameters
      });
    });

    // Create new submission
    const newSubmission: BusinessUnitDataSubmission = {
      id: `sub-${Date.now()}`,
      businessUnitId: selectedBU.id,
      businessUnitName: selectedBU.name,
      businessUnitUID: selectedBU.uid,
      projectId: selectedProject.id,
      projectName: selectedProject.name,
      calculatedData,
      uploadedBy: 'John Smith', // In real system, get from auth
      uploadedAt: new Date().toISOString(),
      status: 'submitted',
      fileName: validationResults.fileName
    };

    // Add to uploaded submissions
    setUploadedSubmissions(prev => [...prev, newSubmission]);

    // Close dialog
    setIsValidationDialogOpen(false);

    // Show success message
    toast.success('Data uploaded successfully!', {
      description: `${calculatedData.length} activities calculated and submitted for review`
    });

    // Switch to view tab
    setActiveTab('view');
    setViewProjectId(selectedProjectId);
    setViewBUId(selectedBUId);

  } catch (error) {
    console.error('Error processing upload:', error);
    toast.error('Failed to process upload', {
      description: 'An error occurred while calculating emissions'
    });
  }
};

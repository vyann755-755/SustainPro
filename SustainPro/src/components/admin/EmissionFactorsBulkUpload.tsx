import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { 
  ArrowLeft,
  Download,
  Upload,
  FileSpreadsheet,
  CheckSquare,
  AlertCircle,
  Info,
  Database,
  CheckCircle,
  X,
  Sparkles,
  AlertTriangle,
  FileText,
  Layers
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useMasterDB } from '../../contexts/MasterDBContext';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';

// Interfaces
interface CoreDataRow {
  id: string;
  uid: string;
  parentEFUID: string;
  value: number;
  impactCategory: string;
  impactUnit: string;
  functionalUnit: string;
  referenceName: string;
  referenceURL?: string;
  country: string;
  region: string;
  referenceDate: Date | string;
  createdAt: string;
  createdBy: string;
}

interface EFDefinition {
  id: string;
  uid: string;
  name: string;
  ipccCategory: string;
  tags: string[];
  flexibleAttributes?: Record<string, any>;
  status: 'draft' | 'active' | 'archived';
  database: string;
  createdBy: string;
  createdAt: string;
  coreDataRows: CoreDataRow[];
  updatedAt?: string;
  updatedBy?: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface UploadedEFData {
  uid?: string;
  name: string;
  ipccCategory: string;
  tags: string[];
  status: string;
  flexibleAttributes?: Record<string, any>;
  errors: ValidationError[];
  rowNumber: number;
}

interface UploadedDataRowData {
  uid?: string;
  parentEFUID: string;
  parentEFName?: string;
  value: number;
  impactCategory: string;
  impactUnit: string;
  functionalUnit: string;
  referenceName: string;
  referenceURL?: string;
  country: string;
  region: string;
  referenceDate: string;
  errors: ValidationError[];
  rowNumber: number;
}

interface BulkUploadPageProps {
  onBack: () => void;
}

export function EmissionFactorsBulkUpload({ onBack }: BulkUploadPageProps) {
  const { masterEFDefinitions, setMasterEFDefinitions } = useMasterDB();
  const efDefinitions = masterEFDefinitions;
  const setEFDefinitions = setMasterEFDefinitions;
  
  // State for EF selection for data row template
  const [selectedEFsForDownload, setSelectedEFsForDownload] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  // Validation dialog states
  const [showEFValidationDialog, setShowEFValidationDialog] = useState(false);
  const [showDataRowValidationDialog, setShowDataRowValidationDialog] = useState(false);
  const [uploadedEFs, setUploadedEFs] = useState<UploadedEFData[]>([]);
  const [uploadedDataRows, setUploadedDataRows] = useState<UploadedDataRowData[]>([]);

  // Filter EFs based on search
  const filteredEFs = efDefinitions.filter(ef => 
    ef.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ef.uid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // UID Generation Functions
  const generateEFUID = (ipccCategory: string, sequence: number): string => {
    const categoryMap: Record<string, string> = {
      'Energy': 'ENE',
      'Industrial Processes and Product Use (IPPU)': 'IND',
      'Agriculture, Forestry and Other Land Use (AFOLU)': 'AGR',
      'Waste': 'WAS',
      'Other': 'OTH'
    };
    
    const categoryCode = categoryMap[ipccCategory] || 'OTH';
    const year = new Date().getFullYear();
    const seqStr = String(sequence).padStart(4, '0');
    
    return `EF-${categoryCode}-${year}-${seqStr}`;
  };

  const generateDataRowUID = (parentEFUID: string, sequence: number): string => {
    const seqStr = String(sequence).padStart(3, '0');
    return `DR-${parentEFUID}-${seqStr}`;
  };

  // Toggle EF Selection
  const toggleEFSelection = (efId: string) => {
    const newSelected = new Set(selectedEFsForDownload);
    if (newSelected.has(efId)) {
      newSelected.delete(efId);
    } else {
      newSelected.add(efId);
    }
    setSelectedEFsForDownload(newSelected);
  };

  const selectAllEFs = () => {
    setSelectedEFsForDownload(new Set(filteredEFs.map(ef => ef.id)));
  };

  const deselectAllEFs = () => {
    setSelectedEFsForDownload(new Set());
  };

  // ============ EF DEFINITION TEMPLATE DOWNLOAD ============
  const downloadEFDefinitionTemplate = () => {
    const wb = XLSX.utils.book_new();
    
    // EF Definitions Template
    const efHeaders = [
      'UID (leave blank for new)',
      'Name*',
      'IPCC Category*',
      'Tags (comma-separated)',
      'Status',
      'Flexible Attributes (JSON)'
    ];
    
    const exampleRow = [
      '',
      'Example EF - Electricity Grid Mix',
      'Energy',
      'electricity, grid, scope-2',
      'draft',
      '{"Data Quality": "High", "Verification Status": "Verified"}'
    ];
    
    const efWs = XLSX.utils.aoa_to_sheet([efHeaders, exampleRow]);
    XLSX.utils.book_append_sheet(wb, efWs, 'EF Definitions');
    
    // Instructions Sheet
    const instructions = [
      ['EF DEFINITION BULK UPLOAD - INSTRUCTIONS'],
      [''],
      ['Required Fields (marked with *):'],
      ['- Name: The emission factor name'],
      ['- IPCC Category: Must be one of: Energy, Industrial Processes and Product Use (IPPU), Agriculture, Forestry and Other Land Use (AFOLU), Waste, Other'],
      [''],
      ['Optional Fields:'],
      ['- UID: Leave blank for new EF (auto-generated). For updates, include existing UID'],
      ['- Tags: Comma-separated tags for categorization'],
      ['- Status: draft, active, or archived (defaults to draft)'],
      ['- Flexible Attributes: JSON format for custom attributes'],
      [''],
      ['Upload Process:'],
      ['1. Fill in the template with your EF definitions'],
      ['2. Save the Excel file'],
      ['3. Use "Upload EF Definitions" button to upload'],
      ['4. Review validation results'],
      ['5. Confirm to add to database'],
      [''],
      ['Notes:'],
      ['- Rows with existing UIDs will UPDATE records'],
      ['- Rows without UIDs will CREATE new records with auto-generated UIDs']
    ];
    const instructionsWs = XLSX.utils.aoa_to_sheet(instructions);
    XLSX.utils.book_append_sheet(wb, instructionsWs, 'Instructions');
    
    XLSX.writeFile(wb, `EF_Definitions_Template_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    toast.success('EF Definition template downloaded');
  };

  // ============ DATA ROWS TEMPLATE DOWNLOAD ============
  const downloadDataRowsTemplate = () => {
    if (selectedEFsForDownload.size === 0) {
      toast.error('Please select at least one EF Definition to download the data rows template');
      return;
    }
    
    const selectedEFs = efDefinitions.filter(ef => selectedEFsForDownload.has(ef.id));
    const wb = XLSX.utils.book_new();
    
    // Data Rows with EF context - 1 example row per EF
    const dataRowHeaders = [
      'EF UID*',
      'EF Name (for reference - read only)',
      'Value*',
      'Impact Category*',
      'Impact Unit*',
      'Functional Unit*',
      'Reference Name*',
      'Reference URL',
      'Country*',
      'Region*',
      'Reference Date (YYYY-MM-DD)*'
    ];
    
    const dataRows: any[][] = [];
    
    // Add 1 example row for each selected EF definition
    selectedEFs.forEach(ef => {
      dataRows.push([
        ef.uid,                                      // EF UID - pre-filled
        ef.name,                                     // EF Name - pre-filled for reference
        'Example: 0.4156',                           // Example Value
        'Example: Climate Change - total',           // Example Impact Category
        'Example: kgCO2e',                           // Example Impact Unit
        'Example: kWh',                              // Example Functional Unit
        'Example: EPA eGRID 2023',                   // Example Reference Name
        'Example: https://www.epa.gov/egrid',        // Example Reference URL
        'Example: United States',                    // Example Country
        'Example: North America',                    // Example Region
        'Example: 2024-01-15'                        // Example Reference Date
      ]);
    });
    
    const dataRowWs = XLSX.utils.aoa_to_sheet([dataRowHeaders, ...dataRows]);
    XLSX.utils.book_append_sheet(wb, dataRowWs, 'Data Rows');
    
    // Instructions Sheet
    const instructions = [
      ['DATA ROWS BULK UPLOAD - INSTRUCTIONS'],
      [''],
      ['This template contains example data rows for adding new data to selected EF Definitions.'],
      ['Each EF Definition has 1 example row with sample data to guide you.'],
      ['You can modify the example data or add more rows by copying the format.'],
      [''],
      ['Template Columns:'],
      ['1. EF UID* - Pre-filled with existing EF Definition UID (Required)'],
      ['2. EF Name - For reference only (Read-only, will be ignored during upload)'],
      ['3. Value* - Numeric emission factor value (Required)'],
      ['4. Impact Category* - e.g., Climate Change - total, Energy, Water, Waste (Required)'],
      ['5. Impact Unit* - Auto-populated based on Impact Category, e.g., kgCO2e, kJ, m3 (Required)'],
      ['6. Functional Unit* - e.g., kg, kWh, L, t, km, m3, MJ, unit (Required)'],
      ['7. Reference Name* - Source/database name, e.g., EPA, IPCC (Required)'],
      ['8. Reference URL - Optional web link to the data source'],
      ['9. Country* - Country name (Required)'],
      ['10. Region* - Geographic region (Required)'],
      ['11. Reference Date* - Date in YYYY-MM-DD format (Required)'],
      [''],
      ['How to Use This Template:'],
      [''],
      ['STEP 1: Understand the Example Data'],
      ['- Each row contains example values prefixed with "Example: " to show the expected format'],
      ['- The EF UID and EF Name are pre-filled for each selected EF Definition'],
      ['- All other fields contain example data that you should replace with your actual data'],
      ['- The "Example: " prefix will be automatically removed during upload'],
      [''],
      ['STEP 2: Replace Example Data with Your Actual Data'],
      ['- Keep the EF UID as is (it links the data row to the EF Definition)'],
      ['- Replace "Example: 0.4156" with your actual numeric value (e.g., 0.4156)'],
      ['- Replace "Example: Climate Change - total" with your actual impact category'],
      ['- Impact Unit will be auto-populated based on the Impact Category you choose'],
      ['- Replace "Example: kWh" with your actual functional unit (e.g., kWh, kg, L, t)'],
      ['- Replace all other example fields with your actual data'],
      ['- You can keep or remove the "Example: " prefix - it will be stripped automatically'],
      ['- The EF Name column is for reference only and will be ignored'],
      [''],
      ['STEP 3: Add More Rows (Optional)'],
      ['- Copy and paste a row to add multiple data rows for the same EF'],
      ['- Make sure to keep the EF UID the same for rows under the same EF'],
      ['- You can mix data rows for different EFs in the same upload'],
      [''],
      ['STEP 4: Save and Upload'],
      ['- Delete any example rows you don\'t need'],
      ['- Save the Excel file'],
      ['- Use the "Upload Data Rows" button on the web page'],
      ['- Review validation results and fix any errors'],
      ['- Click "Confirm Upload" to add the data to the database'],
      [''],
      ['Important Notes:'],
      ['- All new data rows will be assigned auto-generated unique UIDs'],
      ['- The EF UID must match exactly (case-sensitive)'],
      ['- Data Row UID is NOT required - it will be auto-generated'],
      ['- Make sure dates are in YYYY-MM-DD format (e.g., 2024-01-15)'],
      ['- Reference URL is optional, all other fields are required'],
      [''],
      ['Common Impact Categories and their Units:'],
      ['- Climate Change - total → kgCO2e (Carbon dioxide equivalent)'],
      ['- Climate Change - CO2 → kgCO2 (Carbon dioxide)'],
      ['- Climate Change - CH4 → kgCH4 (Methane)'],
      ['- Climate Change - N2O → kgN2O (Nitrous oxide)'],
      ['- Energy → kJ (Kilojoules)'],
      ['- Water → m3 (Cubic meters)'],
      ['- Waste → kg (Kilograms)'],
      [''],
      ['Common Functional Units:'],
      ['- kg (kilogram), kWh (kilowatt-hour), L (liter), t (tonne)'],
      ['- km (kilometer), m3 (cubic meter), MJ (megajoule), unit (per unit)']
    ];
    const instructionsWs = XLSX.utils.aoa_to_sheet(instructions);
    XLSX.utils.book_append_sheet(wb, instructionsWs, 'Instructions');
    
    XLSX.writeFile(wb, `Data_Rows_Template_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    toast.success(`Downloaded template with ${selectedEFs.length} EF Definition(s) and example data rows ready for editing`);
  };

  // ============ EF DEFINITION UPLOAD & VALIDATION ============
  const handleEFDefinitionUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      
      const efSheet = workbook.Sheets['EF Definitions'];
      if (!efSheet) {
        toast.error('Missing "EF Definitions" sheet in the uploaded file');
        event.target.value = '';
        return;
      }
      
      const efData = XLSX.utils.sheet_to_json(efSheet, { header: 1 }) as any[][];
      const efRows = efData.slice(1).filter(row => row.length > 0 && row.some(cell => cell));
      
      // Validate and parse EF definitions
      const validatedEFs = validateEFDefinitions(efRows);
      setUploadedEFs(validatedEFs);
      setShowEFValidationDialog(true);
      
      event.target.value = '';
      
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Error processing uploaded file. Please check the file format and try again.');
      event.target.value = '';
    }
  };

  const validateEFDefinitions = (rows: any[][]): UploadedEFData[] => {
    const validated: UploadedEFData[] = [];
    const validCategories = ['Energy', 'Industrial Processes and Product Use (IPPU)', 'Agriculture, Forestry and Other Land Use (AFOLU)', 'Waste', 'Other'];
    const validStatuses = ['draft', 'active', 'archived'];
    
    rows.forEach((row, index) => {
      const [uid, name, ipccCategory, tagsStr, status, flexAttrsStr] = row;
      const errors: ValidationError[] = [];
      const rowNumber = index + 2; // +2 because Excel is 1-indexed and we skip header
      
      // Required field validation
      if (!name || String(name).trim() === '') {
        errors.push({ row: rowNumber, field: 'Name', message: 'Name is required' });
      }
      if (!ipccCategory || String(ipccCategory).trim() === '') {
        errors.push({ row: rowNumber, field: 'IPCC Category', message: 'IPCC Category is required' });
      } else if (!validCategories.includes(String(ipccCategory))) {
        errors.push({ row: rowNumber, field: 'IPCC Category', message: `Invalid category. Must be one of: ${validCategories.join(', ')}` });
      }
      
      // Optional field validation
      if (status && !validStatuses.includes(String(status).toLowerCase())) {
        errors.push({ row: rowNumber, field: 'Status', message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      }
      
      // Parse tags
      const tags = tagsStr ? String(tagsStr).split(',').map(t => t.trim()).filter(Boolean) : [];
      
      // Parse flexible attributes
      let flexibleAttributes: Record<string, any> | undefined;
      if (flexAttrsStr) {
        try {
          flexibleAttributes = JSON.parse(String(flexAttrsStr));
        } catch (e) {
          errors.push({ row: rowNumber, field: 'Flexible Attributes', message: 'Invalid JSON format' });
        }
      }
      
      validated.push({
        uid: uid ? String(uid).trim() : undefined,
        name: name ? String(name).trim() : '',
        ipccCategory: ipccCategory ? String(ipccCategory).trim() : '',
        tags,
        status: status ? String(status).toLowerCase() : 'draft',
        flexibleAttributes,
        errors,
        rowNumber
      });
    });
    
    return validated;
  };

  const confirmEFDefinitionUpload = () => {
    const validEFs = uploadedEFs.filter(ef => ef.errors.length === 0);
    
    if (validEFs.length === 0) {
      toast.error('No valid EF definitions to upload. Please fix the errors and try again.');
      return;
    }
    
    const newEFDefinitions = [...efDefinitions];
    let inserted = 0;
    let updated = 0;
    
    validEFs.forEach(efData => {
      const existingEF = efData.uid ? newEFDefinitions.find(ef => ef.uid === efData.uid) : null;
      
      if (existingEF) {
        // Update existing EF
        const index = newEFDefinitions.findIndex(ef => ef.id === existingEF.id);
        newEFDefinitions[index] = {
          ...existingEF,
          name: efData.name,
          ipccCategory: efData.ipccCategory,
          tags: efData.tags,
          flexibleAttributes: efData.flexibleAttributes,
          status: efData.status as 'draft' | 'active' | 'archived',
          updatedAt: new Date().toISOString(),
          updatedBy: 'admin'
        };
        updated++;
      } else {
        // Create new EF
        const sequence = newEFDefinitions.length + 1;
        const newUID = generateEFUID(efData.ipccCategory, sequence);
        
        const newEF: EFDefinition = {
          id: `ef_${Date.now()}_${inserted}`,
          uid: newUID,
          name: efData.name,
          ipccCategory: efData.ipccCategory,
          tags: efData.tags,
          flexibleAttributes: efData.flexibleAttributes,
          status: efData.status as 'draft' | 'active' | 'archived',
          database: 'master',
          createdBy: 'admin',
          createdAt: new Date().toISOString(),
          coreDataRows: []
        };
        
        newEFDefinitions.push(newEF);
        inserted++;
      }
    });
    
    setEFDefinitions(newEFDefinitions);
    setShowEFValidationDialog(false);
    setUploadedEFs([]);
    
    toast.success(`EF Definitions uploaded: ${inserted} created, ${updated} updated`, {
      duration: 5000
    });
  };

  // ============ DATA ROWS UPLOAD & VALIDATION ============
  const handleDataRowsUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      
      const dataRowSheet = workbook.Sheets['Data Rows'];
      if (!dataRowSheet) {
        toast.error('Missing "Data Rows" sheet in the uploaded file');
        event.target.value = '';
        return;
      }
      
      const dataRowData = XLSX.utils.sheet_to_json(dataRowSheet, { header: 1 }) as any[][];
      const dataRowRows = dataRowData.slice(1).filter(row => row.length > 0 && row.some(cell => cell));
      
      // Validate and parse data rows
      const validatedDataRows = validateDataRows(dataRowRows);
      setUploadedDataRows(validatedDataRows);
      setShowDataRowValidationDialog(true);
      
      event.target.value = '';
      
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Error processing uploaded file. Please check the file format and try again.');
      event.target.value = '';
    }
  };

  const validateDataRows = (rows: any[][]): UploadedDataRowData[] => {
    const validated: UploadedDataRowData[] = [];
    
    // Helper function to strip "Example: " prefix
    const stripExamplePrefix = (value: any): string => {
      if (!value) return '';
      const str = String(value).trim();
      return str.startsWith('Example: ') ? str.substring(9).trim() : str;
    };
    
    rows.forEach((row, index) => {
      const [parentEFUID, parentEFName, rawValue, rawImpactCategory, rawImpactUnit, rawFunctionalUnit, rawReferenceName, rawReferenceURL, rawCountry, rawRegion, rawReferenceDate] = row;
      
      // Strip "Example: " prefix from all fields except EF UID and EF Name
      const value = stripExamplePrefix(rawValue);
      const impactCategory = stripExamplePrefix(rawImpactCategory);
      const impactUnit = stripExamplePrefix(rawImpactUnit);
      const functionalUnit = stripExamplePrefix(rawFunctionalUnit);
      const referenceName = stripExamplePrefix(rawReferenceName);
      const referenceURL = stripExamplePrefix(rawReferenceURL);
      const country = stripExamplePrefix(rawCountry);
      const region = stripExamplePrefix(rawRegion);
      const referenceDate = stripExamplePrefix(rawReferenceDate);
      
      const errors: ValidationError[] = [];
      const rowNumber = index + 2;
      
      // Required field validation
      if (!parentEFUID || String(parentEFUID).trim() === '') {
        errors.push({ row: rowNumber, field: 'EF UID', message: 'EF UID is required' });
      } else {
        // Check if parent EF exists
        const parentExists = efDefinitions.some(ef => ef.uid === String(parentEFUID).trim());
        if (!parentExists) {
          errors.push({ row: rowNumber, field: 'EF UID', message: `EF with UID "${parentEFUID}" not found in database` });
        }
      }
      
      if (!value || isNaN(Number(value))) {
        errors.push({ row: rowNumber, field: 'Value', message: 'Valid numeric value is required' });
      }
      
      if (!impactCategory || String(impactCategory).trim() === '') {
        errors.push({ row: rowNumber, field: 'Impact Category', message: 'Impact Category is required' });
      }
      
      if (!impactUnit || String(impactUnit).trim() === '') {
        errors.push({ row: rowNumber, field: 'Impact Unit', message: 'Impact Unit is required' });
      }
      
      if (!functionalUnit || String(functionalUnit).trim() === '') {
        errors.push({ row: rowNumber, field: 'Functional Unit', message: 'Functional Unit is required' });
      }
      
      if (!referenceName || String(referenceName).trim() === '') {
        errors.push({ row: rowNumber, field: 'Reference Name', message: 'Reference Name is required' });
      }
      
      if (!country || String(country).trim() === '') {
        errors.push({ row: rowNumber, field: 'Country', message: 'Country is required' });
      }
      
      if (!region || String(region).trim() === '') {
        errors.push({ row: rowNumber, field: 'Region', message: 'Region is required' });
      }
      
      if (!referenceDate || String(referenceDate).trim() === '') {
        errors.push({ row: rowNumber, field: 'Reference Date', message: 'Reference Date is required' });
      } else {
        // Validate date format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(String(referenceDate))) {
          errors.push({ row: rowNumber, field: 'Reference Date', message: 'Date must be in YYYY-MM-DD format' });
        }
      }
      
      validated.push({
        uid: undefined, // Always undefined for new data rows
        parentEFUID: parentEFUID ? String(parentEFUID).trim() : '',
        parentEFName: parentEFName ? String(parentEFName).trim() : '',
        value: Number(value) || 0,
        impactCategory: impactCategory,
        impactUnit: impactUnit,
        functionalUnit: functionalUnit,
        referenceName: referenceName,
        referenceURL: referenceURL,
        country: country,
        region: region,
        referenceDate: referenceDate,
        errors,
        rowNumber
      });
    });
    
    return validated;
  };

  const confirmDataRowsUpload = () => {
    const validDataRows = uploadedDataRows.filter(dr => dr.errors.length === 0);
    
    if (validDataRows.length === 0) {
      toast.error('No valid data rows to upload. Please fix the errors and try again.');
      return;
    }
    
    let dataRowsAdded = 0;
    let dataRowsUpdated = 0;
    
    // Create new EF definitions array with updated data rows
    const newEFDefinitions = efDefinitions.map(ef => {
      // Find all data rows that belong to this EF
      const dataRowsForThisEF = validDataRows.filter(dr => dr.parentEFUID === ef.uid);
      
      if (dataRowsForThisEF.length === 0) {
        // No data rows for this EF, return as is
        return ef;
      }
      
      // Create new coreDataRows array
      const newCoreDataRows = [...ef.coreDataRows];
      
      dataRowsForThisEF.forEach(drData => {
        const existingDataRow = drData.uid ? newCoreDataRows.find(dr => dr.uid === drData.uid) : null;
        
        if (existingDataRow) {
          // Update existing data row
          const index = newCoreDataRows.findIndex(dr => dr.id === existingDataRow.id);
          newCoreDataRows[index] = {
            ...existingDataRow,
            value: drData.value,
            impactCategory: drData.impactCategory,
            impactUnit: drData.impactUnit,
            functionalUnit: drData.functionalUnit,
            referenceName: drData.referenceName,
            referenceURL: drData.referenceURL,
            country: drData.country,
            region: drData.region,
            referenceDate: drData.referenceDate
          };
          dataRowsUpdated++;
        } else {
          // Create new data row
          const sequence = newCoreDataRows.length + 1;
          const newDataRowUID = generateDataRowUID(drData.parentEFUID, sequence);
          
          const newDataRow: CoreDataRow = {
            id: `dr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            uid: newDataRowUID,
            parentEFUID: drData.parentEFUID,
            value: drData.value,
            impactCategory: drData.impactCategory,
            impactUnit: drData.impactUnit,
            functionalUnit: drData.functionalUnit,
            referenceName: drData.referenceName,
            referenceURL: drData.referenceURL,
            country: drData.country,
            region: drData.region,
            referenceDate: drData.referenceDate,
            createdAt: new Date().toISOString(),
            createdBy: 'admin'
          };
          
          newCoreDataRows.push(newDataRow);
          dataRowsAdded++;
        }
      });
      
      // Return new EF object with updated coreDataRows
      return {
        ...ef,
        coreDataRows: newCoreDataRows
      };
    });
    
    setEFDefinitions(newEFDefinitions);
    setShowDataRowValidationDialog(false);
    setUploadedDataRows([]);
    
    toast.success(`Data Rows uploaded: ${dataRowsAdded} created, ${dataRowsUpdated} updated`, {
      duration: 5000
    });
  };

  // Calculate validation stats
  const efStats = {
    total: uploadedEFs.length,
    valid: uploadedEFs.filter(ef => ef.errors.length === 0).length,
    invalid: uploadedEFs.filter(ef => ef.errors.length > 0).length
  };

  const drStats = {
    total: uploadedDataRows.length,
    valid: uploadedDataRows.filter(dr => dr.errors.length === 0).length,
    invalid: uploadedDataRows.filter(dr => dr.errors.length > 0).length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Emission Factors
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-lg border-2 border-emerald-200 overflow-hidden">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-emerald-500 via-green-600 to-teal-600 p-8 text-white">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-white/30">
                <FileSpreadsheet className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl mb-2">Bulk Upload</h1>
                <p className="text-emerald-50 text-lg">
                  Separate Excel Templates for EF Definitions & Data Rows
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-emerald-100">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm">
                Download templates, fill in Excel, validate, and upload to create or update multiple records
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            {/* SECTION 1: EF DEFINITIONS UPLOAD */}
            <Card className="border-2 border-emerald-300 bg-gradient-to-r from-emerald-50 to-green-50 shadow-md">
              <CardHeader className="border-b border-emerald-200 bg-white/50">
                <CardTitle className="text-2xl flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Database className="h-6 w-6 text-emerald-600" />
                  </div>
                  Section 1: EF Definitions Upload
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="bg-white rounded-xl p-6 border-2 border-emerald-100 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Download Template */}
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Download className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900 mb-2">Step 1: Download Template</h3>
                          <p className="text-sm text-gray-600 mb-4">
                            Download the EF Definition template with required fields and example data
                          </p>
                          <Button 
                            onClick={downloadEFDefinitionTemplate}
                            className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download EF Definition Template
                          </Button>
                        </div>
                      </div>
                      
                      <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                        <h4 className="font-semibold text-emerald-900 mb-2 flex items-center gap-2">
                          <Info className="h-4 w-4" />
                          Template Includes:
                        </h4>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• UID (leave blank for new EFs)</li>
                          <li>• Name, IPCC Category*</li>
                          <li>• Tags, Status, Flexible Attributes</li>
                          <li>• Instructions sheet with examples</li>
                        </ul>
                      </div>
                    </div>

                    {/* Upload EF Definitions */}
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Upload className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900 mb-2">Step 2: Upload File</h3>
                          <p className="text-sm text-gray-600 mb-4">
                            Upload your filled EF Definition Excel file for validation
                          </p>
                          <Label htmlFor="ef-upload" className="cursor-pointer">
                            <div className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-md flex items-center justify-center gap-2 transition-all">
                              <Upload className="h-4 w-4" />
                              Upload EF Definitions
                            </div>
                            <Input
                              id="ef-upload"
                              type="file"
                              accept=".xlsx,.xls"
                              onChange={handleEFDefinitionUpload}
                              className="hidden"
                            />
                          </Label>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          Validation Process:
                        </h4>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• File will be validated automatically</li>
                          <li>• Review validation results in dialog</li>
                          <li>• Fix errors if needed and re-upload</li>
                          <li>• Confirm to add valid records</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SECTION 2: DATA ROWS UPLOAD */}
            <Card className="border-2 border-teal-300 bg-gradient-to-r from-teal-50 to-cyan-50 shadow-md">
              <CardHeader className="border-b border-teal-200 bg-white/50">
                <CardTitle className="text-2xl flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                    <Layers className="h-6 w-6 text-teal-600" />
                  </div>
                  Section 2: Data Rows Upload
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* Select EFs for Template */}
                <div className="bg-white rounded-xl p-6 border-2 border-teal-100 shadow-sm">
                  <h3 className="font-semibold text-lg text-gray-900 mb-4">Step 1: Select EF Definitions for Template</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Select existing EF Definitions to download a template with example data. The template will include EF UID and Name pre-filled, with example data rows that you can modify or replace.
                  </p>
                  
                  {/* Search Box */}
                  <div className="mb-4">
                    <Label className="mb-2 block">Search EF Definitions:</Label>
                    <Input
                      placeholder="Search by name or UID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="border-teal-200 focus:border-teal-500"
                    />
                  </div>

                  {/* Selection Controls */}
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-base font-semibold">Select EF Definitions:</Label>
                    <div className="flex gap-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={selectAllEFs}
                        className="border-teal-300 text-teal-700 hover:bg-teal-50"
                      >
                        <CheckSquare className="h-4 w-4 mr-2" />
                        Select All ({filteredEFs.length})
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={deselectAllEFs}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Deselect All
                      </Button>
                    </div>
                  </div>

                  {/* EF Selection Grid */}
                  <div className="max-h-96 overflow-y-auto border-2 border-teal-200 rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 p-4 mb-4">
                    {filteredEFs.length === 0 ? (
                      <div className="text-center py-12">
                        <Database className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-500">No EF Definitions found</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {filteredEFs.map(ef => (
                          <div 
                            key={ef.id}
                            className={`flex items-start gap-3 p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                              selectedEFsForDownload.has(ef.id) 
                                ? 'bg-teal-100 border-2 border-teal-400 shadow-md' 
                                : 'bg-white border-2 border-gray-200 hover:bg-gray-50 hover:border-teal-200'
                            }`}
                            onClick={() => toggleEFSelection(ef.id)}
                          >
                            <input
                              type="checkbox"
                              checked={selectedEFsForDownload.has(ef.id)}
                              onChange={() => toggleEFSelection(ef.id)}
                              className="h-5 w-5 text-teal-600 rounded mt-1"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-gray-900 truncate">{ef.name}</span>
                              </div>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="text-xs">{ef.uid}</Badge>
                                <Badge className="text-xs bg-teal-100 text-teal-800">{ef.status}</Badge>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <span className="truncate">{ef.ipccCategory}</span>
                                <span>•</span>
                                <span className="font-medium">{ef.coreDataRows.length} data row(s)</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {selectedEFsForDownload.size > 0 && (
                    <div className="bg-teal-100 border-2 border-teal-300 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-teal-900">
                          <CheckSquare className="h-5 w-5" />
                          <span className="font-semibold">
                            {selectedEFsForDownload.size} EF(s) selected
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={downloadDataRowsTemplate}
                    disabled={selectedEFsForDownload.size === 0}
                    size="lg"
                    className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Download Data Rows Template
                  </Button>
                </div>

                {/* Upload Data Rows */}
                <div className="bg-white rounded-xl p-6 border-2 border-teal-100 shadow-sm">
                  <h3 className="font-semibold text-lg text-gray-900 mb-4">Step 2: Upload Data Rows</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload your filled Data Rows Excel file. The system will validate all required fields and EF UIDs.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
                      <h4 className="font-semibold text-teal-900 mb-2 flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        Template Features:
                      </h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Pre-filled with EF UID and Name</li>
                        <li>• 1 example data row per EF Definition</li>
                        <li>• Example values to guide data entry</li>
                        <li>• Copy rows to add multiple data entries</li>
                      </ul>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Validation Checks:
                      </h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• All required fields filled</li>
                        <li>• EF UID exists in database</li>
                        <li>• Valid numeric values</li>
                        <li>• Correct date format (YYYY-MM-DD)</li>
                      </ul>
                    </div>
                  </div>
                  
                  <Label htmlFor="datarow-upload" className="cursor-pointer">
                    <div className="w-full px-6 py-4 bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white rounded-md flex items-center justify-center gap-2 transition-all">
                      <Upload className="h-5 w-5" />
                      Upload Data Rows
                    </div>
                    <Input
                      id="datarow-upload"
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleDataRowsUpload}
                      className="hidden"
                    />
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* EF VALIDATION DIALOG */}
      <Dialog open={showEFValidationDialog} onOpenChange={setShowEFValidationDialog}>
        <DialogContent className="!max-w-[98vw] w-[98vw] max-h-[95vh] h-[95vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200 flex-shrink-0">
            <DialogTitle className="text-2xl flex items-center gap-3">
              <FileText className="h-6 w-6 text-emerald-600" />
              EF Definitions - Validation Results
            </DialogTitle>
            <DialogDescription className="text-base mt-2">
              Review the validation results below. Fix errors in your Excel file and re-upload if needed.
            </DialogDescription>
          </DialogHeader>
          
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-6">
              {/* Validation Summary */}
              <div className="grid grid-cols-3 gap-6">
                <Card className="border-2 border-blue-200 bg-blue-50">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-blue-900">{efStats.total}</p>
                      <p className="text-base text-blue-700 mt-2">Total Rows</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-2 border-green-200 bg-green-50">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-green-900">{efStats.valid}</p>
                      <p className="text-base text-green-700 mt-2">Valid Rows</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-2 border-red-200 bg-red-50">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-red-900">{efStats.invalid}</p>
                      <p className="text-base text-red-700 mt-2">Invalid Rows</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Validation Details Table */}
              <div className="border-2 border-gray-300 rounded-lg overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-100">
                        <TableHead className="w-20 text-base">Row</TableHead>
                        <TableHead className="w-20 text-base">Status</TableHead>
                        <TableHead className="min-w-[200px] text-base">Name</TableHead>
                        <TableHead className="min-w-[180px] text-base">IPCC Category</TableHead>
                        <TableHead className="min-w-[400px] text-base">Validation Errors / Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {uploadedEFs.map((ef, index) => (
                        <TableRow 
                          key={index}
                          className={ef.errors.length === 0 ? 'bg-green-50 hover:bg-green-100' : 'bg-red-50 hover:bg-red-100'}
                        >
                          <TableCell className="font-bold text-base">{ef.rowNumber}</TableCell>
                          <TableCell>
                            {ef.errors.length === 0 ? (
                              <CheckCircle className="h-6 w-6 text-green-600" />
                            ) : (
                              <AlertTriangle className="h-6 w-6 text-red-600" />
                            )}
                          </TableCell>
                          <TableCell className="font-medium text-base">{ef.name || <span className="text-gray-400 italic">Empty</span>}</TableCell>
                          <TableCell className="text-base">{ef.ipccCategory || <span className="text-gray-400 italic">Empty</span>}</TableCell>
                          <TableCell>
                            {ef.errors.length > 0 ? (
                              <div className="space-y-2">
                                {ef.errors.map((error, errIdx) => (
                                  <div key={errIdx} className="bg-red-100 border border-red-300 rounded-md p-3 text-base text-red-800 flex items-start gap-2">
                                    <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <span className="font-bold">{error.field}:</span>{' '}
                                      <span>{error.message}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="bg-green-100 border border-green-300 rounded-md p-3 text-base text-green-800 flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                                <span className="font-bold">All fields valid - Ready to upload</span>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </div>

          {/* Fixed Footer */}
          <DialogFooter className="px-6 py-4 border-t border-gray-200 flex-shrink-0 bg-gray-50">
            <div className="flex items-center justify-between w-full">
              <div className="text-sm text-gray-600">
                {efStats.invalid > 0 && (
                  <div className="flex items-center gap-2 text-red-700 bg-red-100 px-4 py-2 rounded-lg border border-red-300">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="font-medium">
                      {efStats.invalid} row(s) have errors - please fix and re-upload
                    </span>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setShowEFValidationDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="lg"
                  onClick={confirmEFDefinitionUpload}
                  disabled={efStats.valid === 0}
                  className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 disabled:opacity-50"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Confirm Upload ({efStats.valid} Valid Row{efStats.valid !== 1 ? 's' : ''})
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DATA ROWS VALIDATION DIALOG */}
      <Dialog open={showDataRowValidationDialog} onOpenChange={setShowDataRowValidationDialog}>
        <DialogContent className="!max-w-[98vw] w-[98vw] max-h-[95vh] h-[95vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200 flex-shrink-0">
            <DialogTitle className="text-2xl flex items-center gap-3">
              <Layers className="h-6 w-6 text-teal-600" />
              Data Rows - Validation Results
            </DialogTitle>
            <DialogDescription className="text-base mt-2">
              Review the validation results below. Fix errors in your Excel file and re-upload if needed.
            </DialogDescription>
          </DialogHeader>
          
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-6">
              {/* Validation Summary */}
              <div className="grid grid-cols-3 gap-6">
                <Card className="border-2 border-blue-200 bg-blue-50">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-blue-900">{drStats.total}</p>
                      <p className="text-base text-blue-700 mt-2">Total Rows</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-2 border-green-200 bg-green-50">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-green-900">{drStats.valid}</p>
                      <p className="text-base text-green-700 mt-2">Valid Rows</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-2 border-red-200 bg-red-50">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-red-900">{drStats.invalid}</p>
                      <p className="text-base text-red-700 mt-2">Invalid Rows</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Validation Details Table */}
              <div className="border-2 border-gray-300 rounded-lg overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-100">
                        <TableHead className="w-20 text-base">Row</TableHead>
                        <TableHead className="w-20 text-base">Status</TableHead>
                        <TableHead className="min-w-[180px] text-base">EF UID</TableHead>
                        <TableHead className="min-w-[200px] text-base">EF Name</TableHead>
                        <TableHead className="min-w-[120px] text-base">Value</TableHead>
                        <TableHead className="min-w-[150px] text-base">Impact Category</TableHead>
                        <TableHead className="min-w-[120px] text-base">Functional Unit</TableHead>
                        <TableHead className="min-w-[120px] text-base">Country</TableHead>
                        <TableHead className="min-w-[450px] text-base">Validation Errors / Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {uploadedDataRows.map((dr, index) => (
                        <TableRow 
                          key={index}
                          className={dr.errors.length === 0 ? 'bg-green-50 hover:bg-green-100' : 'bg-red-50 hover:bg-red-100'}
                        >
                          <TableCell className="font-bold text-base">{dr.rowNumber}</TableCell>
                          <TableCell>
                            {dr.errors.length === 0 ? (
                              <CheckCircle className="h-6 w-6 text-green-600" />
                            ) : (
                              <AlertTriangle className="h-6 w-6 text-red-600" />
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-sm">{dr.parentEFUID || <span className="text-gray-400 italic">Empty</span>}</TableCell>
                          <TableCell className="text-base">{dr.parentEFName || <span className="text-gray-400 italic">-</span>}</TableCell>
                          <TableCell className="text-base">{dr.value || <span className="text-gray-400 italic">Empty</span>}</TableCell>
                          <TableCell className="text-base">{dr.impactCategory || <span className="text-gray-400 italic">Empty</span>}</TableCell>
                          <TableCell className="text-base">{dr.functionalUnit || <span className="text-gray-400 italic">Empty</span>}</TableCell>
                          <TableCell className="text-base">{dr.country || <span className="text-gray-400 italic">Empty</span>}</TableCell>
                          <TableCell>
                            {dr.errors.length > 0 ? (
                              <div className="space-y-2">
                                {dr.errors.map((error, errIdx) => (
                                  <div key={errIdx} className="bg-red-100 border border-red-300 rounded-md p-3 text-base text-red-800 flex items-start gap-2">
                                    <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <span className="font-bold">{error.field}:</span>{' '}
                                      <span>{error.message}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="bg-green-100 border border-green-300 rounded-md p-3 text-base text-green-800 flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                                <span className="font-bold">All fields valid - Ready to upload</span>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </div>

          {/* Fixed Footer */}
          <DialogFooter className="px-6 py-4 border-t border-gray-200 flex-shrink-0 bg-gray-50">
            <div className="flex items-center justify-between w-full">
              <div className="text-sm text-gray-600">
                {drStats.invalid > 0 && (
                  <div className="flex items-center gap-2 text-red-700 bg-red-100 px-4 py-2 rounded-lg border border-red-300">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="font-medium">
                      {drStats.invalid} row(s) have errors - please fix and re-upload
                    </span>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setShowDataRowValidationDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="lg"
                  onClick={confirmDataRowsUpload}
                  disabled={drStats.valid === 0}
                  className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 disabled:opacity-50"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Confirm Upload ({drStats.valid} Valid Row{drStats.valid !== 1 ? 's' : ''})
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

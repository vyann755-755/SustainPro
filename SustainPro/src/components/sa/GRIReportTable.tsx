import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { mockBusinessUnits } from './CDBBusinessUnits';
import { projectId as supabaseProjectId, publicAnonKey } from '../../utils/supabase/info';
import { Loader2, FileDown } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Add TypeScript declaration for jsPDF autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable?: {
      finalY: number;
    };
  }
}

interface GRIReportTableProps {
  projectName: string;
  assignedBUs?: string[];
  reportingYear?: number;
  projectId: string; // BCA project ID
}

interface CalculatedActivityData {
  activityUID: string;
  activityName: string;
  griCategory: string;
  griSubcategory: string;
  scope: '1' | '2' | '3';
  calculatedValue: number;
  unit: string;
}

interface BusinessUnitData {
  businessUnitId: string;
  businessUnitName: string;
  calculatedData: CalculatedActivityData[];
}

// GRI activities structure matching the screenshot
const griActivities = [
  // GRI 305-1 Direct GHG emissions (Scope 1)
  { category: '305.1.1', name: 'Table-1 : Stationary Combustion', scope: '1' },
  { category: '305.1.2', name: 'Table-2 : Mobile Combustion', scope: '1' },
  { category: '305.1.3', name: 'Table-3 : Fugitive Emissions - Refrigerant', scope: '1' },
  { category: '305.2.4', name: 'Table-4 : Fugitive Emissions - Fire Suppressant', scope: '1' },
  { category: '305.1.5', name: 'Table-5 : Fugitive Emissions - Electrical Insulating Gas', scope: '1' },
  { category: '305.2.6', name: 'Table-6 : Fugitive Emiss - Anesthetic Gas', scope: '1' },
  { category: '305.1.7', name: 'Table-7 : Fugitive Emissions - Waste Water Treatment', scope: '1' },
  
  // GRI 305-2 Indirect GHG emissions (Scope 2)
  { category: '305.2.8', name: 'Table 8. Electricity purchased: Location-based', scope: '2' },
  { category: '305.2.9', name: 'Table 9. Electricity purchased: Market-based', scope: '2' },
  { category: '305.2.10', name: 'Table 10. Electricity sold', scope: '2' },
  
  // GRI 305-3 Indirect GHG emissions (Scope 3)
  { category: '305.3.1', name: 'Cat. 1: Purchased goods and services', scope: '3' },
  { category: '305.3.2', name: 'Cat. 2: Capital goods', scope: '3' },
  { category: '305.3.3', name: 'Cat. 3: Fuel- and energy-related', scope: '3' },
  { category: '305.3.4', name: 'Cat. 4: Upstream Transportation and Distribution', scope: '3' },
  { category: '305.3.5', name: 'Cat. 5: Waste generated in operations', scope: '3' },
  { category: '305.3.6', name: 'Cat. 6: Business Travel', scope: '3' },
  { category: '305.3.7', name: 'Cat. 7: Employee Commuting', scope: '3' },
  { category: '305.3.8', name: 'Cat 8: Upstream Leased Assets', scope: '3' },
  { category: '305.3.9', name: 'Cat. 9: Downstream Transportation and Distribution', scope: '3' },
  { category: '305.3.10', name: 'Cat 10: Processing of sold products', scope: '3' },
  { category: '305.3.11', name: 'Cat. 11: Use of Sold Products', scope: '3' },
  { category: '305.3.12', name: 'Cat. 12: End-of-life treatment of sold products', scope: '3' },
  { category: '305.3.13', name: 'Cat. 13: Downstream Leased Assets', scope: '3' },
  { category: '305.3.14', name: 'Cat 14: Franchises', scope: '3' },
  { category: '305.3.15', name: 'Cat 15: Investments', scope: '3' },
];

export function GRIReportTable({ projectName, assignedBUs = [], reportingYear = 2024, projectId }: GRIReportTableProps) {
  const [buDataMap, setBuDataMap] = useState<Map<string, BusinessUnitData>>(new Map());
  const [loading, setLoading] = useState(true);

  // Get business units details
  const businessUnits = assignedBUs
    .map(buId => mockBusinessUnits.find(bu => bu.id === buId))
    .filter(Boolean) as typeof mockBusinessUnits;

  // Fetch data for all business units
  useEffect(() => {
    const fetchAllBUData = async () => {
      setLoading(true);
      const dataMap = new Map<string, BusinessUnitData>();

      // Fetch data for each business unit in parallel
      const promises = assignedBUs.map(async (buId) => {
        try {
          const response = await fetch(
            `https://${supabaseProjectId}.supabase.co/functions/v1/make-server-4f35b1fc/activity-data/${projectId}/${buId}`,
            {
              headers: {
                'Authorization': `Bearer ${publicAnonKey}`
              }
            }
          );

          if (response.ok) {
            const result = await response.json();
            if (result.data) {
              dataMap.set(buId, {
                businessUnitId: result.data.businessUnitId,
                businessUnitName: result.data.businessUnitName || '',
                calculatedData: result.data.calculatedData || []
              });
            }
          }
        } catch (error) {
          console.error(`Error fetching data for BU ${buId}:`, error);
        }
      });

      await Promise.all(promises);
      setBuDataMap(dataMap);
      setLoading(false);
    };

    if (assignedBUs.length > 0) {
      fetchAllBUData();
    } else {
      setLoading(false);
    }
  }, [assignedBUs, projectId]);

  // Function to get aggregated value for a specific GRI category and business unit
  const getInventoryValue = (griCategory: string, buId: string): number => {
    const buData = buDataMap.get(buId);
    if (!buData) return 0;

    // Sum all activities that match this GRI category
    const total = buData.calculatedData
      .filter(activity => activity.griSubcategory === griCategory)
      .reduce((sum, activity) => sum + activity.calculatedValue, 0);

    return total;
  };

  // Function to get total across all business units for a GRI category
  const getTotalInventory = (griCategory: string): number => {
    let total = 0;
    assignedBUs.forEach(buId => {
      total += getInventoryValue(griCategory, buId);
    });
    return total;
  };

  // Function to format number for display
  const formatValue = (value: number): string => {
    if (value === 0) return '-';
    return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Function to render scope header
  const renderScopeHeader = (scopeNumber: string, title: string) => {
    return (
      <TableRow className="bg-emerald-50">
        <TableCell colSpan={2 + businessUnits.length * 2 + 2} className="font-semibold text-emerald-900">
          {title}
        </TableCell>
      </TableRow>
    );
  };

  // Function to export the GRI Report to PDF
  const exportToPDF = () => {
    try {
      const doc = new jsPDF('landscape');
      
      // Add report header
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('GRI GHG Report', 14, 20);
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Reporting Organisation Name: ${projectName}`, 14, 30);
      doc.text(`Reporting Year: ${reportingYear}`, 14, 37);

      // Prepare table header
      const tableHeader: string[][] = [
        ['Category', 'Reporting Category', ...businessUnits.flatMap(bu => [`${bu.name} Unit`, `${bu.name} Inventory`]), 'Total Unit', 'Total Inventory']
      ];

      // Prepare table body data
      const tableBody: (string | number)[][] = [];

      // Helper function to add scope data
      const addScopeData = (scope: '1' | '2' | '3', scopeTitle: string) => {
        // Add scope header row
        tableBody.push([scopeTitle, '', ...new Array(businessUnits.length * 2 + 2).fill('')]);
        
        // Add activities for this scope
        griActivities
          .filter(activity => activity.scope === scope)
          .forEach(activity => {
            const totalValue = getTotalInventory(activity.category);
            const row: (string | number)[] = [activity.category, activity.name];
            
            businessUnits.forEach(bu => {
              const inventoryValue = getInventoryValue(activity.category, bu.id);
              row.push('kgCO2e', formatValue(inventoryValue));
            });
            
            row.push('kgCO2e', formatValue(totalValue));
            tableBody.push(row);
          });
      };

      // Add all scopes
      addScopeData('1', 'GRI 305-1 Direct GHG emissions (Scope 1)');
      addScopeData('2', 'GRI 305-2 Indirect GHG emissions (Scope 2)');
      addScopeData('3', 'GRI 305-3 Indirect GHG emissions (Scope 3)');

      // Generate table
      autoTable(doc, {
        head: tableHeader,
        body: tableBody,
        startY: 45,
        theme: 'grid',
        styles: {
          fontSize: 7,
          cellPadding: 2,
          lineColor: [200, 200, 200],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [16, 185, 129], // emerald-500
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8,
        },
        bodyStyles: {
          textColor: [31, 41, 55], // gray-800
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251], // gray-50
        },
        columnStyles: {
          0: { cellWidth: 20, fontSize: 6 }, // Category
          1: { cellWidth: 'auto', minCellWidth: 40 }, // Reporting category
        },
        margin: { left: 10, right: 10 },
      });

      // Save the PDF
      const fileName = `GRI_Report_${projectName.replace(/\s+/g, '_')}_${reportingYear}.pdf`;
      doc.save(fileName);
      
      toast.success('Report exported successfully!', {
        description: `Downloaded as ${fileName}`
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF', {
        description: 'Please try again or contact support'
      });
    }
  };

  if (loading) {
    return (
      <Card className="border-2 border-emerald-100">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading GRI Report data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-emerald-100">
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-emerald-900">GRI GHG Report</CardTitle>
          <Button 
            onClick={exportToPDF}
            className="bg-emerald-600 hover:bg-emerald-700"
            size="sm"
          >
            <FileDown className="h-4 w-4 mr-2" />
            Export to PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Report Header Information */}
        <div className="border-b border-gray-200">
          <div className="grid grid-cols-2">
            <div className="bg-emerald-100 p-3 border-r border-gray-200">
              <span className="font-semibold text-emerald-900">Reporting Organisation Name:</span>
            </div>
            <div className="p-3 bg-white">
              <span className="text-gray-900">{projectName}</span>
            </div>
          </div>
          <div className="grid grid-cols-2">
            <div className="bg-emerald-100 p-3 border-r border-gray-200 border-t">
              <span className="font-semibold text-emerald-900">Reporting Year:</span>
            </div>
            <div className="p-3 bg-white border-t border-gray-200">
              <span className="text-gray-900">{reportingYear}</span>
            </div>
          </div>
        </div>

        {/* GRI Report Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {/* First Header Row - Business Units */}
              <TableRow className="bg-emerald-100">
                <TableHead 
                  rowSpan={2} 
                  className="border-r border-gray-300 font-semibold text-emerald-900 align-middle"
                >
                  Business Unit
                </TableHead>
                <TableHead 
                  rowSpan={2} 
                  className="border-r border-gray-300 font-semibold text-emerald-900 align-middle min-w-[200px]"
                >
                  Reporting category
                </TableHead>
                {businessUnits.map((bu, index) => (
                  <TableHead 
                    key={bu.id}
                    colSpan={2} 
                    className={`text-center font-semibold text-emerald-900 border-r border-gray-300 ${
                      index === businessUnits.length - 1 ? 'border-r-2' : ''
                    }`}
                  >
                    {bu.name} (BU)
                  </TableHead>
                ))}
                <TableHead 
                  colSpan={2} 
                  className="text-center font-semibold text-emerald-900"
                >
                  Total
                </TableHead>
              </TableRow>
              {/* Second Header Row - Unit/Inventory */}
              <TableRow className="bg-emerald-100">
                {businessUnits.map((bu, index) => (
                  <React.Fragment key={bu.id}>
                    <TableHead className="text-center font-semibold text-emerald-900 text-xs border-r border-gray-200">
                      Unit
                    </TableHead>
                    <TableHead className={`text-center font-semibold text-emerald-900 text-xs border-r border-gray-300 ${
                      index === businessUnits.length - 1 ? 'border-r-2' : ''
                    }`}>
                      Inventory
                    </TableHead>
                  </React.Fragment>
                ))}
                <TableHead className="text-center font-semibold text-emerald-900 text-xs border-r border-gray-200">
                  Unit
                </TableHead>
                <TableHead className="text-center font-semibold text-emerald-900 text-xs">
                  Inventory
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Scope 1 Activities */}
              {renderScopeHeader('1', 'GRI 305-1 Direct GHG emissions (Scope 1)')}
              {griActivities
                .filter(activity => activity.scope === '1')
                .map((activity, index) => {
                  const totalValue = getTotalInventory(activity.category);
                  return (
                    <TableRow key={activity.category} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <TableCell className="font-mono text-xs text-gray-700 border-r border-gray-300">
                        {activity.category}
                      </TableCell>
                      <TableCell className="text-sm text-gray-900 border-r border-gray-300">
                        {activity.name}
                      </TableCell>
                      {businessUnits.map((bu, buIndex) => {
                        const inventoryValue = getInventoryValue(activity.category, bu.id);
                        return (
                          <React.Fragment key={bu.id}>
                            <TableCell className="text-center text-xs text-gray-600 border-r border-gray-200">
                              kgCO2e
                            </TableCell>
                            <TableCell className={`text-center text-sm text-gray-900 border-r border-gray-300 ${
                              buIndex === businessUnits.length - 1 ? 'border-r-2' : ''
                            }`}>
                              {formatValue(inventoryValue)}
                            </TableCell>
                          </React.Fragment>
                        );
                      })}
                      <TableCell className="text-center text-xs text-gray-600 border-r border-gray-200">
                        kgCO2e
                      </TableCell>
                      <TableCell className="text-center text-sm font-semibold text-gray-900">
                        {formatValue(totalValue)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              
              {/* Scope 2 Activities */}
              {renderScopeHeader('2', 'GRI 305-2 Indirect GHG emissions (Scope 2)')}
              {griActivities
                .filter(activity => activity.scope === '2')
                .map((activity, index) => {
                  const totalValue = getTotalInventory(activity.category);
                  return (
                    <TableRow key={activity.category} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <TableCell className="font-mono text-xs text-gray-700 border-r border-gray-300">
                        {activity.category}
                      </TableCell>
                      <TableCell className="text-sm text-gray-900 border-r border-gray-300">
                        {activity.name}
                      </TableCell>
                      {businessUnits.map((bu, buIndex) => {
                        const inventoryValue = getInventoryValue(activity.category, bu.id);
                        return (
                          <React.Fragment key={bu.id}>
                            <TableCell className="text-center text-xs text-gray-600 border-r border-gray-200">
                              kgCO2e
                            </TableCell>
                            <TableCell className={`text-center text-sm text-gray-900 border-r border-gray-300 ${
                              buIndex === businessUnits.length - 1 ? 'border-r-2' : ''
                            }`}>
                              {formatValue(inventoryValue)}
                            </TableCell>
                          </React.Fragment>
                        );
                      })}
                      <TableCell className="text-center text-xs text-gray-600 border-r border-gray-200">
                        kgCO2e
                      </TableCell>
                      <TableCell className="text-center text-sm font-semibold text-gray-900">
                        {formatValue(totalValue)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              
              {/* Scope 3 Activities */}
              {renderScopeHeader('3', 'GRI 305-3 Indirect GHG emissions (Scope 3)')}
              {griActivities
                .filter(activity => activity.scope === '3')
                .map((activity, index) => {
                  const totalValue = getTotalInventory(activity.category);
                  return (
                    <TableRow key={activity.category} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <TableCell className="font-mono text-xs text-gray-700 border-r border-gray-300">
                        {activity.category}
                      </TableCell>
                      <TableCell className="text-sm text-gray-900 border-r border-gray-300">
                        {activity.name}
                      </TableCell>
                      {businessUnits.map((bu, buIndex) => {
                        const inventoryValue = getInventoryValue(activity.category, bu.id);
                        return (
                          <React.Fragment key={bu.id}>
                            <TableCell className="text-center text-xs text-gray-600 border-r border-gray-200">
                              kgCO2e
                            </TableCell>
                            <TableCell className={`text-center text-sm text-gray-900 border-r border-gray-300 ${
                              buIndex === businessUnits.length - 1 ? 'border-r-2' : ''
                            }`}>
                              {formatValue(inventoryValue)}
                            </TableCell>
                          </React.Fragment>
                        );
                      })}
                      <TableCell className="text-center text-xs text-gray-600 border-r border-gray-200">
                        kgCO2e
                      </TableCell>
                      <TableCell className="text-center text-sm font-semibold text-gray-900">
                        {formatValue(totalValue)}
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
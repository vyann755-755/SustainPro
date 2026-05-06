import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { toast } from 'sonner@2.0.3';
import {
  FileText,
  Save,
  Download,
  Plus,
  Trash2,
  Info,
  Check,
  ChevronDown
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';

// Mock MultiSelect Component
const MultiSelect = ({ 
  options, 
  selected, 
  onChange, 
  placeholder 
}: { 
  options: { label: string; value: string }[]; 
  selected: string[]; 
  onChange: (values: string[]) => void;
  placeholder: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="relative">
      <div 
        className="flex min-h-[40px] w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm ring-offset-white focus-within:ring-2 focus-within:ring-slate-950 focus-within:ring-offset-2 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1">
          {selected.length === 0 && <span className="text-slate-500">{placeholder}</span>}
          {selected.map(val => {
            const option = options.find(o => o.value === val);
            return (
              <Badge key={val} variant="secondary" className="mr-1">
                {option?.label || val}
              </Badge>
            );
          })}
        </div>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </div>
      
      {isOpen && (
        <div className="absolute z-10 top-full left-0 right-0 mt-1 max-h-60 overflow-auto rounded-md border border-slate-200 bg-white p-1 shadow-md">
          {options.map((option) => (
            <div
              key={option.value}
              className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
              onClick={() => toggleOption(option.value)}
            >
              <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                {selected.includes(option.value) && <Check className="h-4 w-4" />}
              </span>
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const CDBReportTemplates = () => {
  const [reportName, setReportName] = useState('ABC Group');
  const [responsiblePerson, setResponsiblePerson] = useState('');
  const [selectedBUs, setSelectedBUs] = useState<string[]>([]);
  const [reportingYear, setReportingYear] = useState('');
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);

  // Table State
  const [header1, setHeader1] = useState('Editable text');
  const [header2, setHeader2] = useState('Editable text');
  const [rows, setRows] = useState([
    { id: 1, type: 'Main category', val1: '1000', inventory: '', unit: '', val2: '1000' },
    { id: 2, type: 'Subcategory', val1: '1000', inventory: '', unit: '', val2: '1000' },
  ]);

  const buOptions = [
    { label: 'BU1', value: 'bu1' },
    { label: 'BU2', value: 'bu2' },
    { label: 'BU3', value: 'bu3' }
  ];

  const activityOptions = [
    { label: 'Energy', value: 'energy' },
    { label: 'Carbon', value: 'carbon' },
    { label: 'Water', value: 'water' },
    { label: 'Waste', value: 'waste' }
  ];

  const addRow = () => {
    setRows([...rows, { id: Date.now(), type: '', val1: '', inventory: '', unit: '', val2: '' }]);
  };

  const removeRow = (id: number) => {
    setRows(rows.filter(row => row.id !== id));
  };

  const updateRow = (id: number, field: string, value: string) => {
    setRows(rows.map(row => row.id === id ? { ...row, [field]: value } : row));
  };

  const handleExport = (format: string) => {
    toast.success(`Exporting as ${format}...`, {
      description: 'Your report template is being generated.'
    });
  };

  const handleSave = () => {
    if (!reportName || selectedBUs.length === 0 || !reportingYear) {
      toast.error('Missing Information', {
        description: 'Please fill out all required fields before saving.'
      });
      return;
    }
    toast.success('Template Saved', {
      description: `Template for ${reportName} saved successfully.`
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="h-6 w-6 text-emerald-600" />
            Reporting Template Builder
          </h2>
          <p className="text-slate-500">Create, customize, and save editable reporting templates.</p>
        </div>
        <div className="flex gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" /> Export Report
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('Word')}>Word (.docx)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('Excel')}>Excel (.xlsx)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('PDF')}>PDF (.pdf)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
            <Save className="h-4 w-4" /> Save Template
          </Button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg flex items-start gap-3">
        <Info className="h-5 w-5 mt-0.5 text-blue-600 flex-shrink-0" />
        <p className="text-sm">
          <strong>Note:</strong> This template can only be fully built and populated after generating the GRI report of the respective Business Units.
        </p>
      </div>

      <Card className="border-emerald-100 shadow-sm">
        <CardHeader className="bg-emerald-50/50 border-b border-emerald-100 pb-4">
          <CardTitle className="text-lg text-emerald-800">General Report Information</CardTitle>
          <CardDescription>Configure the basic parameters for this report template.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="orgName">Reporting Organization Name</Label>
              <Input 
                id="orgName" 
                value={reportName} 
                onChange={(e) => setReportName(e.target.value)} 
                placeholder="e.g., ABC Group" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="responsiblePerson">Person/Entity Responsible</Label>
              <Input 
                id="responsiblePerson" 
                value={responsiblePerson} 
                onChange={(e) => setResponsiblePerson(e.target.value)} 
                placeholder="Name or entity" 
              />
            </div>
            
            <div className="space-y-2 relative z-20">
              <Label>Business Unit</Label>
              <MultiSelect 
                options={buOptions}
                selected={selectedBUs}
                onChange={setSelectedBUs}
                placeholder="Select business units..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="year">Reporting Year</Label>
              <Select value={reportingYear} onValueChange={setReportingYear}>
                <SelectTrigger id="year">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 relative z-10 md:col-span-2">
              <Label>Activity Scope</Label>
              <MultiSelect 
                options={activityOptions}
                selected={selectedActivities}
                onChange={setSelectedActivities}
                placeholder="Select activities (Energy, Carbon, Water, Waste)..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-lg">Template Configuration Table</CardTitle>
            <CardDescription>Define the structure and line items of the report.</CardDescription>
          </div>
          <Button onClick={addRow} size="sm" variant="outline" className="gap-2">
            <Plus className="h-4 w-4" /> Add Row
          </Button>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-[150px]">Numbering (Guide)</TableHead>
                  <TableHead>
                    <Input 
                      value={header1} 
                      onChange={(e) => setHeader1(e.target.value)} 
                      className="h-8 font-medium bg-transparent border-slate-300"
                    />
                  </TableHead>
                  <TableHead>Inventory</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>
                    <Input 
                      value={header2} 
                      onChange={(e) => setHeader2(e.target.value)} 
                      className="h-8 font-medium bg-transparent border-slate-300"
                    />
                  </TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Input 
                        value={row.type} 
                        onChange={(e) => updateRow(row.id, 'type', e.target.value)}
                        placeholder="(Category)"
                        className="h-8"
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        value={row.val1} 
                        onChange={(e) => updateRow(row.id, 'val1', e.target.value)}
                        className="h-8"
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        value={row.inventory} 
                        onChange={(e) => updateRow(row.id, 'inventory', e.target.value)}
                        className="h-8"
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        value={row.unit} 
                        onChange={(e) => updateRow(row.id, 'unit', e.target.value)}
                        className="h-8"
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        value={row.val2} 
                        onChange={(e) => updateRow(row.id, 'val2', e.target.value)}
                        className="h-8"
                      />
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeRow(row.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

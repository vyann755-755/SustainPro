import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Building2, Download, Edit, FileSpreadsheet, Link2 } from 'lucide-react';
import { businessUnitsWithProjects } from '../../data/sharedProjectData';
import { toast } from 'sonner@2.0.3';

export function ActivityDataUpload() {
  const handleDownloadTemplate = (buName: string) => {
    toast.success(`Downloading activity data template for ${buName}`);
  };

  const handleManualInput = (buName: string) => {
    toast.info(`Opening manual input form for ${buName}`);
  };

  const handleExcelUpload = (buName: string) => {
    toast.info(`Opening Excel upload for ${buName}`);
  };

  const handleAPISync = (buName: string) => {
    toast.info(`Opening API sync configuration for ${buName}`);
  };

  return (
    <div className="space-y-6">
      {/* Instructions Card */}
      <Card className="border-2 border-emerald-100 bg-gradient-to-br from-emerald-50 to-green-50">
        <CardContent className="p-6">
          <h3 className="text-lg text-emerald-900 mb-4">Fill in Activity Data for Assigned BUs Inside BCA Projects</h3>
          <div className="space-y-3 text-sm text-emerald-800">
            <div className="flex items-start gap-2">
              <div className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
              <p>Customer can only view data entry forms for the BUs that have been assigned to them.</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
              <p>Customer will have to input values for all variables in all activities under the assigned BUs.</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
              <p>Customer can bulk upload activity data via Excel upload.</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">4</div>
              <p>New data input by Customer will overwrite & replace the existing data.</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">5</div>
              <p>Activity data input by Customer can be viewed and edited by SA.</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">6</div>
              <p>Activity data is correctly captured & results calculated accurately.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Unit Data Cards */}
      {businessUnitsWithProjects.map((bu) => (
        <Card key={bu.id} className="border-2 border-emerald-100">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-5 w-5 text-emerald-600" />
                  <h3 className="text-xl text-emerald-900">{bu.name}</h3>
                </div>
                <p className="text-sm text-emerald-600">
                  I can provide data on my department or business unit&apos;s activities during the reporting period
                </p>
              </div>
            </div>

            {/* Projects under this business unit */}
            <div className="space-y-3">
              {bu.projects.map((project) => (
                <div key={project.id} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-emerald-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-emerald-900">{project.name}</h4>
                    <span className="text-sm text-emerald-600 px-3 py-1 bg-white rounded-full border border-emerald-200">
                      {project.status}
                    </span>
                  </div>
                  
                  {/* Upload Buttons */}
                  <div className="grid grid-cols-4 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadTemplate(bu.name)}
                      className="flex items-center gap-2 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                    >
                      <Download className="h-4 w-4" />
                      Template
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleManualInput(bu.name)}
                      className="flex items-center gap-2 text-blue-700 border-blue-300 hover:bg-blue-50"
                    >
                      <Edit className="h-4 w-4" />
                      Manual Input
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExcelUpload(bu.name)}
                      className="flex items-center gap-2 text-purple-700 border-purple-300 hover:bg-purple-50"
                    >
                      <FileSpreadsheet className="h-4 w-4" />
                      Excel Upload
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAPISync(bu.name)}
                      className="flex items-center gap-2 text-teal-700 border-teal-300 hover:bg-teal-50"
                    >
                      <Link2 className="h-4 w-4" />
                      API Sync
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

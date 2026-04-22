import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Package, Download, Edit, FileSpreadsheet, Link2 } from 'lucide-react';
import { productsWithProjects } from '../../data/sharedProjectData';
import { toast } from 'sonner@2.0.3';

export function ProductDataUpload() {
  const handleDownloadTemplate = (productName: string) => {
    toast.success(`Downloading template for ${productName}`);
  };

  const handleManualInput = (productName: string) => {
    toast.info(`Opening manual input form for ${productName}`);
  };

  const handleExcelUpload = (productName: string) => {
    toast.info(`Opening Excel upload for ${productName}`);
  };

  const handleAPISync = (productName: string) => {
    toast.info(`Opening API sync configuration for ${productName}`);
  };

  return (
    <div className="space-y-6">
      {/* Instructions Card */}
      <Card className="border-2 border-emerald-100 bg-gradient-to-br from-emerald-50 to-green-50">
        <CardContent className="p-6">
          <h3 className="text-lg text-emerald-900 mb-4">Upload Data for Assigned Products & Sub-products</h3>
          <div className="space-y-3 text-sm text-emerald-800">
            <div className="flex items-start gap-2">
              <div className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
              <p>You can only view data entry forms for the sub/products that have been assigned to them.</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
              <p>Input sub/product quantities manually via grasshopper UI, bulk Excel upload, or external third party platforms that have been API integrated.</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
              <p>New data input will overwrite & replace the existing data.</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">4</div>
              <p>Quantity data input can be viewed and edited by SA. Quantity data is correctly captured & results calculated accurately.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Data Cards */}
      {productsWithProjects.map((product) => (
        <Card key={product.id} className="border-2 border-emerald-100">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-5 w-5 text-emerald-600" />
                  <h3 className="text-xl text-emerald-900">{product.name}</h3>
                </div>
                <p className="text-sm text-emerald-600">
                  Provide data on quantity of this product manufactured or quantity of sub-product manufactured/sourced during the reporting period
                </p>
              </div>
            </div>

            {/* Projects under this product */}
            <div className="space-y-3">
              {product.projects.map((project) => (
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
                      onClick={() => handleDownloadTemplate(product.name)}
                      className="flex items-center gap-2 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                    >
                      <Download className="h-4 w-4" />
                      Template
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleManualInput(product.name)}
                      className="flex items-center gap-2 text-blue-700 border-blue-300 hover:bg-blue-50"
                    >
                      <Edit className="h-4 w-4" />
                      Manual Input
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExcelUpload(product.name)}
                      className="flex items-center gap-2 text-purple-700 border-purple-300 hover:bg-purple-50"
                    >
                      <FileSpreadsheet className="h-4 w-4" />
                      Excel Upload
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAPISync(product.name)}
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

import React from 'react';
import { SubProducts } from '../admin/SubProducts';
import { Package } from 'lucide-react';

export function CDBSubProducts() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
          <Package className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Sub-products</h1>
          <p className="text-gray-600">Manage client-specific sub-products and components</p>
        </div>
      </div>

      {/* Main Content */}
      <SubProducts />
    </div>
  );
}

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Checkbox } from '../ui/checkbox';
import { useMasterDB } from '../../contexts/MasterDBContext';
import { 
  Search, 
  X,
  Star,
  CheckCircle,
  Building,
  Globe,
  Clock,
  Database,
  ExternalLink
} from 'lucide-react';

interface AssignMasterEFDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (selectedIds: string[]) => void;
  availableEFs?: any[]; // Keep for backward compatibility but use context data
}

export function AssignMasterEFDialog({ isOpen, onClose, onAssign }: AssignMasterEFDialogProps) {
  const { getMasterEFsForAssignment } = useMasterDB();
  const [masterEFSearchTerm, setMasterEFSearchTerm] = useState('');
  const [selectedMasterEFIds, setSelectedMasterEFIds] = useState<string[]>([]);

  // Get real Master DB data
  const availableMasterEFs = getMasterEFsForAssignment();

  // Filter Master EFs for the Assign dialog
  const filteredMasterEFs = availableMasterEFs.filter(ef => {
    const matchesSearch = ef.name.toLowerCase().includes(masterEFSearchTerm.toLowerCase()) ||
                         ef.uid.toLowerCase().includes(masterEFSearchTerm.toLowerCase()) ||
                         ef.category.toLowerCase().includes(masterEFSearchTerm.toLowerCase()) ||
                         ef.country.toLowerCase().includes(masterEFSearchTerm.toLowerCase()) ||
                         ef.description.toLowerCase().includes(masterEFSearchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleMasterEFSelection = (efId: string, checked: boolean) => {
    if (checked) {
      setSelectedMasterEFIds([...selectedMasterEFIds, efId]);
    } else {
      setSelectedMasterEFIds(selectedMasterEFIds.filter(id => id !== efId));
    }
  };

  const handleAssign = () => {
    onAssign(selectedMasterEFIds);
    setSelectedMasterEFIds([]);
    setMasterEFSearchTerm('');
    onClose();
  };

  const handleCancel = () => {
    setSelectedMasterEFIds([]);
    setMasterEFSearchTerm('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-blue-600" />
            Assign Emission Factors from Master Database
          </DialogTitle>
          <DialogDescription>
            Search and select emission factors from the Master DB to assign to this client
          </DialogDescription>
        </DialogHeader>
        
        {/* Search Bar for Master EFs */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search Master DB emission factors by name, UID, category, country, or description..."
                value={masterEFSearchTerm}
                onChange={(e) => setMasterEFSearchTerm(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>
          </div>
          {masterEFSearchTerm && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMasterEFSearchTerm('')}
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
        
        {/* Search Results Info */}
        <div className="flex items-center justify-between px-1 text-sm">
          <div className="text-gray-600">
            {masterEFSearchTerm ? (
              <>Showing {filteredMasterEFs.length} of {availableMasterEFs.length} emission factors</>
            ) : (
              <>Available emission factors: {availableMasterEFs.length}</>
            )}
            {filteredMasterEFs.length === 0 && masterEFSearchTerm && (
              <span className="text-amber-600 ml-2">- Try different search terms</span>
            )}
          </div>
          {selectedMasterEFIds.length > 0 && (
            <div className="text-blue-600 font-medium">
              {selectedMasterEFIds.length} selected
            </div>
          )}
        </div>
        
        {/* Master EFs List */}
        <div className="space-y-3 max-h-96 overflow-y-auto border rounded-lg p-2">
          {filteredMasterEFs.length > 0 ? (
            filteredMasterEFs.map((ef) => (
              <Card 
                key={ef.id} 
                className={`cursor-pointer transition-all duration-200 hover:shadow-md border ${
                  selectedMasterEFIds.includes(ef.id) 
                    ? 'bg-blue-50 border-blue-300 shadow-sm' 
                    : 'hover:border-blue-200'
                }`}
                onClick={() => handleMasterEFSelection(ef.id, !selectedMasterEFIds.includes(ef.id))}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedMasterEFIds.includes(ef.id)}
                      onChange={() => {}} // Handled by card click
                      className="mt-0.5"
                    />
                    
                    <div className="flex-1 space-y-2">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900">{ef.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              <Database className="h-3 w-3 mr-1" />
                              Master DB
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <code className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">
                              {ef.uid}
                            </code>
                            <span>•</span>
                            <Badge variant="secondary" className="text-xs">
                              {ef.category}
                            </Badge>
                          </div>
                        </div>
                        
                        {selectedMasterEFIds.includes(ef.id) && (
                          <CheckCircle className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                      
                      {/* Details */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-gray-600">
                            <Globe className="h-3 w-3" />
                            <span>Country: {ef.country}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <Clock className="h-3 w-3" />
                            <span>Version: {ef.latestVersion}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="text-right">
                            <div className="font-medium text-gray-900">
                              {ef.latestValue.value} {ef.latestValue.unit}
                            </div>
                            <div className="text-xs text-gray-500">
                              Latest Value
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Description */}
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {ef.description}
                      </p>
                      
                      {/* Impact Categories */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Impact Categories:</span>
                        <div className="flex flex-wrap gap-1">
                          {ef.impactCategories.map(category => (
                            <Badge key={category} variant="outline" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No emission factors found</p>
              <p className="text-sm">
                {masterEFSearchTerm 
                  ? "Try adjusting your search terms" 
                  : "No Master DB emission factors are available for assignment"
                }
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssign}
            disabled={selectedMasterEFIds.length === 0}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <Star className="h-4 w-4 mr-2" />
            Assign Selected ({selectedMasterEFIds.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
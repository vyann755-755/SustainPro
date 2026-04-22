import React, { useState, useMemo } from 'react';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';

const griGroups = [
  { id: 'GRI-305-1', name: 'GRI 305-1 Direct GHG emissions (Scope 1)' },
  { id: 'GRI-305-2', name: 'GRI 305-2 Indirect GHG emissions (Scope 2)' },
  { id: 'GRI-305-3', name: 'GRI 305-3 Indirect GHG emissions (Scope 3)' },
  { id: 'GRI-302-1', name: 'GRI 302-1 Energy Consumption within the organization' },
  { id: 'GRI-303-3-ALL', name: 'GRI 303-3 (a) (b) (c): Withdrawal from all areas' },
  { id: 'GRI-303-3-STRESS', name: 'GRI 303-3 (a) (b) (c): Withdrawal from all areas with water stress' },
  { id: 'GRI-303-4-ALL', name: 'GRI 303-4 (a) (b) (c): Discharge to all areas' },
  { id: 'GRI-303-4-STRESS', name: 'GRI 303-4 (a) (b) (c): Discharge to all areas with water stress' },
  { id: 'GRI-303-5', name: 'GRI 303-5 Water consumption' },
  { id: 'GRI-306-4', name: 'GRI 306-4 Waste diverted from disposal' },
  { id: 'GRI-306-5', name: 'GRI 306-5 Waste directed to disposal' }
];

const griCategories = [
  // GRI 305-1 Direct GHG emissions (Scope 1)
  { code: '305.1.1', label: 'Table-1 : Stationary Combustion', group: 'GRI-305-1' },
  { code: '305.1.2', label: 'Table-2 : Mobile Combustion', group: 'GRI-305-1' },
  { code: '305.1.3', label: 'Table-3 : Fugitive Emissions - Refrigerent', group: 'GRI-305-1' },
  { code: '305.2.4', label: 'Table-4 : Fugitive Emissions - Fire Suppressant', group: 'GRI-305-1' },
  { code: '305.1.5', label: 'Table-5 : Fugitive Emissions - Electrical Insulating Gas', group: 'GRI-305-1' },
  { code: '305.2.6', label: 'Table-6 : Fugitive Emissions - Anesthetic Gas', group: 'GRI-305-1' },
  { code: '305.1.7', label: 'Table-7 : Fugitive Emissions - Waste Water Treatment', group: 'GRI-305-1' },
  
  // GRI 305-2 Indirect GHG emissions (Scope 2)
  { code: '305.2.8', label: 'Table 8. Electricity purchased: Location-based', group: 'GRI-305-2' },
  { code: '305.2.9', label: 'Table 9. Electricity purchased: Market-based', group: 'GRI-305-2' },
  { code: '305.2.10', label: 'Table 10. Electricity sold', group: 'GRI-305-2' },
  
  // GRI 305-3 Indirect GHG emissions (Scope 3)
  { code: '305.3.1', label: 'Cat. 1: Purchased goods and services', group: 'GRI-305-3' },
  { code: '305.3.2', label: 'Cat. 2: Capital goods', group: 'GRI-305-3' },
  { code: '305.3.3', label: 'Cat. 3: Fuel- and energy-related', group: 'GRI-305-3' },
  { code: '305.3.4', label: 'Cat. 4: Upstream Transportation and Distribution', group: 'GRI-305-3' },
  { code: '305.3.5', label: 'Cat. 5: Waste generated in operations', group: 'GRI-305-3' },
  { code: '305.3.6', label: 'Cat. 6: Business Travel', group: 'GRI-305-3' },
  { code: '305.3.7', label: 'Cat. 7: Employee Commuting', group: 'GRI-305-3' },
  { code: '305.3.8', label: 'Cat 8: Upstream Leased Assets', group: 'GRI-305-3' },
  { code: '305.3.9', label: 'Cat. 9: Downstream Transportation and Distribution', group: 'GRI-305-3' },
  { code: '305.3.10', label: 'Cat 10: Processing of sold products', group: 'GRI-305-3' },
  { code: '305.3.11', label: 'Cat. 11: Use of Sold Products', group: 'GRI-305-3' },
  { code: '305.3.12', label: 'Cat. 12: End-of-life treatment of sold products', group: 'GRI-305-3' },
  { code: '305.3.13', label: 'Cat. 13: Downstream Leased Assets', group: 'GRI-305-3' },
  { code: '305.3.14', label: 'Cat 14: Franchises', group: 'GRI-305-3' },
  { code: '305.3.15', label: 'Cat 15: Investments', group: 'GRI-305-3' },
  
  // GRI 302-1 Energy Consumption within the organization
  { code: '302.1.1', label: 'Table-1 : Non-renewable fuel consumed : Stationary Combustion', group: 'GRI-302-1' },
  { code: '302.1.2', label: 'Table-2 : Non-renewable fuel consumed : Mobile Combustion', group: 'GRI-302-1' },
  { code: '302.1.3', label: 'Table-3 : Renewable fuel consumed : Biofuels/biomass combustion', group: 'GRI-302-1' },
  { code: '302.1.4', label: 'Table-4 : Electricity Purchased', group: 'GRI-302-1' },
  { code: '302.1.5', label: 'Table-5 : Self Generated Electricity', group: 'GRI-302-1' },
  { code: '302.1.6', label: 'Table-6 : Electricity sold', group: 'GRI-302-1' },
  { code: '302.1.7', label: 'Table-7 : Heating, Cooling and steam purchased', group: 'GRI-302-1' },
  { code: '302.1.8', label: 'Table-8 : Self generated heating, Cooling and steam purchased', group: 'GRI-302-1' },
  { code: '302.1.9', label: 'Table-9 : Heating, Cooling and steam sold', group: 'GRI-302-1' },
  
  // GRI 303-3 Withdrawal from all areas
  { code: '303.3.1', label: 'Table-1 : Water withdrawal with a breakdown by sources - Fresh Water : TDS<= 1000mg/l', group: 'GRI-303-3-ALL' },
  { code: '303.3.2', label: 'Table-2 : Water withdrawal with a breakdown by sources - Other Water : TDS> 1000mg/l', group: 'GRI-303-3-ALL' },
  
  // GRI 303-3 Withdrawal from all areas with water stress
  { code: '303.3.3', label: 'Table-3 : Water withdrawal with a breakdown by sources - Fresh Water : TDS<= 1000mg/l', group: 'GRI-303-3-STRESS' },
  { code: '303.3.4', label: 'Table-4 : Water withdrawal with a breakdown by sources - Other Water : TDS> 1000mg/l', group: 'GRI-303-3-STRESS' },
  
  // GRI 303-4 Discharge to all areas
  { code: '303.4.5', label: 'Table-5 : Water discharge with a breakdown by sources - Fresh Water : TDS<= 1000mg/l', group: 'GRI-303-4-ALL' },
  { code: '303.4.6', label: 'Table-6 : Water discharge with a breakdown by sources - Other Water : TDS> 1000mg/l', group: 'GRI-303-4-ALL' },
  
  // GRI 303-4 Discharge to all areas with water stress
  { code: '303.4.7', label: 'Table-7 : Water discharge with a breakdown by sources - Fresh Water : TDS<= 1000mg/l', group: 'GRI-303-4-STRESS' },
  { code: '303.4.8', label: 'Table-8 : Water discharge with a breakdown by sources - Other Water : TDS> 1000mg/l', group: 'GRI-303-4-STRESS' },
  
  // GRI 303-5 Water consumption
  { code: '303.5.1', label: 'All areas', group: 'GRI-303-5' },
  { code: '303.5.2', label: 'All areas with water stress', group: 'GRI-303-5' },
  
  // GRI 306-4 Waste diverted from disposal
  { code: '306.4.1', label: 'Table-1 : Preperation for reuse', group: 'GRI-306-4' },
  { code: '306.4.2', label: 'Table-2 : Recycling', group: 'GRI-306-4' },
  { code: '306.4.3', label: 'Table-3 : Other recovery operations', group: 'GRI-306-4' },
  { code: '306.4.4', label: 'Table-4 : Preperation for reuse', group: 'GRI-306-4' },
  { code: '306.4.5', label: 'Table-5 : Recycling', group: 'GRI-306-4' },
  { code: '306.4.6', label: 'Table-6 : Other recovery operations', group: 'GRI-306-4' },
  { code: '306.4.7', label: 'Table-7 : Preperation for reuse', group: 'GRI-306-4' },
  { code: '306.4.8', label: 'Table-8 : Recycling', group: 'GRI-306-4' },
  { code: '306.4.9', label: 'Table-9 : Other recovery operations', group: 'GRI-306-4' },
  { code: '306.4.10', label: 'Table-10 : Preperation for reuse', group: 'GRI-306-4' },
  { code: '306.4.11', label: 'Table-11 : Recycling', group: 'GRI-306-4' },
  { code: '306.4.12', label: 'Table-12 : Other recovery operations', group: 'GRI-306-4' },
  
  // GRI 306-5 Waste directed to disposal
  { code: '306.5.13', label: 'Table-13 : Incineration with energy recovery', group: 'GRI-306-5' },
  { code: '306.5.14', label: 'Table-14 : Incineration without energy recovery', group: 'GRI-306-5' },
  { code: '306.5.15', label: 'Table-15 : Landfilling', group: 'GRI-306-5' },
  { code: '306.5.16', label: 'Table-16 : Other disposal operations', group: 'GRI-306-5' },
  { code: '306.5.17', label: 'Table-17 : Incineration with energy recovery', group: 'GRI-306-5' },
  { code: '306.5.18', label: 'Table-18 : Incineration without energy recovery', group: 'GRI-306-5' },
  { code: '306.5.19', label: 'Table-19 : Landfilling', group: 'GRI-306-5' },
  { code: '306.5.20', label: 'Table-20 : Other disposal operations', group: 'GRI-306-5' },
  { code: '306.5.21', label: 'Table-21 : Incineration with energy recovery', group: 'GRI-306-5' },
  { code: '306.5.22', label: 'Table-22 : Incineration without energy recovery', group: 'GRI-306-5' },
  { code: '306.5.23', label: 'Table-23 : Landfilling', group: 'GRI-306-5' },
  { code: '306.5.24', label: 'Table-24 : Other disposal operations', group: 'GRI-306-5' },
  { code: '306.5.25', label: 'Table-25 : Incineration with energy recovery', group: 'GRI-306-5' },
  { code: '306.5.26', label: 'Table-26 : Incineration without energy recovery', group: 'GRI-306-5' },
  { code: '306.5.27', label: 'Table-27 : Landfilling', group: 'GRI-306-5' },
  { code: '306.5.28', label: 'Table-28 : Other disposal operations', group: 'GRI-306-5' }
];

interface GRICategorySelectorProps {
  selectedCategories: string[];
  onChange: (categories: string[]) => void;
}

export function GRICategorySelector({ selectedCategories, onChange }: GRICategorySelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Filter groups and categories based on search
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) {
      // No search - show all groups with their categories
      return griGroups.map(group => ({
        group,
        categories: griCategories.filter(cat => cat.group === group.id)
      }));
    }

    const query = searchQuery.toLowerCase();
    
    // Search in both groups and categories
    const matchingGroups = griGroups.filter(group =>
      group.name.toLowerCase().includes(query) ||
      group.id.toLowerCase().includes(query)
    );

    const matchingCategories = griCategories.filter(cat =>
      cat.code.toLowerCase().includes(query) ||
      cat.label.toLowerCase().includes(query)
    );

    // Build result showing groups that match or have matching categories
    const result: Array<{ group: typeof griGroups[0], categories: typeof griCategories }> = [];
    
    griGroups.forEach(group => {
      const groupMatches = matchingGroups.some(g => g.id === group.id);
      const groupCategories = matchingCategories.filter(cat => cat.group === group.id);
      
      if (groupMatches || groupCategories.length > 0) {
        result.push({
          group,
          categories: groupMatches 
            ? griCategories.filter(cat => cat.group === group.id) // Show all categories if group matches
            : groupCategories // Show only matching categories
        });
      }
    });

    return result;
  }, [searchQuery]);

  // Filter by selected group
  const displayData = useMemo(() => {
    if (!selectedGroupId) return filteredData;
    return filteredData.filter(item => item.group.id === selectedGroupId);
  }, [filteredData, selectedGroupId]);

  const handleCategoryToggle = (categoryCode: string) => {
    if (selectedCategories.includes(categoryCode)) {
      onChange(selectedCategories.filter(c => c !== categoryCode));
    } else {
      onChange([...selectedCategories, categoryCode]);
    }
  };

  const toggleGroupExpansion = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  // Auto-expand groups when searching
  useMemo(() => {
    if (searchQuery.trim()) {
      setExpandedGroups(new Set(filteredData.map(item => item.group.id)));
    }
  }, [searchQuery, filteredData]);

  return (
    <Card>
      <CardContent className="pt-4 space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search GRI groups or categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Group Filter Buttons */}
        {!searchQuery && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedGroupId === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedGroupId(null)}
              className={selectedGroupId === null ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
            >
              All Groups
            </Button>
            {griGroups.map(group => {
              const categoryCount = griCategories.filter(cat => cat.group === group.id).length;
              const selectedCount = selectedCategories.filter(code => 
                griCategories.find(cat => cat.code === code)?.group === group.id
              ).length;
              
              return (
                <Button
                  key={group.id}
                  variant={selectedGroupId === group.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedGroupId(selectedGroupId === group.id ? null : group.id)}
                  className={selectedGroupId === group.id ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                >
                  {group.id.replace('GRI-', '')}
                  {selectedCount > 0 && (
                    <Badge variant="secondary" className="ml-2 bg-white text-emerald-700">
                      {selectedCount}/{categoryCount}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        )}

        {/* Categories List */}
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {displayData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No GRI categories found matching your search</p>
              </div>
            ) : (
              displayData.map(({ group, categories }) => {
                const isExpanded = expandedGroups.has(group.id);
                const groupSelectedCount = selectedCategories.filter(code => 
                  categories.some(cat => cat.code === code)
                ).length;

                return (
                  <div key={group.id} className="border rounded-lg overflow-hidden">
                    {/* Group Header */}
                    <button
                      onClick={() => toggleGroupExpansion(group.id)}
                      className="w-full bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 transition-colors px-4 py-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-emerald-600" />
                        )}
                        <span className="font-medium text-emerald-900 text-left text-sm">
                          {group.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {groupSelectedCount > 0 && (
                          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                            {groupSelectedCount} selected
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {categories.length} {categories.length === 1 ? 'category' : 'categories'}
                        </Badge>
                      </div>
                    </button>

                    {/* Group Categories */}
                    {isExpanded && (
                      <div className="p-4 space-y-2 bg-white">
                        {categories.map(category => (
                          <div key={category.code} className="flex items-center space-x-2 py-1">
                            <Checkbox
                              id={`gri-${category.code}`}
                              checked={selectedCategories.includes(category.code)}
                              onCheckedChange={() => handleCategoryToggle(category.code)}
                            />
                            <label
                              htmlFor={`gri-${category.code}`}
                              className="text-sm cursor-pointer flex-1 hover:text-emerald-600 transition-colors"
                            >
                              <span className="font-mono text-emerald-600">{category.code}</span>
                              <span className="text-gray-600"> - {category.label}</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        {/* Selected Count */}
        {selectedCategories.length > 0 && (
          <div className="pt-3 border-t">
            <p className="text-xs text-gray-500">
              Selected: {selectedCategories.length} GRI categor{selectedCategories.length === 1 ? 'y' : 'ies'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { ScrollArea } from '../ui/scroll-area';
import { Search, ChevronDown, ChevronRight, FileText } from 'lucide-react';

// GRI Hierarchical Structure (GRI Group -> GRI Categories -> Activities)
interface GRICategory {
  code: string;
  name: string;
  description: string;
  activityIds: string[];
}

interface GRIGroup {
  code: string;
  name: string;
  description: string;
  scope: '1' | '2' | '3';
  categories: GRICategory[];
}

interface Activity {
  id: string;
  uid: string;
  name: string;
  scope: '1' | '2' | '3';
  formulaName?: string;
  source: 'master' | 'client';
}

interface GRIActivityTemplateSelectorProps {
  griStructure: GRIGroup[];
  availableActivities: Activity[];
  selectedActivities: Set<string>;
  onActivitiesChange: (activities: Set<string>) => void;
}

export function GRIActivityTemplateSelector({
  griStructure,
  availableActivities,
  selectedActivities,
  onActivitiesChange
}: GRIActivityTemplateSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Filter groups based on search and selected group
  const filteredData = useMemo(() => {
    let filtered = griStructure;

    // Filter by selected group if set
    if (selectedGroupId) {
      filtered = filtered.filter(g => g.code === selectedGroupId);
    }

    // Filter by search query
    if (!searchQuery.trim()) {
      return filtered;
    }

    const query = searchQuery.toLowerCase();
    
    return filtered.filter(group => {
      const groupMatches = group.name.toLowerCase().includes(query) ||
                          group.code.toLowerCase().includes(query) ||
                          group.description.toLowerCase().includes(query);
      
      const categoryMatches = group.categories.some(cat =>
        cat.name.toLowerCase().includes(query) ||
        cat.code.toLowerCase().includes(query) ||
        cat.description.toLowerCase().includes(query)
      );

      return groupMatches || categoryMatches;
    });
  }, [griStructure, searchQuery, selectedGroupId]);

  // Auto-expand groups when searching
  useMemo(() => {
    if (searchQuery.trim()) {
      setExpandedGroups(new Set(filteredData.map(item => item.code)));
    }
  }, [searchQuery, filteredData]);

  const toggleGroupExpansion = (groupCode: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupCode)) {
      newExpanded.delete(groupCode);
    } else {
      newExpanded.add(groupCode);
    }
    setExpandedGroups(newExpanded);
  };

  const handleGroupToggle = (groupCode: string) => {
    const group = griStructure.find(g => g.code === groupCode);
    if (!group) return;

    const newSelected = new Set(selectedActivities);
    const allGroupActivityIds = group.categories.flatMap(cat => cat.activityIds);
    
    const allSelected = allGroupActivityIds.every(id => newSelected.has(id));

    if (allSelected) {
      // Unselect all activities in this group
      allGroupActivityIds.forEach(id => newSelected.delete(id));
    } else {
      // Select all activities in this group
      allGroupActivityIds.forEach(id => newSelected.add(id));
    }

    onActivitiesChange(newSelected);
  };

  const handleCategoryToggle = (categoryCode: string) => {
    const category = griStructure
      .flatMap(g => g.categories)
      .find(c => c.code === categoryCode);
    if (!category) return;

    const newSelected = new Set(selectedActivities);
    const allCategorySelected = category.activityIds.every(id => newSelected.has(id));

    if (allCategorySelected) {
      // Unselect all activities in this category
      category.activityIds.forEach(id => newSelected.delete(id));
    } else {
      // Select all activities in this category
      category.activityIds.forEach(id => newSelected.add(id));
    }

    onActivitiesChange(newSelected);
  };

  const handleActivityToggle = (activityId: string) => {
    const newSelected = new Set(selectedActivities);
    if (newSelected.has(activityId)) {
      newSelected.delete(activityId);
    } else {
      newSelected.add(activityId);
    }
    onActivitiesChange(newSelected);
  };

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

        {/* Scope Filter Buttons */}
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
            {griStructure.map(group => {
              const categoryCount = group.categories.length;
              const groupActivityIds = group.categories.flatMap(cat => cat.activityIds);
              const selectedCount = groupActivityIds.filter(id => selectedActivities.has(id)).length;
              
              return (
                <Button
                  key={group.code}
                  variant={selectedGroupId === group.code ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedGroupId(selectedGroupId === group.code ? null : group.code)}
                  className={selectedGroupId === group.code ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                >
                  {group.code.replace('GRI-', '')}
                  {selectedCount > 0 && (
                    <Badge variant="secondary" className="ml-2 bg-white text-emerald-700">
                      {selectedCount}/{groupActivityIds.length}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        )}

        {/* GRI Groups and Categories List */}
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {filteredData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No GRI groups found matching your search</p>
              </div>
            ) : (
              filteredData.map(group => {
                const isExpanded = expandedGroups.has(group.code);
                const groupActivityIds = group.categories.flatMap(cat => cat.activityIds);
                const groupSelectedCount = groupActivityIds.filter(id => selectedActivities.has(id)).length;
                const allGroupSelected = groupActivityIds.length > 0 && groupActivityIds.every(id => selectedActivities.has(id));

                return (
                  <div key={group.code} className="border rounded-lg overflow-hidden">
                    {/* Group Header */}
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50">
                      <div className="flex items-center gap-3 px-4 py-3">
                        <Checkbox
                          checked={allGroupSelected}
                          onCheckedChange={() => handleGroupToggle(group.code)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <button
                          onClick={() => toggleGroupExpansion(group.code)}
                          className="flex-1 flex items-center justify-between text-left hover:opacity-80 transition-opacity"
                        >
                          <div className="flex items-center gap-2">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-emerald-600" />
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-emerald-900 text-sm">
                                  {group.name}
                                </span>
                              </div>
                              <p className="text-xs text-emerald-700 mt-0.5">{group.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {groupSelectedCount > 0 && (
                              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                                {groupSelectedCount} selected
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {group.categories.length} {group.categories.length === 1 ? 'category' : 'categories'}
                            </Badge>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Group Categories */}
                    {isExpanded && (
                      <div className="bg-white">
                        {group.categories.map(category => {
                          const categorySelectedCount = category.activityIds.filter(id => selectedActivities.has(id)).length;
                          const allCategorySelected = category.activityIds.length > 0 && category.activityIds.every(id => selectedActivities.has(id));

                          return (
                            <div key={category.code} className="border-t">
                              {/* Category with Activities */}
                              <div className="p-4 space-y-3">
                                {/* Category Header */}
                                <div className="flex items-start gap-3">
                                  <Checkbox
                                    checked={allCategorySelected}
                                    onCheckedChange={() => handleCategoryToggle(category.code)}
                                    className="mt-0.5"
                                  />
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <span className="font-mono text-emerald-600 text-sm">{category.code}</span>
                                        <span className="text-gray-600 text-sm"> - {category.name}</span>
                                      </div>
                                      {categorySelectedCount > 0 && (
                                        <Badge variant="secondary" className="text-xs bg-emerald-50 text-emerald-700">
                                          {categorySelectedCount}/{category.activityIds.length} selected
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">{category.description}</p>
                                  </div>
                                </div>

                                {/* Activities under Category */}
                                <div className="pl-6 space-y-2 border-l-2 border-emerald-100 ml-2">
                                  {category.activityIds.map(activityId => {
                                    const activity = availableActivities.find(a => a.id === activityId);
                                    if (!activity) return null;

                                    return (
                                      <div
                                        key={activity.id}
                                        className={`flex items-start gap-3 p-2 rounded-lg transition-colors ${
                                          selectedActivities.has(activity.id)
                                            ? 'bg-emerald-50'
                                            : 'hover:bg-gray-50'
                                        }`}
                                      >
                                        <Checkbox
                                          checked={selectedActivities.has(activity.id)}
                                          onCheckedChange={() => handleActivityToggle(activity.id)}
                                          className="mt-0.5"
                                        />
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm">{activity.name}</span>
                                            <Badge 
                                              variant="outline" 
                                              className={`text-xs ${
                                                activity.source === 'master' 
                                                  ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                                  : 'bg-purple-50 text-purple-700 border-purple-200'
                                              }`}
                                            >
                                              {activity.source === 'master' ? 'Master DB' : 'Client'}
                                            </Badge>
                                          </div>
                                          <div className="text-xs text-gray-600 space-y-0.5">
                                            <div>UID: {activity.uid}</div>
                                            {activity.formulaName && <div>Formula: {activity.formulaName}</div>}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        {/* Selected Count */}
        {selectedActivities.size > 0 && (
          <div className="pt-3 border-t">
            <p className="text-sm text-emerald-800">
              <strong>{selectedActivities.size}</strong> {selectedActivities.size === 1 ? 'activity' : 'activities'} selected
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
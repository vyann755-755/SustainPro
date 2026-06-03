import React, { useState, useMemo } from 'react';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { isoStructure } from './isoStructureData';

/**
 * ISOCategorySelector — ISO 14064-1 counterpart of GRICategorySelector.
 * Same prop contract (selectedCategories: string[] of ISO sub-category codes
 * like "1.1", onChange) so it drops straight into the Activity create form.
 */

interface ISOCategorySelectorProps {
  selectedCategories: string[];
  onChange: (categories: string[]) => void;
}

// Flatten isoStructure into {code,label,group} rows + group headers.
const isoGroups = isoStructure.map((g) => ({ id: g.number, name: g.name }));
const isoCategories = isoStructure.flatMap((g) =>
  g.rows.map((r) => ({ code: r.code, label: r.name, group: g.number }))
);

export function ISOCategorySelector({ selectedCategories, onChange }: ISOCategorySelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) {
      return isoGroups.map((group) => ({
        group,
        categories: isoCategories.filter((cat) => cat.group === group.id),
      }));
    }
    const query = searchQuery.toLowerCase();
    const matchingGroups = isoGroups.filter(
      (group) => group.name.toLowerCase().includes(query) || group.id.toLowerCase().includes(query)
    );
    const matchingCategories = isoCategories.filter(
      (cat) => cat.code.toLowerCase().includes(query) || cat.label.toLowerCase().includes(query)
    );
    const result: Array<{ group: typeof isoGroups[0]; categories: typeof isoCategories }> = [];
    isoGroups.forEach((group) => {
      const groupMatches = matchingGroups.some((g) => g.id === group.id);
      const groupCategories = matchingCategories.filter((cat) => cat.group === group.id);
      if (groupMatches || groupCategories.length > 0) {
        result.push({
          group,
          categories: groupMatches
            ? isoCategories.filter((cat) => cat.group === group.id)
            : groupCategories,
        });
      }
    });
    return result;
  }, [searchQuery]);

  const displayData = useMemo(() => {
    if (!selectedGroupId) return filteredData;
    return filteredData.filter((item) => item.group.id === selectedGroupId);
  }, [filteredData, selectedGroupId]);

  const handleCategoryToggle = (categoryCode: string) => {
    if (selectedCategories.includes(categoryCode)) {
      onChange(selectedCategories.filter((c) => c !== categoryCode));
    } else {
      onChange([...selectedCategories, categoryCode]);
    }
  };

  const toggleGroupExpansion = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) newExpanded.delete(groupId);
    else newExpanded.add(groupId);
    setExpandedGroups(newExpanded);
  };

  useMemo(() => {
    if (searchQuery.trim()) {
      setExpandedGroups(new Set(filteredData.map((item) => item.group.id)));
    }
  }, [searchQuery, filteredData]);

  return (
    <Card>
      <CardContent className="pt-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search ISO 14064-1 categories…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Group filter buttons */}
        {!searchQuery && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedGroupId === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedGroupId(null)}
              className={selectedGroupId === null ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
            >
              All Categories
            </Button>
            {isoGroups.map((group) => {
              const categoryCount = isoCategories.filter((cat) => cat.group === group.id).length;
              const selectedCount = selectedCategories.filter(
                (code) => isoCategories.find((cat) => cat.code === code)?.group === group.id
              ).length;
              return (
                <Button
                  key={group.id}
                  variant={selectedGroupId === group.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedGroupId(selectedGroupId === group.id ? null : group.id)}
                  className={selectedGroupId === group.id ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                >
                  Cat {group.id}
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

        {/* Categories list */}
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {displayData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No ISO categories found matching your search</p>
              </div>
            ) : (
              displayData.map(({ group, categories }) => {
                const isExpanded = expandedGroups.has(group.id);
                const groupSelectedCount = selectedCategories.filter((code) =>
                  categories.some((cat) => cat.code === code)
                ).length;
                return (
                  <div key={group.id} className="border rounded-lg overflow-hidden">
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
                          {categories.length} {categories.length === 1 ? 'sub-category' : 'sub-categories'}
                        </Badge>
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="p-4 space-y-2 bg-white">
                        {categories.map((category) => (
                          <div key={category.code} className="flex items-center space-x-2 py-1">
                            <Checkbox
                              id={`iso-${category.code}`}
                              checked={selectedCategories.includes(category.code)}
                              onCheckedChange={() => handleCategoryToggle(category.code)}
                            />
                            <label
                              htmlFor={`iso-${category.code}`}
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

        {selectedCategories.length > 0 && (
          <div className="pt-3 border-t">
            <p className="text-xs text-gray-500">
              Selected: {selectedCategories.length} ISO sub-categor{selectedCategories.length === 1 ? 'y' : 'ies'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { MessageSquare, Send, Clock, User as UserIcon } from 'lucide-react';
import { Badge } from '../ui/badge';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface Remark {
  id: string;
  comment: string;
  commentedBy: string;
  role: 'sa' | 'customer';
  timestamp: string;
}

interface DataPoint {
  parameterId: string;
  parameterName: string;
  value: string;
  unit: string;
  parameterType?: string;
  remarks?: Remark[];
}

interface CalculatedActivityData {
  activityUID: string;
  activityName: string;
  inputParameters: DataPoint[];
}

interface UploadedDataTableWithRemarksProps {
  calculatedData: CalculatedActivityData[];
  bcaProjectId: string;
  businessUnitId: string;
  onDataUpdate: () => void;
}

export function UploadedDataTableWithRemarks({
  calculatedData,
  bcaProjectId,
  businessUnitId,
  onDataUpdate
}: UploadedDataTableWithRemarksProps) {
  const [selectedParam, setSelectedParam] = useState<{
    activityUID: string;
    param: DataPoint;
  } | null>(null);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleOpenComments = (activityUID: string, param: DataPoint) => {
    setSelectedParam({ activityUID, param });
    setCommentText('');
  };

  const handleCloseDialog = () => {
    setSelectedParam(null);
    setCommentText('');
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !selectedParam) {
      toast.error('Please enter a comment');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4f35b1fc/activity-data/comment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            projectId: bcaProjectId,
            businessUnitId: businessUnitId,
            activityUID: selectedParam.activityUID,
            parameterId: selectedParam.param.parameterId,
            comment: commentText,
            commentedBy: 'John Smith', // In real system, get from auth (Customer User name)
            role: 'customer',
            timestamp: new Date().toISOString()
          })
        }
      );

      if (response.ok) {
        toast.success('Comment added successfully!');
        setCommentText('');
        handleCloseDialog();
        // Refresh data to show the new comment
        onDataUpdate();
      } else {
        const error = await response.json();
        console.error('Failed to add comment:', error);
        console.error('Response status:', response.status);
        console.error('Request URL:', `https://${projectId}.supabase.co/functions/v1/make-server-4f35b1fc/activity-data/comment`);
        toast.error('Failed to add comment', {
          description: 'Please ensure the backend server is running.'
        });
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      console.error('Request URL:', `https://${projectId}.supabase.co/functions/v1/make-server-4f35b1fc/activity-data/comment`);
      console.error('Request details:', {
        projectId,
        bcaProjectId,
        businessUnitId,
        activityUID: selectedParam?.activityUID
      });
      toast.error('Failed to add comment', {
        description: 'Unable to connect to server. Please ensure the backend is running.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-emerald-50">
              <TableHead className="font-semibold">Activity UID</TableHead>
              <TableHead className="font-semibold">Activity Name</TableHead>
              <TableHead className="font-semibold">Parameter Name</TableHead>
              <TableHead className="font-semibold">Unit</TableHead>
              <TableHead className="font-semibold text-right">Input Value</TableHead>
              <TableHead className="font-semibold min-w-[200px]">Remarks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(() => {
              let globalRowIndex = 0;
              return calculatedData.map((activity, activityIndex) => {
                // Filter out EF parameters, only show variables
                const variableParams = activity.inputParameters.filter(param => 
                  param.parameterType === 'variable'
                );
                
                return variableParams.length > 0 ? (
                  <React.Fragment key={activityIndex}>
                    {variableParams.map((param, paramIndex) => {
                      const currentRowIndex = globalRowIndex++;
                      const isEvenRow = currentRowIndex % 2 === 0;
                      const remarks = param.remarks || [];
                      const hasRemarks = remarks.length > 0;
                      
                      return (
                        <TableRow 
                          key={`${activityIndex}-${paramIndex}`} 
                          className={isEvenRow ? 'bg-emerald-50/30 hover:bg-emerald-50/50' : 'bg-white hover:bg-gray-50'}
                        >
                          <TableCell className="font-mono text-xs text-gray-600">
                            {paramIndex === 0 ? activity.activityUID : ''}
                          </TableCell>
                          <TableCell className="text-gray-900">
                            {paramIndex === 0 ? activity.activityName : ''}
                          </TableCell>
                          <TableCell className="font-medium text-gray-900">
                            {param.parameterName}
                          </TableCell>
                          <TableCell className="text-gray-600 text-sm">
                            {param.unit}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-gray-900">
                            {param.value}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenComments(activity.activityUID, param)}
                                className="text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                              >
                                <MessageSquare className="h-4 w-4 mr-1" />
                                {hasRemarks ? `View ${remarks.length}` : 'Add Comment'}
                              </Button>
                              {hasRemarks && (
                                <Badge variant="secondary" className="bg-teal-100 text-teal-700 text-xs">
                                  {remarks.length}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </React.Fragment>
                ) : null;
              });
            })()}
          </TableBody>
        </Table>
      </div>

      {/* Comments Dialog */}
      <Dialog open={selectedParam !== null} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Remarks - {selectedParam?.param.parameterName}</DialogTitle>
            <DialogDescription>
              View and respond to comments from Sustainability Architect
            </DialogDescription>
          </DialogHeader>

          {/* Existing Comments */}
          <div className="flex-1 overflow-y-auto space-y-3 my-4">
            {selectedParam?.param.remarks && selectedParam.param.remarks.length > 0 ? (
              selectedParam.param.remarks.map((remark) => (
                <div 
                  key={remark.id} 
                  className={`p-3 rounded-lg border ${
                    remark.role === 'sa' 
                      ? 'bg-blue-50 border-blue-200 ml-0 mr-8' 
                      : 'bg-teal-50 border-teal-200 ml-8 mr-0'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <UserIcon className="h-4 w-4 text-gray-600" />
                    <span className="font-semibold text-sm text-gray-900">
                      {remark.commentedBy}
                    </span>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${
                        remark.role === 'sa' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-teal-100 text-teal-700'
                      }`}
                    >
                      {remark.role === 'sa' ? 'SA' : 'You'}
                    </Badge>
                    <div className="flex items-center gap-1 ml-auto text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      {new Date(remark.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {remark.comment}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No comments yet from Sustainability Architect</p>
              </div>
            )}
          </div>

          {/* Add Comment Form */}
          <div className="border-t pt-4 space-y-3">
            <Textarea
              placeholder="Type your response here..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>
                Close
              </Button>
              <Button 
                onClick={handleSubmitComment}
                disabled={submitting || !commentText.trim()}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Add Response
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

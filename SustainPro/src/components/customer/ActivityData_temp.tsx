                    <TableBody>
                      {(() => {
                        let globalRowIndex = 0;
                        return latestSubmission.calculatedData.map((activity, activityIndex) => {
                          // Filter out EF parameters, only show variables
                          const variableParams = activity.inputParameters.filter(param => 
                            param.parameterType === 'variable'
                          );
                          
                          return variableParams.length > 0 ? (
                            <React.Fragment key={activityIndex}>
                              {variableParams.map((param, paramIndex) => {
                                const currentRowIndex = globalRowIndex++;
                                const isEvenRow = currentRowIndex % 2 === 0;
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
                                  </TableRow>
                                );
                              })}
                            </React.Fragment>
                          ) : null;
                        });
                      })()}
                    </TableBody>

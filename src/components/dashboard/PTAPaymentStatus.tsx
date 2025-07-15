import React from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface PTAPaymentStatusProps {
  totalStudents: number;
  ptaPaidStudents: number;
  ptaUnpaidStudents: number;
}

export function PTAPaymentStatus({ 
  totalStudents, 
  ptaPaidStudents, 
  ptaUnpaidStudents 
}: PTAPaymentStatusProps) {
  const paidPercentage = totalStudents > 0 ? (ptaPaidStudents / totalStudents) * 100 : 0;
  const unpaidPercentage = totalStudents > 0 ? (ptaUnpaidStudents / totalStudents) * 100 : 0;

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          PTA Contribution Status
        </h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-8 w-8 text-success-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Paid Students</p>
              <p className="text-2xl font-semibold text-gray-900">{ptaPaidStudents}</p>
              <p className="text-sm text-success-600">
                {paidPercentage.toFixed(1)}% completion
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <XCircleIcon className="h-8 w-8 text-danger-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Unpaid Students</p>
              <p className="text-2xl font-semibold text-gray-900">{ptaUnpaidStudents}</p>
              <p className="text-sm text-danger-600">
                {unpaidPercentage.toFixed(1)}% remaining
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="bg-gray-200 rounded-full h-2">
            <div
              className="bg-success-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${paidPercentage}%`,
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
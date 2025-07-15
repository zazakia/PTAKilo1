import React from 'react';
import { 
  CurrencyDollarIcon,
  BanknotesIcon,
  AcademicCapIcon,
  UsersIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

interface QuickActionsProps {
  userRole: string;
  onRecordIncome?: () => void;
  onRecordExpense?: () => void;
  onAddParent?: () => void;
  onAddStudent?: () => void;
  onViewReports?: () => void;
  onViewStudents?: () => void;
}

export function QuickActions({ 
  userRole,
  onRecordIncome,
  onRecordExpense,
  onAddParent,
  onAddStudent,
  onViewReports,
  onViewStudents,
}: QuickActionsProps) {
  const getActionsForRole = () => {
    if (userRole === 'admin' || userRole === 'treasurer') {
      return [
        {
          label: 'Record Income',
          icon: CurrencyDollarIcon,
          onClick: onRecordIncome,
          className: 'btn-primary',
        },
        {
          label: 'Record Expense',
          icon: BanknotesIcon,
          onClick: onRecordExpense,
          className: 'btn-secondary',
        },
        {
          label: 'Add Parent',
          icon: UsersIcon,
          onClick: onAddParent,
          className: 'btn-outline',
        },
        {
          label: 'Add Student',
          icon: AcademicCapIcon,
          onClick: onAddStudent,
          className: 'btn-outline',
        },
      ];
    } else {
      return [
        {
          label: 'View Reports',
          icon: ChartBarIcon,
          onClick: onViewReports,
          className: 'btn-outline',
        },
        {
          label: 'View Students',
          icon: AcademicCapIcon,
          onClick: onViewStudents,
          className: 'btn-outline',
        },
      ];
    }
  };

  const actions = getActionsForRole();

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={action.onClick}
                className={action.className}
                disabled={!action.onClick}
              >
                <Icon className="h-5 w-5 mr-2" />
                {action.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { 
  CurrencyDollarIcon,
  BanknotesIcon,
  AcademicCapIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';

interface StatItem {
  name: string;
  value: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
  bgColor: string;
  change: string;
  changeType: 'positive' | 'negative';
}

interface DashboardStatsProps {
  totalIncome: number;
  totalExpenses: number;
  totalStudents: number;
  totalParents: number;
  userRole: string;
}

export function DashboardStats({ 
  totalIncome, 
  totalExpenses, 
  totalStudents, 
  totalParents, 
  userRole 
}: DashboardStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  const getRoleSpecificStats = (): StatItem[] => {
    const baseStats: StatItem[] = [
      {
        name: 'Total Income',
        value: formatCurrency(totalIncome),
        icon: CurrencyDollarIcon,
        color: 'text-success-600',
        bgColor: 'bg-success-100',
        change: '+12%',
        changeType: 'positive',
      },
      {
        name: 'Total Expenses',
        value: formatCurrency(totalExpenses),
        icon: BanknotesIcon,
        color: 'text-danger-600',
        bgColor: 'bg-danger-100',
        change: '+8%',
        changeType: 'negative',
      },
      {
        name: 'Total Students',
        value: totalStudents.toString(),
        icon: AcademicCapIcon,
        color: 'text-primary-600',
        bgColor: 'bg-primary-100',
        change: '+2%',
        changeType: 'positive',
      },
      {
        name: 'Total Parents',
        value: totalParents.toString(),
        icon: UsersIcon,
        color: 'text-warning-600',
        bgColor: 'bg-warning-100',
        change: '+1%',
        changeType: 'positive',
      },
    ];

    // Filter stats based on role
    if (userRole === 'parent') {
      return baseStats.filter(stat => stat.name === 'Total Students');
    }
    if (userRole === 'teacher') {
      return baseStats.filter(stat => ['Total Students', 'Total Parents'].includes(stat.name));
    }
    return baseStats;
  };

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {getRoleSpecificStats().map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-2 rounded-md ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'positive' ? 'text-success-600' : 'text-danger-600'
                      }`}>
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
import React from 'react';
import { 
  CurrencyDollarIcon, 
  BanknotesIcon, 
  ClockIcon 
} from '@heroicons/react/24/outline';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending';
}

interface RecentTransactionsProps {
  transactions: Transaction[];
  onViewAll?: () => void;
}

export function RecentTransactions({ transactions, onViewAll }: RecentTransactionsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Recent Transactions
          </h3>
          {onViewAll && (
            <button 
              onClick={onViewAll}
              className="text-sm text-primary-600 hover:text-primary-500 font-medium"
            >
              View all
            </button>
          )}
        </div>
        
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No recent transactions</p>
          </div>
        ) : (
          <div className="flow-root">
            <ul className="-mb-8">
              {transactions.map((transaction, index) => (
                <li key={transaction.id}>
                  <div className="relative pb-8">
                    {index !== transactions.length - 1 && (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    )}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                          transaction.type === 'income' ? 'bg-success-500' : 'bg-danger-500'
                        }`}>
                          {transaction.type === 'income' ? (
                            <CurrencyDollarIcon className="h-4 w-4 text-white" />
                          ) : (
                            <BanknotesIcon className="h-4 w-4 text-white" />
                          )}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            {transaction.description}
                          </p>
                          <p className="text-lg font-semibold text-gray-900">
                            {formatCurrency(transaction.amount)}
                          </p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          <div className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            {new Date(transaction.date).toLocaleDateString()}
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                            transaction.status === 'completed'
                              ? 'bg-success-100 text-success-800'
                              : 'bg-warning-100 text-warning-800'
                          }`}>
                            {transaction.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
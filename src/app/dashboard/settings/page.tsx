'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Simulate saving settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Settings saved successfully!');
    } catch (error) {
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-600">
          Manage your PTA system settings and preferences.
        </p>
      </div>

      <div className="space-y-6">
        {/* School Information */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">School Information</h2>
          <p className="text-gray-600 mb-4">Update your school's basic information</p>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="school-name" className="block text-sm font-medium mb-1">
                  School Name
                </label>
                <input
                  id="school-name"
                  type="text"
                  defaultValue="Vel Elementary School"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Enter school name"
                />
              </div>
              <div>
                <label htmlFor="school-id" className="block text-sm font-medium mb-1">
                  School ID
                </label>
                <input
                  id="school-id"
                  type="text"
                  defaultValue="VEL-001"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Enter school ID"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="school-address" className="block text-sm font-medium mb-1">
                Address
              </label>
              <input
                id="school-address"
                type="text"
                defaultValue="123 Education Street, Learning City"
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter school address"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contact-number" className="block text-sm font-medium mb-1">
                  Contact Number
                </label>
                <input
                  id="contact-number"
                  type="text"
                  defaultValue="+63 123 456 7890"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Enter contact number"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  defaultValue="admin@vel.edu.ph"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Enter email address"
                />
              </div>
            </div>
          </div>
        </div>

        {/* PTA Settings */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">PTA Settings</h2>
          <p className="text-gray-600 mb-4">Configure PTA contribution and membership settings</p>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="pta-contribution" className="block text-sm font-medium mb-1">
                  PTA Contribution Amount
                </label>
                <input
                  id="pta-contribution"
                  type="number"
                  defaultValue="250"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Enter amount"
                />
              </div>
              <div>
                <label htmlFor="school-year" className="block text-sm font-medium mb-1">
                  School Year
                </label>
                <input
                  id="school-year"
                  type="text"
                  defaultValue="2024-2025"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Enter school year"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  id="auto-reminder"
                  type="checkbox"
                  defaultChecked
                  className="rounded"
                />
                <label htmlFor="auto-reminder" className="text-sm">
                  Send automatic payment reminders
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  id="late-fee"
                  type="checkbox"
                  className="rounded"
                />
                <label htmlFor="late-fee" className="text-sm">
                  Apply late payment fees
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">System Settings</h2>
          <p className="text-gray-600 mb-4">Configure system behavior and notifications</p>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  id="email-notifications"
                  type="checkbox"
                  defaultChecked
                  className="rounded"
                />
                <label htmlFor="email-notifications" className="text-sm">
                  Enable email notifications
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  id="sms-notifications"
                  type="checkbox"
                  className="rounded"
                />
                <label htmlFor="sms-notifications" className="text-sm">
                  Enable SMS notifications
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  id="backup-enabled"
                  type="checkbox"
                  defaultChecked
                  className="rounded"
                />
                <label htmlFor="backup-enabled" className="text-sm">
                  Enable automatic backups
                </label>
              </div>
            </div>
            
            <hr className="my-4" />
            
            <div>
              <label htmlFor="backup-frequency" className="block text-sm font-medium mb-1">
                Backup Frequency
              </label>
              <select
                id="backup-frequency"
                className="w-full p-2 border border-gray-300 rounded-md"
                defaultValue="daily"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSaveSettings}
            disabled={isLoading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
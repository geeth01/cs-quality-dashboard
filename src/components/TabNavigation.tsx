import { TestTube, TestTube2 } from 'lucide-react';

interface TabNavigationProps {
  activeTab: 'unit' | 'e2e';
  onTabChange: (tab: 'unit' | 'e2e') => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="bg-white rounded-lg shadow mb-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex" aria-label="Tabs">
          <button
            onClick={() => onTabChange('unit')}
            className={`
              flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors
              ${activeTab === 'unit'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <TestTube className="w-5 h-5" />
            Unit Tests
          </button>
          
          <button
            onClick={() => onTabChange('e2e')}
            className={`
              flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors
              ${activeTab === 'e2e'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <TestTube2 className="w-5 h-5" />
            E2E Tests
          </button>
        </nav>
      </div>
    </div>
  );
}


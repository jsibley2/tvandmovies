import { ShowDataGrid } from '@/components/ShowDataGrid'
import { useShowData } from '@/hooks/useShowData'
import { Plus, Trash } from 'lucide-react'

function App() {
  const showData = useShowData()
  const { addShow, clearAll, shows } = showData

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            TV Show Tracker
          </h1>
          <p className="text-gray-600">
            Track your favorite TV shows, their streaming services, and air dates
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={addShow}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            <Plus className="h-5 w-5" />
            Add Show
          </button>
          {shows.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Are you sure you want to clear all shows?')) {
                  clearAll()
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm"
            >
              <Trash className="h-5 w-5" />
              Clear All
            </button>
          )}
        </div>

        {/* Info Box */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>How to use:</strong> Click "Add Show" to create a new row, then type a TV show title in the first column.
            The app will automatically fetch streaming services, season information, and air dates from WatchMode.
          </p>
        </div>

        {/* DataGrid */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: 600 }}>
          {shows.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <p className="text-lg mb-2">No shows added yet</p>
                <p className="text-sm">Click "Add Show" to get started</p>
              </div>
            </div>
          ) : (
            <ShowDataGrid showData={showData} />
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Powered by{' '}
            <a
              href="https://api.watchmode.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              WatchMode API
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default App

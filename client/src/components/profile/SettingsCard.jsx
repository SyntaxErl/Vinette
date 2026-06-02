// Shared white-card wrapper for each settings section (icon + title/subtitle
// header, optional right slot). Keeps every section visually consistent.
export default function SettingsCard({ icon, title, subtitle, right, children }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden transition-colors">
      <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3 min-w-0">
          {icon && (
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-purple-50 dark:bg-purple-500/15">
              <span className="material-icons text-purple-600 dark:text-purple-300" style={{ fontSize: '20px' }}>{icon}</span>
            </div>
          )}
          <div className="min-w-0">
            <h2 className="font-bold text-gray-900 dark:text-gray-100">{title}</h2>
            {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {right && <div className="flex-shrink-0">{right}</div>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

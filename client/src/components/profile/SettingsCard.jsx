// Shared white-card wrapper for each settings section (icon + title/subtitle
// header, optional right slot). Keeps every section visually consistent.
export default function SettingsCard({ icon, title, subtitle, right, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3 min-w-0">
          {icon && (
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-purple-50">
              <span className="material-icons text-purple-600" style={{ fontSize: '20px' }}>{icon}</span>
            </div>
          )}
          <div className="min-w-0">
            <h2 className="font-bold text-gray-900">{title}</h2>
            {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {right && <div className="flex-shrink-0">{right}</div>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

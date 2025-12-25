import { useSettings } from '../lib/contexts/settings';

export const SettingsPanel = ({
  show,
  onClose: _onClose,
}: { show: boolean; onClose?: () => void }): React.ReactElement => {
  const { settings, updateSetting, updateTheme } = useSettings();

  return (
    <div
      className="settings-panel"
      style={{
        opacity: show ? 1 : 0,
        pointerEvents: show ? 'auto' : 'none',
        animation: show
          ? 'slideIn 0.3s ease-in-out'
          : 'slideOut 0.3s ease-in-out',
      }}
    >
      {/* Layout */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
        <button
          className={`settings-layout-button ${settings.layout === 'TB' ? 'active' : ''}`}
          onClick={() => updateSetting('layout', 'TB')}
        >
          Vertical
        </button>
        <button
          className={`settings-layout-button ${settings.layout === 'LR' ? 'active' : ''}`}
          onClick={() => updateSetting('layout', 'LR')}
        >
          Horizontal
        </button>
      </div>

      <div className="settings-separator" />

      {/* Display Options */}
      <div
        className="settings-row"
        onClick={() =>
          updateSetting('showFieldTypes', !settings.showFieldTypes)
        }
      >
        <span className="settings-label">Field Types</span>
        <div className="settings-control">
          <div
            className={`settings-toggle ${settings.showFieldTypes ? 'active' : ''}`}
          >
            <div
              className={`settings-toggle-knob ${settings.showFieldTypes ? 'active' : ''}`}
            />
          </div>
        </div>
      </div>

      <div
        className="settings-row"
        onClick={() =>
          updateSetting('showFieldIcons', !settings.showFieldIcons)
        }
      >
        <span className="settings-label">Field Icons</span>
        <div className="settings-control">
          <div
            className={`settings-toggle ${settings.showFieldIcons ? 'active' : ''}`}
          >
            <div
              className={`settings-toggle-knob ${settings.showFieldIcons ? 'active' : ''}`}
            />
          </div>
        </div>
      </div>

      <div className="settings-separator" />

      {/* Theme Colors */}
      <div className="settings-row" onClick={(e) => {
          const input = e.currentTarget.querySelector('input') as HTMLInputElement;
          input?.click();
        }}>
        <span className="settings-label">Primary</span>
        <div className="settings-control">
          <div
            className="settings-color-button"
            style={{
              backgroundColor: settings.theme.primaryColor,
            }}
          >
            <input
              className="settings-color-input"
              type="color"
              value={settings.theme.primaryColor}
              onChange={(e) => updateTheme({ primaryColor: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="settings-row" onClick={(e) => {
          const input = e.currentTarget.querySelector('input') as HTMLInputElement;
          input?.click();
        }}>
        <span className="settings-label">Enums</span>
        <div className="settings-control">
          <div
            className="settings-color-button"
            style={{
              backgroundColor: settings.theme.enumColor,
            }}
          >
            <input
              className="settings-color-input"
              type="color"
              value={settings.theme.enumColor}
              onChange={(e) => updateTheme({ enumColor: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="settings-row" onClick={(e) => {
          const input = e.currentTarget.querySelector('input') as HTMLInputElement;
          input?.click();
        }}>
        <span className="settings-label">Titles</span>
        <div className="settings-control">
          <div
            className="settings-color-button"
            style={{
              backgroundColor: settings.theme.titleColor,
            }}
          >
            <input
              className="settings-color-input"
              type="color"
              value={settings.theme.titleColor}
              onChange={(e) => updateTheme({ titleColor: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

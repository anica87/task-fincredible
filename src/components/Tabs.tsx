import React, { ReactNode } from 'react';

export interface TabDefinition<TKey extends string> {
  key: TKey;
  label: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

export interface TabsProps<TKey extends string> {
  tabs: TabDefinition<TKey>[];
  activeTab: TKey;
  onChange: (key: TKey) => void;
  className?: string;
}

/**
 * Generic tab strip + panel. TKey is constrained to `string` so it works
 * with plain string unions as well as string enums (e.g. BankAccountTab).
 * Renders only the active tab's content (not all panels stacked).
 */
export function Tabs<TKey extends string>({
  tabs,
  activeTab,
  onChange,
  className,
}: TabsProps<TKey>): React.ReactElement {
  const activeTabDefinition = tabs.find((tab) => tab.key === activeTab);

  return (
    <div className={['tabs', className].filter(Boolean).join(' ')}>
      <div className="tabs__list" role="tablist">
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              id={`tab-${tab.key}`}
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.key}`}
              disabled={tab.disabled}
              className={['tabs__tab', isActive ? 'tabs__tab--active' : ''].join(' ')}
              onClick={() => !tab.disabled && onChange(tab.key)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {activeTabDefinition ? (
        <div
          className="tabs__panel"
          role="tabpanel"
          id={`tabpanel-${activeTabDefinition.key}`}
          aria-labelledby={`tab-${activeTabDefinition.key}`}
        >
          {activeTabDefinition.content}
        </div>
      ) : null}
    </div>
  );
}

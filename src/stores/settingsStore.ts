import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type DefaultDeadlineRule = 'none' | 'tomorrow_9am' | 'end_of_day' | 'plus_7_days'

interface SettingsState {
    defaultDeadlineRule: DefaultDeadlineRule
    isSettingsOpen: boolean
    setDefaultDeadlineRule: (rule: DefaultDeadlineRule) => void
    setIsSettingsOpen: (isOpen: boolean) => void
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            defaultDeadlineRule: 'plus_7_days',
            isSettingsOpen: false,
            setDefaultDeadlineRule: (rule) => set({ defaultDeadlineRule: rule }),
            setIsSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen }),
        }),
        {
            name: 'pense-bete-settings',
        }
    )
)

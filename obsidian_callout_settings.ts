import { App, PluginSettingTab, Setting, Component } from 'obsidian';
import { MyPlugin } from './main'; // Your main plugin class

interface CalloutSettings {
    icon: string;
    type: string;
    metadata: string;
    foldable: boolean;
    title: string;
}

export class CalloutSettingsTab extends PluginSettingTab {
    plugin: MyPlugin;
    private previewEl: HTMLElement;
    private calloutSettings: CalloutSettings;

    constructor(app: App, plugin: MyPlugin) {
        super(app, plugin);
        this.plugin = plugin;
        
        // Default callout settings
        this.calloutSettings = {
            icon: '📝',
            type: 'note',
            metadata: '',
            foldable: true,
            title: 'Example Callout'
        };
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        // Main header with preview
        const headerEl = containerEl.createEl('div', { cls: 'callout-settings-header' });
        headerEl.createEl('h2', { text: 'Callout Configuration' });
        
        // Create preview container
        const previewContainer = headerEl.createEl('div', { cls: 'callout-preview-container' });
        previewContainer.createEl('h3', { text: 'Preview:' });
        this.previewEl = previewContainer.createEl('div', { cls: 'callout-preview' });
        
        // Initialize preview
        this.updatePreview();

        // Settings section
        const settingsContainer = containerEl.createEl('div', { cls: 'callout-settings-controls' });

        // Callout Type Setting
        new Setting(settingsContainer)
            .setName('Callout Type')
            .setDesc('The type of callout (e.g., note, tip, warning, etc.)')
            .addText(text => text
                .setPlaceholder('note')
                .setValue(this.calloutSettings.type)
                .onChange(async (value) => {
                    this.calloutSettings.type = value || 'note';
                    this.updatePreview();
                    await this.saveSettings();
                }));

        // Callout Icon Setting
        new Setting(settingsContainer)
            .setName('Callout Icon')
            .setDesc('Icon or emoji to display in the callout')
            .addText(text => text
                .setPlaceholder('📝')
                .setValue(this.calloutSettings.icon)
                .onChange(async (value) => {
                    this.calloutSettings.icon = value || '📝';
                    this.updatePreview();
                    await this.saveSettings();
                }));

        // Callout Title Setting
        new Setting(settingsContainer)
            .setName('Callout Title')
            .setDesc('Default title for the callout')
            .addText(text => text
                .setPlaceholder('Example Callout')
                .setValue(this.calloutSettings.title)
                .onChange(async (value) => {
                    this.calloutSettings.title = value || 'Example Callout';
                    this.updatePreview();
                    await this.saveSettings();
                }));

        // Callout Metadata Setting
        new Setting(settingsContainer)
            .setName('Callout Metadata')
            .setDesc('Additional metadata or parameters for the callout')
            .addTextArea(text => text
                .setPlaceholder('collapse: true\ncolor: blue')
                .setValue(this.calloutSettings.metadata)
                .onChange(async (value) => {
                    this.calloutSettings.metadata = value;
                    this.updatePreview();
                    await this.saveSettings();
                }));

        // Foldable Setting
        new Setting(settingsContainer)
            .setName('Foldable')
            .setDesc('Whether the callout can be collapsed/expanded')
            .addToggle(toggle => toggle
                .setValue(this.calloutSettings.foldable)
                .onChange(async (value) => {
                    this.calloutSettings.foldable = value;
                    this.updatePreview();
                    await this.saveSettings();
                }));

        // Add some custom CSS
        this.addCustomStyles();
    }

    private updatePreview(): void {
        if (!this.previewEl) return;

        // Clear existing preview
        this.previewEl.empty();

        // Create callout structure similar to Obsidian's format
        const calloutEl = this.previewEl.createEl('div', { 
            cls: `callout callout-${this.calloutSettings.type}` 
        });

        // Callout title section
        const titleEl = calloutEl.createEl('div', { cls: 'callout-title' });
        
        // Icon
        const iconEl = titleEl.createEl('div', { cls: 'callout-icon' });
        iconEl.setText(this.calloutSettings.icon);

        // Title text
        const titleTextEl = titleEl.createEl('div', { cls: 'callout-title-inner' });
        titleTextEl.setText(this.calloutSettings.title);

        // Fold indicator if foldable
        if (this.calloutSettings.foldable) {
            const foldEl = titleEl.createEl('div', { cls: 'callout-fold' });
            foldEl.innerHTML = '▼'; // Or use an SVG icon
        }

        // Callout content
        const contentEl = calloutEl.createEl('div', { cls: 'callout-content' });
        contentEl.createEl('p', { text: 'This is how your callout will appear.' });
        
        // Show metadata if present
        if (this.calloutSettings.metadata.trim()) {
            const metaEl = contentEl.createEl('div', { cls: 'callout-metadata' });
            metaEl.createEl('small', { text: `Metadata: ${this.calloutSettings.metadata}` });
        }
    }

    private addCustomStyles(): void {
        // Add custom CSS for the settings interface
        const styleEl = document.createElement('style');
        styleEl.textContent = `
            .callout-settings-header {
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 1px solid var(--background-modifier-border);
            }

            .callout-preview-container {
                margin-top: 15px;
            }

            .callout-preview {
                background: var(--background-primary-alt);
                padding: 15px;
                border-radius: 8px;
                margin-top: 10px;
            }

            .callout {
                background: var(--callout-color, var(--color-base-25));
                border: 1px solid var(--callout-border, var(--color-base-30));
                border-radius: 4px;
                padding: 0;
                margin: 10px 0;
                border-left: 4px solid var(--callout-color, var(--color-accent));
            }

            .callout-title {
                display: flex;
                align-items: center;
                padding: 8px 12px;
                background: var(--callout-title-color, var(--color-base-20));
                font-weight: 600;
                gap: 8px;
                cursor: pointer;
            }

            .callout-icon {
                flex-shrink: 0;
                font-size: 16px;
            }

            .callout-title-inner {
                flex-grow: 1;
            }

            .callout-fold {
                flex-shrink: 0;
                font-size: 12px;
                opacity: 0.7;
                transition: transform 0.2s;
            }

            .callout-content {
                padding: 12px;
                border-top: 1px solid var(--callout-border, var(--color-base-30));
            }

            .callout-content p {
                margin: 0 0 8px 0;
            }

            .callout-metadata {
                margin-top: 8px;
                padding-top: 8px;
                border-top: 1px solid var(--color-base-30);
                color: var(--text-muted);
            }

            .callout-settings-controls {
                margin-top: 20px;
            }

            /* Style different callout types */
            .callout-note { --callout-color: var(--color-blue); }
            .callout-tip { --callout-color: var(--color-cyan); }
            .callout-warning { --callout-color: var(--color-orange); }
            .callout-danger { --callout-color: var(--color-red); }
            .callout-success { --callout-color: var(--color-green); }
        `;
        
        document.head.appendChild(styleEl);
    }

    private async saveSettings(): Promise<void> {
        // Save to your plugin's settings
        // You'll need to implement this based on your plugin structure
        await this.plugin.saveSettings({
            ...this.plugin.settings,
            callout: this.calloutSettings
        });
    }

    async loadSettings(): Promise<void> {
        // Load from your plugin's settings
        const savedCallout = this.plugin.settings?.callout;
        if (savedCallout) {
            this.calloutSettings = { ...this.calloutSettings, ...savedCallout };
        }
    }
}

// Usage in your main plugin file:
export default class MyPlugin extends Plugin {
    settings: any;

    async onload() {
        // Add settings tab
        this.addSettingTab(new CalloutSettingsTab(this.app, this));
    }

    async saveSettings(settings: any) {
        this.settings = settings;
        await this.saveData(settings);
    }
}
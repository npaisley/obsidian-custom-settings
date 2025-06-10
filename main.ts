/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	App,
	ButtonComponent,
	DropdownComponent,
	Events,
	getIcon,
	getIconIds,
	MarkdownRenderChild,
	MarkdownRenderer,
	Menu,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	TextComponent,
} from "obsidian";
import {
	BackupConfirmationModal,
	MigrationModal,
} from "./data-migration-to-0.1.0";

// Define an interface for your API
interface SettingsAPI {
	readonly settings: OcsSettings;
	settingsEmitter: SettingsEventEmitter;
}

// Add the API to the global window object
declare global {
	interface Window {
		ocs: SettingsAPI | undefined;
	}
}

// Create a custom event emitter for settings changes
export class SettingsEventEmitter extends Events {
	constructor() {
		super();
	}
}

export default class CustomSettingsPlugin extends Plugin {
	settings: OcsSettings;
	api: SettingsAPI;

	settingsEmitter = new SettingsEventEmitter();

	async onload() {
		await this.loadSettings();

		this.addRibbonIcon("triangle", "Project Delta", (evt: MouseEvent) =>
			this.showRibbonMenu(evt)
		);

		// Initialize the API
		this.api = {
			settings: this.settings,
			settingsEmitter: this.settingsEmitter,
		};

		// Register the API globally
		window.ocs = this.api;

		// Add settings tab
		this.addSettingTab(new SettingsPluginTab(this.app, this));

		console.log(
			`${this.manifest.name} version ${this.manifest.version} loaded\nAPI available as ocs`
		);
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
		await this.emitSettingsChanges();
	}

	async saveSettings() {
		await this.saveData(this.settings);
		this.emitSettingsChanges();
	}

	async emitSettingsChanges() {
		this.settingsEmitter.trigger("ocs-settings-changed", this.settings);
	}

	async updateUserPluginVersion(version: string) {
		this.settings.currentVersion =
			this.settings.currentVersion.concat(version);
		await this.saveData(this.settings);
	}

	async onunload() {
		window.ocs = undefined;
		console.log(
			`${this.manifest.name} version ${this.manifest.version} unloaded`
		);
	}

	showRibbonMenu(evt: MouseEvent) {
		const menu = new Menu();

		// Add menu items
		menu.addItem((item) =>
			item.setTitle("Project Delta Help").setIsLabel(true)
		);
		menu.addSeparator();
		menu.addItem((item) =>
			item
				.setTitle("Project Delta Set-Up")
				.setIcon("play")
				.onClick(() => {
					new ReferenceInformationModal(
						this.app,
						this,
						ReferenceContent.SETUP
					).open();
				})
		);

		menu.addItem((item) =>
			item
				.setTitle("Markdown Guide")
				.setIcon("type")
				.onClick(() => {
					new ReferenceInformationModal(
						this.app,
						this,
						ReferenceContent.MARKDOWN
					).open();
				})
		);
		menu.addItem((item) =>
			item
				.setTitle("Callout Types")
				.setIcon("rectangle-horizontal")
				.onClick(() => {
					new ReferenceInformationModal(
						this.app,
						this,
						ReferenceContent.CALLOUT_TYPES
					).open();
				})
		);
		menu.addItem((item) =>
			item
				.setTitle("Callout Metadata Guide")
				.setIcon("rectangle-ellipsis")
				.onClick(() => {
					new ReferenceInformationModal(
						this.app,
						this,
						ReferenceContent.CALLOUT_METADATA
					).open();
				})
		);

		menu.addSeparator();

		menu.showAtMouseEvent(evt);
	}
}

interface OcsSettings {
	//user version
	currentVersion: string[];
	//static options
	defaultIcon: string;
	defaultFold: string;
	defaultMetadata: string;
	//Active projects and tasks dashboard
	activeProjectsDashBoardParentCalloutType: string;
	activeProjectsDashBoardParentCalloutMetadata: string;
	activeProjectsDashBoardParentCalloutFold: string;
	//general
	mainUser: string;
	showDates: boolean;
	dateFormat: string;
	//statuses
	inProgressStatusIcon: string;
	inProgressCalloutType: string;
	inProgressCalloutMetadata: string;
	inProgressStrings: string[];
	needsSupportStatusIcon: string;
	needsSupportCalloutType: string;
	needsSupportCalloutMetadata: string;
	needsSupportStrings: string[];
	actionRequiredStatusIcon: string;
	actionRequiredCalloutType: string;
	actionRequiredCalloutMetadata: string;
	actionRequiredStrings: string[];
	completeStatusIcon: string;
	completeCalloutType: string;
	completeCalloutMetadata: string;
	completeStrings: string[];
	//roles
	responsibleIcon: string;
	accountableIcon: string;
	contributingIcon: string;
	//team styles
	teamCalloutIcon: string;
	teamCalloutType: string;
	teamCalloutMetadata: string;
	teamCalloutFold: string;
	//goal styles
	goalCalloutIcon: string;
	goalCalloutType: string;
	goalCalloutMetadata: string;
	goalCalloutFold: string;
	//question styles
	questionCalloutIcon: string;
	questionCalloutType: string;
	questionCalloutMetadata: string;
	questionCalloutFold: string;
	//update styles
	updateCalloutIcon: string;
	updateCalloutType: string;
	updateCalloutMetadata: string;
	updateCalloutFold: string;
	//associated tasks styles
	assocTasksCalloutIcon: string;
	assocTasksCalloutType: string;
	assocTasksCalloutMetadata: string;
	assocTasksCalloutFold: string;
	//associated projects styles
	assocProjectsCalloutIcon: string;
	assocProjectsCalloutType: string;
	assocProjectsCalloutMetadata: string;
	assocProjectsCalloutFold: string;
	//in note summaries
	inNoteRolesCalloutType: string;
	inNoteRolesCalloutMetadata: string;
	inNoteSummaryFold: string;
	inNoteYearlyGoalsCalloutFold: string;
	responsibleRoleCalloutType: string;
	responsibleRoleCalloutMetadata: string;
	contributingRoleCalloutType: string;
	contributingRoleCalloutMetadata: string;
	accountableRoleCalloutType: string;
	accountableRoleCalloutMetadata: string;
	inNoteSummaryAssocTasksCalloutFold: string;
	inNoteSummaryAssocProjectsCalloutFold: string;
	// yearly goals dashboard
	yearlyGoalsSummaryDashboardCalloutFold: string;
	yearlyGoalsSummaryDashboardShowCompleted: boolean;
	yearlyGoalsSummaryDashboardCalloutType: string;
	yearlyGoalsSummaryDashboardCalloutMetadata: string;
}

const DEFAULT_SETTINGS: OcsSettings = {
	//user version
	currentVersion: [],
	//static options
	defaultIcon: "lucide-pencil",
	defaultFold: "+",
	defaultMetadata: "",
	//Active projects and tasks dashboard
	activeProjectsDashBoardParentCalloutType: "column-layout",
	activeProjectsDashBoardParentCalloutMetadata: "clamp-m grow full-height",
	activeProjectsDashBoardParentCalloutFold: "",
	//general
	mainUser: "",
	showDates: false,
	dateFormat: "YYYY-MM-DD",
	//statuses
	inProgressStatusIcon: "lucide-pencil",
	inProgressCalloutType: "note",
	inProgressCalloutMetadata: "violet intense",
	needsSupportStatusIcon: "question-mark-glyph",
	needsSupportCalloutType: "help",
	needsSupportCalloutMetadata: "dusty-rose",
	actionRequiredStatusIcon: "lucide-brick-wall",
	actionRequiredCalloutType: "wall",
	actionRequiredCalloutMetadata: "",
	completeStatusIcon: "lucide-check-circle",
	completeCalloutType: "success",
	completeCalloutMetadata: "medium-green",
	inProgressStrings: ["In Progress"],
	needsSupportStrings: ["Needs Support"],
	actionRequiredStrings: ["Action Required", "Blocked"],
	completeStrings: ["Complete"],
	//roles
	responsibleIcon: "star",
	accountableIcon: "users",
	contributingIcon: "lucide-pencil",
	//team styles
	teamCalloutIcon: "users",
	teamCalloutType: "users",
	teamCalloutMetadata: "light-blue",
	teamCalloutFold: "-",
	//goal styles
	goalCalloutIcon: "medal",
	goalCalloutType: "goal",
	goalCalloutMetadata: "link-matches-callout",
	goalCalloutFold: "-",
	//question styles
	questionCalloutIcon: "question-mark-glyph",
	questionCalloutType: "question",
	questionCalloutMetadata: "link-matches-callout cyan",
	questionCalloutFold: "-",
	//update styles
	updateCalloutIcon: "lucide-list",
	updateCalloutType: "example",
	updateCalloutMetadata: "link-matches-callout light-blue",
	updateCalloutFold: "",
	//associated tasks styles
	assocTasksCalloutIcon: "circle-check",
	assocTasksCalloutType: "todo",
	assocTasksCalloutMetadata: "link-matches-callout",
	assocTasksCalloutFold: "-",
	//associated projects styles
	assocProjectsCalloutIcon: "folder-kanban",
	assocProjectsCalloutType: "presentation",
	assocProjectsCalloutMetadata: "link-matches-callout",
	assocProjectsCalloutFold: "",
	//in note summary views
	inNoteSummaryFold: "+",
	inNoteRolesCalloutType: "column-layout",
	inNoteRolesCalloutMetadata: "full-height clamp-responsive-s center-spaced",
	inNoteYearlyGoalsCalloutFold: "",
	responsibleRoleCalloutType: "user",
	responsibleRoleCalloutMetadata: "light-blue",
	contributingRoleCalloutType: "user",
	contributingRoleCalloutMetadata: "light-blue",
	accountableRoleCalloutType: "user",
	accountableRoleCalloutMetadata: "light-blue",
	inNoteSummaryAssocTasksCalloutFold: "",
	inNoteSummaryAssocProjectsCalloutFold: "",
	//yearly goals dashboard
	yearlyGoalsSummaryDashboardCalloutFold: "",
	yearlyGoalsSummaryDashboardShowCompleted: true,
	yearlyGoalsSummaryDashboardCalloutType: "column-layout",
	yearlyGoalsSummaryDashboardCalloutMetadata: "clamp-m",
};

class SettingsPluginTab extends PluginSettingTab {
	plugin: CustomSettingsPlugin;

	constructor(app: App, plugin: CustomSettingsPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	calloutTypes = [
		"note",
		"abstract",
		"summary",
		"tldr",
		"info",
		"todo",
		"tip",
		"hint",
		"important",
		"success",
		"check",
		"done",
		"question",
		"help",
		"faq",
		"warning",
		"caution",
		"attention",
		"failure",
		"caution",
		"attention",
		"failure",
		"fail",
		"missing",
		"danger",
		"error",
		"bug",
		"example",
		"quote",
		"cite",
		"chemistry",
		"open-folder",
		"closed-folder",
		"reading",
		"books",
		"presentation",
		"long-term",
		"frozen",
		"swiss-franc",
		"dollar",
		"euro",
		"pound",
		"food",
		"drink",
		"landmark",
		"blocked",
		"wall",
		"user",
		"person",
		"users",
		"team",
		"star",
		"goal",
		"hourglass",
		"archive",
		"recipe",
	];

	calloutFolds = ["", "+", "-"];

	currentUserPluginVersion() {
		return this.plugin.settings.currentVersion.length > 0
			? this.plugin.settings.currentVersion.reverse()[0]
			: "None";
	}

	listToRecord(srcList: string[]) {
		return srcList.reduce((acc, str) => {
			acc[str] = str;
			return acc;
		}, {} as Record<string, string>);
	}

	iconList() {
		return getIconIds();
	}

	updateRequiredToVersion() {
		if (this.currentUserPluginVersion() != this.plugin.manifest.version) {
			return this.plugin.manifest.version;
		}
		return null;
	}

	private formatDateString(date: Date, format: string): string {
		try {
			return (window as any).moment(date).format(format);
		} catch (error) {
			return "Invalid format";
		}
	}

	makeTitleSettings(containerEl: HTMLElement) {
		const settingTitle = document.createDocumentFragment();
		settingTitle.append(
			settingTitle.createEl("h1", {
				text: `${this.plugin.manifest.name}`,
			})
		);
		const settingDesc = document.createDocumentFragment();
		settingDesc.append(
			settingDesc.createEl("h6", {
				text: `Plugin Version: ${this.plugin.manifest.version}`,
			}),
			settingDesc.createEl("p", {
				text: "Plugin for customizing Project Delta",
			})
		);

		// make title
		new Setting(containerEl).setName(settingTitle).setDesc(settingDesc);

		// add update if necessary
		const updateVersion = this.updateRequiredToVersion();
		if (updateVersion != null) {
			const updateDesc = document.createDocumentFragment();
			updateDesc.append(
				updateDesc.createEl("b", {
					text: `Current User Version: ${this.currentUserPluginVersion()}`,
				}),
				updateDesc.createEl("p", {
					text: `Current user version incompatible with plugin version ${updateVersion}. Project Delta will not function as expected until a data migration has been successfully performed.`,
				}),
				updateDesc.createEl("b", {
					text: `Backup all your notes before proceeding`,
				})
			);
			new Setting(containerEl)
				.setName("Version Migration Required")
				.setClass("data-migration-container")
				.setDesc(updateDesc)
				.addButton((button) => {
					button
						.setWarning()
						.setButtonText(`Migrate to ${updateVersion}`)
						.onClick(() => {
							new BackupConfirmationModal(this.app, () => {
								new MigrationModal(
									this.app,
									this.plugin,
									this.currentUserPluginVersion(),
									updateVersion
								).open();
							}).open();
						});
				});
		}
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.addClass("ocs-settings-tab");
		const settingTitle = document.createDocumentFragment();
		settingTitle.append(
			settingTitle.createEl("h1", {
				text: `${this.plugin.manifest.name}`,
			})
		);
		this.makeTitleSettings(containerEl);

		new Setting(containerEl)
			.setClass("reference-buttons-container")
			.setName("Reference")
			.setHeading()
			.addButton((Button) =>
				Button.setButtonText("Project Delta Set-Up")
					.setCta()
					.onClick(() => {
						new ReferenceInformationModal(
							this.app,
							this.plugin,
							ReferenceContent.SETUP
						).open();
					})
			)
			.addButton((Button) =>
				Button.setButtonText("Markdown Reference")
					.setCta()
					.onClick(() => {
						new ReferenceInformationModal(
							this.app,
							this.plugin,
							ReferenceContent.MARKDOWN
						).open();
					})
			)
			.addButton((Button) =>
				Button.setButtonText("Callout Types")
					.setCta()
					.onClick(() => {
						new ReferenceInformationModal(
							this.app,
							this.plugin,
							ReferenceContent.CALLOUT_TYPES
						).open();
					})
			)
			.addButton((button) =>
				button
					.setButtonText("Callout Metadata")
					.setCta()
					.onClick(() => {
						new ReferenceInformationModal(
							this.app,
							this.plugin,
							ReferenceContent.CALLOUT_METADATA
						).open();
					})
			);
		new Setting(containerEl)
			.setName("General Settings")
			.setHeading()
			.setDesc(" "); //Makes spacing a bit bigger
		new Setting(containerEl)
			.setName("Main User")
			.setDesc(
				"The name of the primary user. Enter this exactly as you will in any fields (ex. role fields)."
			)
			.addText((text) =>
				text
					.setPlaceholder("Full Name")
					.setValue(this.plugin.settings.mainUser)
					.onChange(async (value) => {
						this.plugin.settings.mainUser = value.trim();
						await this.plugin.saveSettings();
					})
			);
		new Setting(containerEl)
			.setName("Show dates")
			.setDesc("Show dates and durations in summaries")
			.addToggle((checked) =>
				checked
					.setValue(this.plugin.settings.showDates)
					.onChange(async (value) => {
						this.plugin.settings.showDates = value;
						await this.plugin.saveSettings();
					})
			);
		const dateFormatDesc = document.createDocumentFragment();
		const datePreviewSpan = dateFormatDesc.createEl("span", {
			cls: "date-format-preview",
		});
		const updateDatePreview = () => {
			const currentFormat = this.plugin.settings.dateFormat;
			const now = new Date();
			const formattedDate = this.formatDateString(now, currentFormat);
			datePreviewSpan.textContent = `Preview: ${formattedDate}`;
		};
		dateFormatDesc.append(
			"Date format used in displayed dates. ",
			dateFormatDesc.createEl("a", {
				href: "https://momentjs.com/docs/#/displaying/format/",
				text: "Format Reference",
			}),
			dateFormatDesc.createEl("br"),
			dateFormatDesc.createEl("br"),
			datePreviewSpan
		);
		updateDatePreview();
		new Setting(containerEl)
			.setName("Date Format")
			.setDesc(dateFormatDesc)
			.addText((text) =>
				text
					.setPlaceholder("YYYY-MM-DD")
					.setValue(this.plugin.settings.dateFormat)
					.onChange(async (value) => {
						this.plugin.settings.dateFormat = value.trim();
						await this.plugin.saveSettings();
						updateDatePreview();
					})
			);
		new SettingSection(containerEl)
			.setName("Status Settings and Styles")
			.setDesc("Settings and style options for project and task statuses")
			.addChildren((containerEl) => {
				new SettingSection(containerEl)
					.setName("In Progress Status Styles")
					.setDesc(
						'Style settings for "In Progress" status and callouts'
					)
					.addChildren((containerEl) =>
						this.createCalloutSettingsSection(
							containerEl,
							"In Progress",
							"inProgressStatusIcon",
							"inProgressCalloutType",
							"inProgressCalloutMetadata",
							"defaultFold",
							true,
							true,
							true,
							false
						)
					);
				const inProgressStringDesc = document.createDocumentFragment();
				inProgressStringDesc.append(
					'Options that will be used to indicate that a project or task is "In Progress". At least one option is required.',
					inProgressStringDesc.createEl("br"),
					inProgressStringDesc.createEl("b", {
						text: "Note! The first option will be used by default. The other options are available for compatibility reasons only (aka. when you change terms old notes will still work).",
					})
				);
				new ListSetting(
					containerEl,
					"In Progress Strings",
					inProgressStringDesc,
					this.plugin.settings.inProgressStrings,
					async (items) => {
						this.plugin.settings.inProgressStrings = items;
						await this.plugin.saveSettings();
					},
					true,
					true
				);
				new SettingSection(containerEl)
					.setName("Needs Support Status Styles")
					.setDesc(
						'Style settings for "Needs Support" status and callouts'
					)
					.addChildren((containerEl) =>
						this.createCalloutSettingsSection(
							containerEl,
							"Needs Support",
							"needsSupportStatusIcon",
							"needsSupportCalloutType",
							"needsSupportCalloutMetadata",
							"defaultFold",
							true,
							true,
							true,
							false
						)
					);
				const needsSupportStringDesc =
					document.createDocumentFragment();
				needsSupportStringDesc.append(
					'Options that will be used to indicate that a project or task is "Needs Support". At least one option is required.',
					needsSupportStringDesc.createEl("br"),
					needsSupportStringDesc.createEl("b", {
						text: "Note! The first option will be used by default. The other options are available for compatibility reasons only.",
					})
				);
				new ListSetting(
					containerEl,
					"Needs Support Strings",
					needsSupportStringDesc,
					this.plugin.settings.needsSupportStrings,
					async (items) => {
						this.plugin.settings.needsSupportStrings = items;
						await this.plugin.saveSettings();
					},
					true,
					true
				);
				new SettingSection(containerEl)
					.setName("Action Required Status Styles")
					.setDesc(
						'Style settings for "Action Required" status and callouts'
					)
					.addChildren((containerEl) =>
						this.createCalloutSettingsSection(
							containerEl,
							"Action Required",
							"actionRequiredStatusIcon",
							"actionRequiredCalloutType",
							"actionRequiredCalloutMetadata",
							"defaultFold",
							true,
							true,
							true,
							false
						)
					);
				const actionRequiredStringDesc =
					document.createDocumentFragment();
				actionRequiredStringDesc.append(
					'Options that will be used to indicate that a project or task is "Action required". At least one option is required.',
					actionRequiredStringDesc.createEl("br"),
					actionRequiredStringDesc.createEl("b", {
						text: "Note! The first option will be used by default. The other options are available for compatibility reasons only.",
					})
				);
				new ListSetting(
					containerEl,
					"Action required Strings",
					actionRequiredStringDesc,
					this.plugin.settings.actionRequiredStrings,
					async (items) => {
						this.plugin.settings.actionRequiredStrings = items;
						await this.plugin.saveSettings();
					},
					true,
					true
				);
				new SettingSection(containerEl)
					.setName("Complete Status Styles")
					.setDesc(
						'Style settings for "Complete" status and callouts'
					)
					.addChildren((containerEl) =>
						this.createCalloutSettingsSection(
							containerEl,
							"Complete",
							"completeStatusIcon",
							"completeCalloutType",
							"completeCalloutMetadata",
							"defaultFold",
							true,
							true,
							true,
							false
						)
					);
				const completeStringDesc = document.createDocumentFragment();
				completeStringDesc.append(
					'Options that will be used to indicate that a project or task is "Complete". At least one option is required.',
					completeStringDesc.createEl("br"),
					completeStringDesc.createEl("b", {
						text: "Note! The first option will be used by default. The other options are available for compatibility reasons only.",
					})
				);
				new ListSetting(
					containerEl,
					"Complete Strings",
					completeStringDesc,
					this.plugin.settings.completeStrings,
					async (items) => {
						this.plugin.settings.completeStrings = items;
						await this.plugin.saveSettings();
					},
					true,
					true
				);
			});
		new SettingSection(containerEl)
			.setName("Role Icons")
			.setDesc("Icons that are used to indicate a persons role")
			.addChildren((containerEl) => {
				new Setting(containerEl)
					.setName("Responsible Icon")
					.setDesc('Icon to use for the "Responsible" role')
					.addButton((button) => {
						button.onClick(() => {
							new IconPickerModal(
								this.plugin.app,
								this.plugin.settings.responsibleIcon,
								async (newIcon) => {
									// Update the setting value
									this.plugin.settings.responsibleIcon =
										newIcon;
									await this.plugin.saveSettings();

									// Update button display to show selected icon
									button.setIcon(newIcon);
								},
								"Responsible Icon"
							).open();
						});

						// Set initial icon if one is already selected
						if (this.plugin.settings.responsibleIcon) {
							button.setIcon(
								this.plugin.settings.responsibleIcon
							);
						}
					});
				new Setting(containerEl)
					.setName("Accountable Icon")
					.setDesc('Icon to use for the "Accountable" role')
					.addButton((button) => {
						button.onClick(() => {
							new IconPickerModal(
								this.plugin.app,
								this.plugin.settings.accountableIcon,
								async (newIcon) => {
									// Update the setting value
									this.plugin.settings.accountableIcon =
										newIcon;
									await this.plugin.saveSettings();

									// Update button display to show selected icon
									button.setIcon(newIcon);
								},
								"Accountable Icon"
							).open();
						});

						// Set initial icon if one is already selected
						if (this.plugin.settings.accountableIcon) {
							button.setIcon(
								this.plugin.settings.accountableIcon
							);
						}
					});
				new Setting(containerEl)
					.setName("Contribute Icon")
					.setDesc('Icon to use for the "Contribute" role')
					.addButton((button) => {
						button.onClick(() => {
							new IconPickerModal(
								this.plugin.app,
								this.plugin.settings.contributingIcon,
								async (newIcon) => {
									// Update the setting value
									this.plugin.settings.contributingIcon =
										newIcon;
									await this.plugin.saveSettings();

									// Update button display to show selected icon
									button.setIcon(newIcon);
								},
								"Contribute Icon"
							).open();
						});

						// Set initial icon if one is already selected
						if (this.plugin.settings.contributingIcon) {
							button.setIcon(
								this.plugin.settings.contributingIcon
							);
						}
					});
			});

		new SettingSection(containerEl)
			.setName("Team Callout Styles")
			.setDesc("Style settings for team callouts")
			.addChildren((containerEl) =>
				this.createCalloutSettingsSection(
					containerEl,
					"Team",
					"teamCalloutIcon",
					"teamCalloutType",
					"teamCalloutMetadata",
					"teamCalloutFold"
				)
			);
		new SettingSection(containerEl)
			.setName("Goal Callout Styles")
			.setDesc("Style settings for goal callouts")
			.addChildren((containerEl) =>
				this.createCalloutSettingsSection(
					containerEl,
					"Goal",
					"goalCalloutIcon",
					"goalCalloutType",
					"goalCalloutMetadata",
					"goalCalloutFold"
				)
			);
		new SettingSection(containerEl)
			.setName("Question Callout Styles")
			.setDesc("Style settings for question callouts")
			.addChildren((containerEl) =>
				this.createCalloutSettingsSection(
					containerEl,
					"Question",
					"questionCalloutIcon",
					"questionCalloutType",
					"questionCalloutMetadata",
					"questionCalloutFold"
				)
			);
		new SettingSection(containerEl)
			.setName("Update Callout Styles")
			.setDesc("Style settings for update callouts")
			.addChildren((containerEl) =>
				this.createCalloutSettingsSection(
					containerEl,
					"Update",
					"updateCalloutIcon",
					"updateCalloutType",
					"updateCalloutMetadata",
					"updateCalloutFold"
				)
			);
		new SettingSection(containerEl)
			.setName("Associated Task Callout Styles")
			.setDesc(
				"Style settings for associated tasks callouts (tasks associated directly with projects)"
			)
			.addChildren((containerEl) =>
				this.createCalloutSettingsSection(
					containerEl,
					"Associated Tasks",
					"assocTasksCalloutIcon",
					"assocTasksCalloutType",
					"assocTasksCalloutMetadata",
					"assocTasksCalloutFold"
				)
			);
		new SettingSection(containerEl)
			.setName("Associated Projects Callout Styles")
			.setDesc(
				"Style settings for associated projects callouts (projects associated directly with tasks)"
			)
			.addChildren((containerEl) =>
				this.createCalloutSettingsSection(
					containerEl,
					"Associated Projects",
					"assocProjectsCalloutIcon",
					"assocProjectsCalloutType",
					"assocProjectsCalloutMetadata",
					"assocProjectsCalloutFold"
				)
			);
		new SettingSection(containerEl)
			.setName("In Note Summary Styling")
			.setDesc("Styling for in note summary views")
			.addChildren((containerEl) => {
				new Setting(containerEl)
					.setName("Summary Callout Fold")
					.setDesc(
						'Default fold state for in note summary views. "+" (collapsible but expanded by default), "-" (collapsible but collapsed by default), or "" (always open and not collapsible)'
					)
					.addDropdown((dropdown) =>
						dropdown
							.addOptions(this.listToRecord(this.calloutFolds))
							.setValue(
								this.plugin.settings.inNoteSummaryFold as string
							)
							.onChange(async (value) => {
								this.plugin.settings.inNoteSummaryFold = value;
								await this.plugin.saveSettings();
							})
					);
				new CalloutMetadataSetting(
					containerEl,
					`Summary Callout Role Parent Metadata`,
					"Select metadata options to apply additional styling or configuration to the role section (responsible, accountable, and contributing) (ex. item widths, consistent heights, etc.)",
					this.plugin.settings.inNoteRolesCalloutMetadata as string,
					async (items) => {
						(this.plugin.settings
							.inNoteRolesCalloutMetadata as string) =
							items.join(" ");
						await this.plugin.saveSettings();
					},
					() => this.plugin.settings.inNoteRolesCalloutType as string // Get current callout type
				);
				new SettingSection(containerEl)
					.setName("Responsible Role Callout Styles")
					.setDesc("Style settings for responsible role callouts")
					.addChildren((containerEl) =>
						this.createCalloutSettingsSection(
							containerEl,
							"Responsible",
							"responsibleIcon",
							"responsibleRoleCalloutType",
							"responsibleRoleCalloutMetadata",
							"defaultFold",
							false,
							true,
							true,
							false
						)
					);
				new SettingSection(containerEl)
					.setName("Accountable Role Callout Styles")
					.setDesc("Style settings for accountable role callouts")
					.addChildren((containerEl) =>
						this.createCalloutSettingsSection(
							containerEl,
							"Accountable",
							"accountableIcon",
							"accountableRoleCalloutType",
							"accountableRoleCalloutMetadata",
							"defaultFold",
							false,
							true,
							true,
							false
						)
					);
				new SettingSection(containerEl)
					.setName("Contributing Role Callout Styles")
					.setDesc("Style settings for contributing role callouts")
					.addChildren((containerEl) =>
						this.createCalloutSettingsSection(
							containerEl,
							"Contributing",
							"contributingIcon",
							"contributingRoleCalloutType",
							"contributingRoleCalloutMetadata",
							"defaultFold",
							false,
							true,
							true,
							false
						)
					);
				new Setting(containerEl)
					.setName("Associated Tasks Callout Fold")
					.setDesc(
						'Default fold state for in note associated tasks callout. "+" (collapsible but expanded by default), "-" (collapsible but collapsed by default), or "" (always open and not collapsible)'
					)
					.addDropdown((dropdown) =>
						dropdown
							.addOptions(this.listToRecord(this.calloutFolds))
							.setValue(
								this.plugin.settings
									.inNoteSummaryAssocTasksCalloutFold as string
							)
							.onChange(async (value) => {
								this.plugin.settings.inNoteSummaryAssocTasksCalloutFold =
									value;
								await this.plugin.saveSettings();
							})
					);
				new Setting(containerEl)
					.setName("Associated Projects Callout Fold")
					.setDesc(
						'Default fold state for in note associated projects callout. "+" (collapsible but expanded by default), "-" (collapsible but collapsed by default), or "" (always open and not collapsible)'
					)
					.addDropdown((dropdown) =>
						dropdown
							.addOptions(this.listToRecord(this.calloutFolds))
							.setValue(
								this.plugin.settings
									.inNoteSummaryAssocProjectsCalloutFold as string
							)
							.onChange(async (value) => {
								this.plugin.settings.inNoteSummaryAssocProjectsCalloutFold =
									value;
								await this.plugin.saveSettings();
							})
					);
				new Setting(containerEl)
					.setName("Yearly Goals Callout Fold")
					.setDesc(
						'Default fold state for in note yearly goals callout. "+" (collapsible but expanded by default), "-" (collapsible but collapsed by default), or "" (always open and not collapsible)'
					)
					.addDropdown((dropdown) =>
						dropdown
							.addOptions(this.listToRecord(this.calloutFolds))
							.setValue(
								this.plugin.settings
									.inNoteYearlyGoalsCalloutFold as string
							)
							.onChange(async (value) => {
								this.plugin.settings.inNoteYearlyGoalsCalloutFold =
									value;
								await this.plugin.saveSettings();
							})
					);
			});
		new SettingSection(containerEl)
			.setName("Projects And Tasks Dashboard Styling")
			.setDesc("styling for the projects and tasks dashboard")
			.addChildren((containerEl) => {
				new CalloutMetadataSetting(
					containerEl,
					`Projects And Tasks Dashboard Metadata Options`,
					"Select metadata options to apply additional styling or configuration to the projects and tasks dashboard (ex. item widths, consistent heights, etc.)",
					this.plugin.settings
						.activeProjectsDashBoardParentCalloutMetadata as string,
					async (items) => {
						(this.plugin.settings
							.activeProjectsDashBoardParentCalloutMetadata as string) =
							items.join(" ");
						await this.plugin.saveSettings();
					},
					() =>
						this.plugin.settings
							.activeProjectsDashBoardParentCalloutType as string // Get current callout type
				);
			});
		new SettingSection(containerEl)
			.setName("Yearly Goals dashboard Styling")
			.setDesc("Styling for the yearly goals summary dashboard")
			.addChildren((containerEl) => {
				new CalloutMetadataSetting(
					containerEl,
					`Yearly Goals Dashboard Metadata Options`,
					"Select metadata options to apply additional styling or configuration to the yearly goals dashboard (ex. item widths, consistent heights, etc.)",
					this.plugin.settings
						.yearlyGoalsSummaryDashboardCalloutMetadata as string,
					async (items) => {
						(this.plugin.settings
							.yearlyGoalsSummaryDashboardCalloutMetadata as string) =
							items.join(" ");
						await this.plugin.saveSettings();
					},
					() =>
						this.plugin.settings
							.yearlyGoalsSummaryDashboardCalloutType as string // Get current callout type
				);
				new Setting(containerEl)
					.setName("Yearly Goal Callout Fold")
					.setDesc(
						'Default fold state for Yearly Goal callouts. "+" (collapsible but expanded by default), "-" (collapsible but collapsed by default), or "" (always open and not collapsible)'
					)
					.addDropdown((dropdown) =>
						dropdown
							.addOptions(this.listToRecord(this.calloutFolds))
							.setValue(
								this.plugin.settings
									.yearlyGoalsSummaryDashboardCalloutFold as string
							)
							.onChange(async (value) => {
								this.plugin.settings.yearlyGoalsSummaryDashboardCalloutFold =
									value;
								await this.plugin.saveSettings();
							})
					);
				new Setting(containerEl)
					.setName("Show Completed Projects And Tasks")
					.setDesc(
						"Show completed projects and tasks by default in the yearly goals dashboard"
					)
					.addToggle((checked) =>
						checked
							.setValue(
								this.plugin.settings
									.yearlyGoalsSummaryDashboardShowCompleted
							)
							.onChange(async (value) => {
								this.plugin.settings.yearlyGoalsSummaryDashboardShowCompleted =
									value;
								await this.plugin.saveSettings();
							})
					);
			});

		new Setting(this.containerEl)
			.setName("Reset Settings To Default")
			.setDesc(
				"Reset all settings to their default values. This action cannot be undone."
			)
			.addButton((button) => {
				button
					.setIcon("lucide-refresh-cw")
					.setWarning() // Makes the button red/warning coloured
					.onClick(() => {
						new ResetConfirmationModal(this.app, async () => {
							// Reset the settings
							this.plugin.settings = Object.assign(
								{},
								DEFAULT_SETTINGS
							);
							await this.plugin.saveSettings();

							// Reload the settings tab to reflect changes
							this.display();

							new Notice(
								"Obsidian Custom Settings have been reset to defaults"
							);
						}).open();
					});
			});
	}

	private createCalloutSettingsSection(
		containerEl: HTMLElement,
		sectionTitleShort: string,
		iconSetting: keyof OcsSettings,
		typeSetting: keyof OcsSettings,
		metadataSetting: keyof OcsSettings,
		foldSetting: keyof OcsSettings,
		enableIcon = true,
		enableType = true,
		enableMetadata = true,
		enableFold = true
	): void {
		// Create preview container
		const previewContainer = containerEl.createDiv(
			"callout-preview-section"
		);
		previewContainer.createEl("h4", { text: "Preview:" });
		const previewEl = previewContainer.createDiv(
			"callout-preview-container"
		);

		const updatePreview = () => {
			previewEl.empty();

			// Get settings values
			const calloutType = this.plugin.settings[typeSetting] as string;
			const foldValue = this.plugin.settings[foldSetting] as string;
			const metadataValue = this.plugin.settings[
				metadataSetting
			] as string;
			const iconName = this.plugin.settings[iconSetting] as string;
			const isCollapsed = foldValue === "-";

			// Main callout container
			const calloutEl = previewEl.createDiv("callout");

			// Set data attributes
			calloutEl.setAttribute("data-callout", calloutType);
			calloutEl.setAttribute(
				"data-callout-metadata",
				metadataValue || ""
			);
			calloutEl.setAttribute("data-callout-fold", foldValue || "");

			// Add collapsed class if needed
			if (isCollapsed) {
				calloutEl.addClass("is-collapsed");
			}

			// Callout title section
			const titleEl = calloutEl.createDiv("callout-title");
			titleEl.setAttribute("dir", "auto");

			// Icon container
			const iconEl = titleEl.createDiv("callout-icon");
			const iconSvg = getIcon(iconName);
			if (iconSvg) {
				// Clone the icon to avoid modifying the original
				const clonedIcon = iconSvg.cloneNode(true) as SVGElement;
				// Ensure proper classes are maintained
				clonedIcon.classList.add("svg-icon");
				iconEl.appendChild(clonedIcon);
			}

			// Title text
			const titleInnerEl = titleEl.createDiv("callout-title-inner");
			titleInnerEl.setText(`${sectionTitleShort} Callout`);

			// Fold indicator (only if foldable)
			if (foldValue === "-" || foldValue === "+") {
				const foldEl = titleEl.createDiv("callout-fold");

				// Create the SVG element
				const foldSvg = document.createElementNS(
					"http://www.w3.org/2000/svg",
					"svg"
				);
				foldSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
				foldSvg.setAttribute("width", "24");
				foldSvg.setAttribute("height", "24");
				foldSvg.setAttribute("viewBox", "0 0 24 24");
				foldSvg.setAttribute("fill", "none");
				foldSvg.setAttribute("stroke", "currentColor");
				foldSvg.setAttribute("stroke-width", "2");
				foldSvg.setAttribute("stroke-linecap", "round");
				foldSvg.setAttribute("stroke-linejoin", "round");
				foldSvg.classList.add("svg-icon");

				if (foldValue === "-") {
					// Collapsed state - right-pointing chevron
					foldSvg.innerHTML =
						'<polyline points="9,18 15,12 9,6"></polyline>';
					foldSvg.classList.add("lucide-chevron-right");
				} else if (foldValue === "+") {
					// Expanded state - down-pointing chevron
					foldSvg.innerHTML =
						'<polyline points="6,9 12,15 18,9"></polyline>';
					foldSvg.classList.add("lucide-chevron-down");
				}

				foldEl.appendChild(foldSvg);
			}

			// Content section (only if not collapsed)
			if (!isCollapsed) {
				const contentEl = calloutEl.createDiv("callout-content");

				// Show metadata info if present
				if (metadataValue && metadataValue.trim()) {
					const metaInfo = contentEl.createEl("p");
					metaInfo.setAttribute("dir", "auto");
					metaInfo.setText(`Metadata: ${metadataValue}`);
					metaInfo.style.fontStyle = "italic";
					metaInfo.style.opacity = "0.7";
					metaInfo.style.fontSize = "0.9em";
				}

				// Example paragraph with dir attribute like Obsidian
				const paragraph = contentEl.createEl("p");
				paragraph.setAttribute("dir", "auto");
				paragraph.setText("Wow! Look! Some text is in your callout.");
				paragraph.append(
					paragraph.createEl("br"),
					paragraph.createEl("a", {
						text: "This is what links will look like",
					})
				);

				// Add an unordered list
				const unorderedList = contentEl.createEl("ul");
				const ul1 = unorderedList.createEl("li");
				ul1.setAttribute("dir", "auto");
				ul1.setText("Unordered list item");

				// Add an ordered list
				const orderedList = contentEl.createEl("ol");
				const ol1 = orderedList.createEl("li");
				ol1.setAttribute("dir", "auto");
				ol1.setText("Ordered list item");
			}
		};

		// Icon setting
		if (enableIcon) {
			new Setting(containerEl)
				.setName(`${sectionTitleShort} Callout Icon`)
				.setDesc(`Icon to use in ${sectionTitleShort} callouts`)
				.addButton((button) => {
					button.onClick(() => {
						new IconPickerModal(
							this.plugin.app,
							this.plugin.settings[iconSetting] as string,
							async (newIcon) => {
								(this.plugin.settings[iconSetting] as string) =
									newIcon;
								await this.plugin.saveSettings();
								button.setIcon(newIcon);
								updatePreview();
							},
							`${sectionTitleShort} Icon`
						).open();
					});

					// Set initial icon
					const currentIcon = this.plugin.settings[
						iconSetting
					] as string;
					if (currentIcon) {
						button.setIcon(currentIcon);
					}
				});
		}

		// Type setting
		if (enableType) {
			new Setting(containerEl)
				.setName(`${sectionTitleShort} Callout Type`)
				.setDesc(
					`The callout type to use (helps set callout style, primarily colour. See the "callout options and examples" note for samples.)`
				)
				.addDropdown((dropdown) =>
					dropdown
						.addOptions(this.listToRecord(this.calloutTypes))
						.setValue(this.plugin.settings[typeSetting] as string)
						.onChange(async (value) => {
							(this.plugin.settings[typeSetting] as string) =
								value;
							await this.plugin.saveSettings();
							updatePreview();
						})
				);
		}

		// Metadata setting
		if (enableMetadata) {
			new CalloutMetadataSetting(
				containerEl,
				`${sectionTitleShort} Callout Metadata`,
				"Select metadata options to apply additional styling or configuration to the callout",
				this.plugin.settings[metadataSetting] as string,
				async (items) => {
					(this.plugin.settings[metadataSetting] as string) =
						items.join(" ");
					await this.plugin.saveSettings();
					updatePreview();
				},
				() => this.plugin.settings[typeSetting] as string // Get current callout type
			);
		}

		// Fold setting
		if (enableFold) {
			new Setting(containerEl)
				.setName(`${sectionTitleShort} Callout Fold`)
				.setDesc(
					'Callout fold: "+" (collapsible but expanded by default), "-" (collapsible but collapsed by default), or "" (always open and not collapsible)'
				)
				.addDropdown((dropdown) =>
					dropdown
						.addOptions(this.listToRecord(this.calloutFolds))
						.setValue(this.plugin.settings[foldSetting] as string)
						.onChange(async (value) => {
							(this.plugin.settings[foldSetting] as string) =
								value;
							await this.plugin.saveSettings();
							updatePreview();
						})
				);
		}

		// Initialize preview
		updatePreview();
	}
}

export function createIconPickerSetting(
	containerEl: HTMLElement,
	plugin: CustomSettingsPlugin,
	settingName: string,
	settingDescription: string,
	currentIcon: string,
	title: string | null = null
) {
	new Setting(containerEl)
		.setName(settingName)
		.setDesc(settingDescription)
		.addButton((button) => {
			button.setButtonText("Select Icon").onClick(() => {
				new IconPickerModal(
					plugin.app,
					currentIcon,
					async (newIcon) => {
						// Update the setting value
						currentIcon = newIcon;
						await plugin.saveSettings();

						// Update button display to show selected icon
						button.setIcon(newIcon);
					},
					title ?? settingName
				).open();
			});

			if (currentIcon) {
				button.setIcon(currentIcon);
			}
		});
}

class IconPickerModal extends Modal {
	private currentIcon: string;
	private onSelect: (iconName: string) => void;
	private title: string | null;

	constructor(
		app: App,
		currentIcon: string,
		onSelect: (iconName: string) => void,
		title: string
	) {
		super(app);
		this.currentIcon = currentIcon;
		this.onSelect = onSelect;
		this.title = title;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		const IconPickerWrapper = contentEl.createDiv(
			"ocs-icon-picker-container"
		);

		// Modal title
		IconPickerWrapper.createEl("h2", {
			text: `Select ${this.title ?? "Icon"}`,
		});

		// Current selection display
		if (this.currentIcon) {
			const currentSection = IconPickerWrapper.createDiv(
				"current-icon-section"
			);
			const currentDisplay = currentSection.createDiv(
				"current-icon-display"
			);

			const iconSvg = this.getIconSvg(this.currentIcon);
			currentDisplay.innerHTML = `<span class="current-icon-item">
                ${iconSvg} <span class="current-icon-name">${this.currentIcon}</span>
            </span>`;
		}

		// Search input
		const searchContainer = IconPickerWrapper.createDiv(
			"icon-search-container"
		);
		const searchInput = searchContainer.createEl("input", {
			type: "text",
			placeholder: "Search icons...",
		});

		// Icons grid container
		const gridContainer = IconPickerWrapper.createDiv(
			"icon-grid-container"
		);
		const iconGrid = gridContainer.createDiv("icon-grid");

		// Get all available icons
		const availableIcons = this.getAllAvailableIcons();

		// Function to render icons
		const renderIcons = (iconsToShow: string[]) => {
			iconGrid.empty();

			iconsToShow.forEach((iconName) => {
				const iconItem = iconGrid.createDiv("icon-item");
				if (iconName === this.currentIcon) {
					iconItem.addClass("selected");
				}

				const iconSvg = this.getIconSvg(iconName);
				iconItem.innerHTML = `
                    <div class="icon-preview">${iconSvg}</div>
                    <div class="icon-name">${iconName}</div>
                `;

				iconItem.addEventListener("click", () => {
					this.onSelect(iconName);
					this.close();
				});
			});
		};

		// Initial render
		renderIcons(availableIcons);

		// Search functionality
		searchInput.addEventListener("input", (e) => {
			const searchTerm = (
				e.target as HTMLInputElement
			).value.toLowerCase();
			const filteredIcons = availableIcons.filter((icon) =>
				icon.toLowerCase().includes(searchTerm)
			);
			renderIcons(filteredIcons);
		});
	}

	private getAllAvailableIcons(): string[] {
		// Use Obsidian's built-in function to get all available icon IDs
		return getIconIds();
	}

	private getIconSvg(iconName: string): string {
		// Use Obsidian's getIcon method to get the SVG element
		const iconElement = getIcon(iconName);

		if (iconElement) {
			// Clone the element to avoid modifying the original
			const clonedIcon = iconElement.cloneNode(true) as SVGElement;
			// Ensure proper sizing
			clonedIcon.setAttribute("width", "24");
			clonedIcon.setAttribute("height", "24");
			return clonedIcon.outerHTML;
		}

		// Fallback if icon not found
		return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <text x="12" y="16" text-anchor="middle" font-size="8" fill="currentColor">?</text>
        </svg>`;
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class SettingSection {
	plugin: CustomSettingsPlugin;
	private setting: Setting;
	private childrenEl: HTMLElement;
	private isExpanded = false;

	constructor(containerEl: HTMLElement) {
		// Create the main setting using Obsidian's Setting class
		this.setting = new Setting(containerEl);

		// Create children container (initially hidden)
		this.childrenEl = containerEl.createDiv("setting-section-children");

		// Add the toggle button with chevron
		this.setting.addButton((button) => {
			button.setIcon("lucide-chevron-right").onClick(() => {
				this.toggleOpenState(button);
			});

			button.buttonEl.addClass("setting-section-toggle");
		});
	}

	// Public API methods
	setName(name: string): SettingSection {
		this.setting.setName(name).setHeading();
		return this;
	}

	setDesc(desc: string | DocumentFragment): SettingSection {
		this.setting.setDesc(desc);
		return this;
	}

	addChildren(callback: (containerEl: HTMLElement) => void): SettingSection {
		callback(this.childrenEl);
		return this;
	}

	// Toggle methods
	toggleOpenState(button: ButtonComponent): void {
		if (this.isExpanded) {
			this.collapseChildren();
			button.setIcon("lucide-chevron-right");
		} else {
			this.expandChildren();
			button.setIcon("lucide-chevron-down");
		}
	}

	expandChildren(): void {
		if (this.isExpanded) return;

		this.isExpanded = true;
		this.childrenEl.style.display = "block";
	}

	collapseChildren(): void {
		if (!this.isExpanded) return;

		this.isExpanded = false;
		this.childrenEl.style.display = "none";
	}

	// Utility methods
	isOpen(): boolean {
		return this.isExpanded;
	}

	getChildrenEl(): HTMLElement {
		return this.childrenEl;
	}

	getSetting(): Setting {
		return this.setting;
	}
}

export class ListSetting {
	private containerEl: HTMLElement;
	private setting: Setting;
	private items: string[] = [];
	private textComponent: TextComponent;
	private addButton: ButtonComponent;
	private pillsContainer: HTMLElement;
	private onChange: (items: string[]) => void;
	private requireItems: boolean;
	private firstItemDefault: boolean;

	constructor(
		containerEl: HTMLElement,
		name: string,
		description: string | DocumentFragment,
		initialItems: string[] = [],
		onChange: (items: string[]) => void,
		requireItems = false,
		firstItemDefault = false
	) {
		this.containerEl = containerEl;
		this.items = [...initialItems];
		this.onChange = onChange;
		this.requireItems = requireItems;
		this.firstItemDefault = firstItemDefault;

		this.createSetting(name, description);
		this.createPillsContainer();
		this.renderPills();
	}

	private createSetting(
		name: string,
		description: string | DocumentFragment
	): void {
		this.setting = new Setting(this.containerEl)
			.setName(name)
			.setDesc(description)
			.addText((text) => {
				this.textComponent = text;
				text.setPlaceholder("Enter option...");

				// Handle Enter key
				text.inputEl.addEventListener("keypress", (e) => {
					if (e.key === "Enter") {
						e.preventDefault();
						this.addItem();
					}
				});

				return text;
			})
			.addButton((button) => {
				this.addButton = button;
				button
					.setIcon("plus")
					.setTooltip("Add item")
					.onClick(() => this.addItem());

				return button;
			});
	}

	private createPillsContainer(): void {
		this.pillsContainer = this.containerEl.createDiv("list-setting-pills");
	}

	private addItem(): void {
		const value = this.textComponent.getValue().trim();

		if (value && !this.items.includes(value)) {
			this.items.push(value);
			this.textComponent.setValue("");
			this.renderPills();
			this.notifyChange();
		}
	}

	private promoteToFirst(index: number): void {
		if (index <= 0) return; // Already first or invalid index

		// Move the item to the front
		const item = this.items.splice(index, 1)[0];
		this.items.unshift(item);

		this.renderPills();
		this.notifyChange();
	}

	private removeItem(index: number): void {
		// Prevent removing the last item if items are required
		if (this.requireItems && this.items.length <= 1) {
			return;
		}

		this.items.splice(index, 1);
		this.renderPills();
		this.notifyChange();
	}

	private renderPills(): void {
		this.pillsContainer.empty();

		if (this.items.length === 0) {
			const emptyText =
				this.pillsContainer.createSpan("list-setting-empty");
			emptyText.textContent = "No items added yet";
			return;
		}

		this.items.forEach((item, index) => {
			const pill = this.pillsContainer.createDiv("list-setting-pill");

			const shouldDisableRemove =
				this.requireItems && this.items.length <= 1;
			const isFirstDefault = this.firstItemDefault && index === 0;

			// Add CSS class for default styling
			if (isFirstDefault) {
				pill.addClass("is-default");
			}

			// Add promote to first button (only for non-first items when firstItemDefault is true)
			if (this.firstItemDefault && index > 0) {
				const promoteBtn = pill.createSpan("list-setting-pill-promote");

				// Create SVG arrow
				const arrowSvg = document.createElementNS(
					"http://www.w3.org/2000/svg",
					"svg"
				);
				arrowSvg.setAttribute("width", "12");
				arrowSvg.setAttribute("height", "12");
				arrowSvg.setAttribute("viewBox", "0 0 24 24");
				arrowSvg.setAttribute("fill", "none");
				arrowSvg.setAttribute("stroke", "currentColor");
				arrowSvg.setAttribute("stroke-width", "2");
				arrowSvg.setAttribute("stroke-linecap", "round");
				arrowSvg.setAttribute("stroke-linejoin", "round");
				arrowSvg.innerHTML =
					'<polyline points="18,15 12,9 6,15"></polyline>';

				promoteBtn.appendChild(arrowSvg);
				promoteBtn.setAttribute(
					"aria-label",
					`Make "${item}" the default value`
				);
				promoteBtn.addEventListener("click", () =>
					this.promoteToFirst(index)
				);
			}

			// Add default indicator for first item
			if (isFirstDefault) {
				const defaultBadge = pill.createSpan(
					"list-setting-pill-default"
				);
				defaultBadge.textContent = "DEFAULT";
			}

			// Add item text
			const textSpan = pill.createSpan("list-setting-pill-text");
			textSpan.textContent = item;
			textSpan.setAttribute("title", item); // Show full text on hover

			// Add remove button
			const removeBtn = pill.createSpan("list-setting-pill-remove");
			removeBtn.textContent = "×";
			removeBtn.setAttribute("aria-label", `Remove "${item}"`);

			if (shouldDisableRemove) {
				removeBtn.addClass("is-disabled");
				removeBtn.setAttribute(
					"title",
					"Cannot remove the last required item"
				);
			} else {
				removeBtn.addEventListener("click", () =>
					this.removeItem(index)
				);
			}
		});
	}

	private notifyChange(): void {
		this.onChange([...this.items]);
	}

	// Public methods for external control
	public getItems(): string[] {
		return [...this.items];
	}

	public setItems(items: string[]): void {
		this.items = [...items];
		this.renderPills();
	}

	public addItemProgrammatically(item: string): boolean {
		if (item.trim() && !this.items.includes(item.trim())) {
			this.items.push(item.trim());
			this.renderPills();
			this.notifyChange();
			return true;
		}
		return false;
	}

	public clear(): void {
		if (this.requireItems && this.items.length <= 1) {
			return;
		}

		this.items = [];
		this.renderPills();
		this.notifyChange();
	}

	public focus(): void {
		this.textComponent.inputEl.focus();
	}

	public disable(): void {
		this.textComponent.setDisabled(true);
		this.addButton.setDisabled(true);
	}

	public enable(): void {
		this.textComponent.setDisabled(false);
		this.addButton.setDisabled(false);
	}

	public isValid(): boolean {
		if (!this.requireItems) return true;
		return this.items.length > 0;
	}

	public setRequireItems(require: boolean): void {
		this.requireItems = require;
	}
}

class ResetConfirmationModal extends Modal {
	private onConfirm: () => void;

	constructor(app: App, onConfirm: () => void) {
		super(app);
		this.onConfirm = onConfirm;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		const warningWrapper = contentEl.createDiv("ocs-settings-reset-modal");

		// Modal title
		warningWrapper.createEl("h2", {
			text: "Reset All Settings",
		});

		// Warning message
		const warningDiv = warningWrapper.createDiv("reset-warning-container");
		warningDiv.createEl("p", {
			text: "⚠️ This action will permanently reset all your customized settings to their default values.",
		});

		warningDiv.createEl("p", {
			text: "This includes:",
		});

		const warningList = warningDiv.createEl("ul");
		const warningItems = [
			"All status configurations and strings",
			"Role icons and customizations",
			"Callout styles and metadata",
			"Date formats and user settings",
		];

		warningItems.forEach((item) => {
			warningList.createEl("li", { text: item });
		});

		warningDiv.createEl("p", {
			text: "This action cannot be undone.",
		});

		// Button container
		const buttonContainer = warningWrapper.createDiv(
			"modal-button-container"
		);

		// Cancel button
		const cancelButton = buttonContainer.createEl("button", {
			text: "Cancel",
			cls: "mod-cta",
		});
		cancelButton.addEventListener("click", () => {
			this.close();
		});

		// Confirm reset button
		const confirmButton = buttonContainer.createEl("button", {
			text: "Reset All Settings",
			cls: "mod-warning",
		});
		confirmButton.addEventListener("click", () => {
			this.onConfirm();
			this.close();
		});

		// Focus the cancel button by default (safer option)
		cancelButton.focus();
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

export class CalloutMetadataSetting {
	private containerEl: HTMLElement;
	private setting: Setting;
	private items: string[] = [];
	private dropdownComponent: DropdownComponent;
	private pillsContainer: HTMLElement;
	private onChange: (items: string[]) => void;
	private getCalloutType: () => string;

	// Metadata categories and their values
	private static readonly METADATA_CATEGORIES = {
		colorOverrides: [
			"light-gray",
			"medium-gray",
			"dark-gray",
			"yellow",
			"grapefruit",
			"burnt-orange",
			"orange",
			"red",
			"dusty-rose",
			"light-green",
			"medium-green",
			"dark-green",
			"forest-green",
			"light-blue",
			"medium-blue",
			"dark-blue",
			"purple",
			"violet",
			"gold",
			"cyan",
			"inherit-parent-callout-colour",
		],
		colorModifiers: ["transparent", "intense"],
		borderStyling: [
			"bw1-L",
			"bw1-R",
			"bw1-T",
			"bw1-B",
			"bw1-A",
			"bw2-L",
			"bw2-R",
			"bw2-T",
			"bw2-B",
			"bw2-A",
			"bw3-L",
			"bw3-R",
			"bw3-T",
			"bw3-B",
			"bw3-A",
			"bw4-L",
			"bw4-R",
			"bw4-T",
			"bw4-B",
			"bw4-A",
		],
		titleOptions: ["no-icon", "hide-title-bar", "no-title"],
		contentStyle: ["link-matches-callout"],
		// Column layout sizing options (mutually exclusive groups)
		baseSizing: [
			"base-xs",
			"base-s",
			"base-m",
			"base-l",
			"base-xl",
			"base-auto",
		],
		clampSizing: ["clamp-xs", "clamp-s", "clamp-m", "clamp-l", "clamp-xl"],
		clampResponsiveSizing: [
			"clamp-responsive-xs",
			"clamp-responsive-s",
			"clamp-responsive-m",
			"clamp-responsive-l",
			"clamp-responsive-xl",
		],
		// Flex behavior options (can be combined)
		flexBehavior: ["grow", "shrink", "flexible"],
		// Layout modes
		layoutModes: ["no-wrap", "full-height"],
		// Alignment options (mutually exclusive)
		alignment: ["left-align", "center", "right-align", "center-spaced"],
	};

	constructor(
		containerEl: HTMLElement,
		name: string,
		description: string | DocumentFragment,
		initialValue = "",
		onChange: (items: string[]) => void,
		getCalloutType: () => string
	) {
		this.containerEl = containerEl;
		this.items = this.parseMetadataString(initialValue);
		this.onChange = onChange;
		this.getCalloutType = getCalloutType;

		this.createSetting(name, description);
		this.createPillsContainer();
		this.renderPills();
	}

	// Parse metadata string into array of items
	private parseMetadataString(metadataString: string): string[] {
		return metadataString
			.split(" ")
			.map((item) => item.trim())
			.filter((item) => item.length > 0);
	}

	// Create the main setting UI with dropdown
	private createSetting(
		name: string,
		description: string | DocumentFragment
	): void {
		this.setting = new Setting(this.containerEl)
			.setName(name)
			.setDesc(description)
			.addDropdown((dropdown) => {
				this.dropdownComponent = dropdown;
				this.updateDropdownOptions();
				dropdown.setValue("");

				dropdown.onChange((value) => {
					if (value && this.isOptionAvailable(value)) {
						this.addItem(value);
					}
				});

				return dropdown;
			});
	}

	// Create container for pills display
	private createPillsContainer(): void {
		this.pillsContainer = this.containerEl.createDiv("list-setting-pills");
	}

	// Update dropdown options based on current state
	private updateDropdownOptions(): void {
		if (!this.dropdownComponent) return;

		this.dropdownComponent.selectEl.empty();

		// Add default empty option
		const defaultOption =
			this.dropdownComponent.selectEl.createEl("option");
		defaultOption.value = "";
		defaultOption.textContent = "Select metadata...";

		const availableOptions = this.getAvailableOptions();

		// Group options by category
		const categories = {
			"Colour Overrides":
				CalloutMetadataSetting.METADATA_CATEGORIES.colorOverrides,
			"Colour Modifiers":
				CalloutMetadataSetting.METADATA_CATEGORIES.colorModifiers,
			"Border Styling":
				CalloutMetadataSetting.METADATA_CATEGORIES.borderStyling,
			"Title Options":
				CalloutMetadataSetting.METADATA_CATEGORIES.titleOptions,
			"Content Style":
				CalloutMetadataSetting.METADATA_CATEGORIES.contentStyle,
			"Static Sizing":
				CalloutMetadataSetting.METADATA_CATEGORIES.baseSizing,
			"Clamp Sizing":
				CalloutMetadataSetting.METADATA_CATEGORIES.clampSizing,
			"Responsive Sizing":
				CalloutMetadataSetting.METADATA_CATEGORIES
					.clampResponsiveSizing,
			"Flex Behavior":
				CalloutMetadataSetting.METADATA_CATEGORIES.flexBehavior,
			"Layout Modes":
				CalloutMetadataSetting.METADATA_CATEGORIES.layoutModes,
			Alignment: CalloutMetadataSetting.METADATA_CATEGORIES.alignment,
		};

		Object.entries(categories).forEach(
			([categoryName, categoryOptions]) => {
				const availableInCategory = categoryOptions.filter((option) =>
					availableOptions.includes(option)
				);

				if (availableInCategory.length > 0) {
					const optgroup =
						this.dropdownComponent.selectEl.createEl("optgroup");
					optgroup.label = categoryName;

					availableInCategory.forEach((option) => {
						const optionEl = optgroup.createEl("option");
						optionEl.value = option;
						optionEl.textContent = option;
					});
				}
			}
		);
	}

	// Get all available options (not already selected and compatible)
	private getAvailableOptions(): string[] {
		const allOptions = Object.values(
			CalloutMetadataSetting.METADATA_CATEGORIES
		).flat();
		return allOptions.filter((option) => this.isOptionAvailable(option));
	}

	// Check if an option is available for selection
	private isOptionAvailable(option: string): boolean {
		if (this.items.includes(option)) {
			return false;
		}

		const currentCalloutType = this.getCalloutType();

		// Check if callout type is column-layout for sizing/layout options
		const isColumnLayoutRequired = this.isColumnLayoutOption(option);
		if (isColumnLayoutRequired && currentCalloutType !== "column-layout") {
			return false;
		}

		// Check if styling options are incompatible with column-layout
		const isStylingOption = this.isStylingOption(option);
		if (isStylingOption && currentCalloutType === "column-layout") {
			return false;
		}

		// Colour override exclusions - only one allowed
		if (this.isColorOverride(option)) {
			return !this.items.some((item) => this.isColorOverride(item));
		}

		// Colour modifier exclusions - transparent and intense are mutually exclusive
		if (this.isColorModifier(option)) {
			if (option === "transparent" && this.items.includes("intense"))
				return false;
			if (option === "intense" && this.items.includes("transparent"))
				return false;
		}

		// Title option exclusions
		if (this.isTitleOption(option)) {
			return this.isTitleOptionCompatible(option);
		}

		// Border styling exclusions
		if (this.isBorderStyle(option)) {
			return this.isBorderStyleCompatible(option);
		}

		// Size control exclusions - only one sizing method allowed
		if (this.isSizeControl(option)) {
			return this.isSizeControlCompatible(option);
		}

		// Flex behavior exclusions - they are mutually exclusive
		if (this.isFlexBehavior(option)) {
			return !this.items.some((item) => this.isFlexBehavior(item));
		}

		// Alignment exclusions - only one alignment allowed
		if (this.isAlignment(option)) {
			return !this.items.some((item) => this.isAlignment(item));
		}

		// Flex behavior - all can be combined, no restrictions

		// Layout modes can be combined, no restrictions

		return true;
	}

	// Helper methods for category checking
	private isColorOverride(option: string): boolean {
		return CalloutMetadataSetting.METADATA_CATEGORIES.colorOverrides.includes(
			option
		);
	}

	private isColorModifier(option: string): boolean {
		return CalloutMetadataSetting.METADATA_CATEGORIES.colorModifiers.includes(
			option
		);
	}

	private isTitleOption(option: string): boolean {
		return CalloutMetadataSetting.METADATA_CATEGORIES.titleOptions.includes(
			option
		);
	}

	private isBorderStyle(option: string): boolean {
		return CalloutMetadataSetting.METADATA_CATEGORIES.borderStyling.includes(
			option
		);
	}

	private isBaseSizing(option: string): boolean {
		return CalloutMetadataSetting.METADATA_CATEGORIES.baseSizing.includes(
			option
		);
	}

	private isClampSizing(option: string): boolean {
		return CalloutMetadataSetting.METADATA_CATEGORIES.clampSizing.includes(
			option
		);
	}

	private isClampResponsiveSizing(option: string): boolean {
		return CalloutMetadataSetting.METADATA_CATEGORIES.clampResponsiveSizing.includes(
			option
		);
	}

	private isSizeControl(option: string): boolean {
		return (
			this.isBaseSizing(option) ||
			this.isClampSizing(option) ||
			this.isClampResponsiveSizing(option)
		);
	}

	private isFlexBehavior(option: string): boolean {
		return CalloutMetadataSetting.METADATA_CATEGORIES.flexBehavior.includes(
			option
		);
	}

	private isLayoutMode(option: string): boolean {
		return CalloutMetadataSetting.METADATA_CATEGORIES.layoutModes.includes(
			option
		);
	}

	private isAlignment(option: string): boolean {
		return CalloutMetadataSetting.METADATA_CATEGORIES.alignment.includes(
			option
		);
	}

	private isColumnLayoutOption(option: string): boolean {
		return (
			this.isSizeControl(option) ||
			this.isFlexBehavior(option) ||
			this.isLayoutMode(option) ||
			this.isAlignment(option)
		);
	}

	private isStylingOption(option: string): boolean {
		return (
			this.isColorOverride(option) ||
			this.isColorModifier(option) ||
			this.isBorderStyle(option) ||
			this.isTitleOption(option) ||
			option === "link-matches-callout"
		);
	}

	// Check title option compatibility
	private isTitleOptionCompatible(option: string): boolean {
		const hasHideTitleBar = this.items.includes("hide-title-bar");

		switch (option) {
			case "no-icon":
				// no-icon is incompatible only with hide-title-bar (can't hide icon if whole bar is hidden)
				return !hasHideTitleBar;
			case "hide-title-bar":
				// hide-title-bar makes no-icon meaningless, so prevent this combination
				return !this.items.includes("no-icon");
			case "no-title":
				// no-title can coexist with no-icon (you can have icon without title text)
				// but is incompatible with hide-title-bar (can't hide bar that has no title)
				return !hasHideTitleBar;
			default:
				return true;
		}
	}

	// Check border style compatibility
	private isBorderStyleCompatible(option: string): boolean {
		const [borderWidth, borderSide] = option.split("-");

		if (borderSide === "A") {
			// All-sides border conflicts with any border of same width
			return !this.items.some((item) => {
				if (!this.isBorderStyle(item)) return false;
				const [itemWidth] = item.split("-");
				return itemWidth === borderWidth;
			});
		} else {
			// Specific side border conflicts with same side or all-sides of same width
			return !this.items.some((item) => {
				if (!this.isBorderStyle(item)) return false;
				const [itemWidth, itemSide] = item.split("-");
				return (
					itemSide === borderSide ||
					(itemWidth === borderWidth && itemSide === "A")
				);
			});
		}
	}

	// Check size control compatibility - only one sizing method allowed
	private isSizeControlCompatible(option: string): boolean {
		// Check if any other size control option is already selected
		return !this.items.some((item) => {
			if (item === option) return false; // Don't check against itself
			return this.isSizeControl(item);
		});
	}

	// Add an item to the selection
	private addItem(value: string): void {
		this.items.push(value);
		this.dropdownComponent.setValue("");
		this.updateDropdownOptions();
		this.renderPills();
		this.notifyChange();
	}

	// Remove an item from the selection
	private removeItem(index: number): void {
		this.items.splice(index, 1);
		this.updateDropdownOptions();
		this.renderPills();
		this.notifyChange();
	}

	// Render the selected items as pills
	private renderPills(): void {
		this.pillsContainer.empty();

		if (this.items.length === 0) {
			const emptyText =
				this.pillsContainer.createSpan("list-setting-empty");
			emptyText.textContent = "No metadata added";
			return;
		}

		this.items.forEach((item, index) => {
			const pill = this.pillsContainer.createDiv("list-setting-pill");

			// Add accessibility information
			const disabledOptions = this.getDisabledOptionsByItem(item);
			let pillAriaLabel = "";
			if (disabledOptions.length > 0) {
				pillAriaLabel += `This option has disabled: ${disabledOptions.join(
					", "
				)}`;
			}
			pill.setAttribute("aria-label", pillAriaLabel);

			// Add item text
			const textSpan = pill.createSpan("list-setting-pill-text");
			textSpan.textContent = item;

			// Add remove button
			const removeBtn = pill.createSpan("list-setting-pill-remove");
			removeBtn.textContent = "×";
			removeBtn.setAttribute("aria-label", `Remove "${item}"`);
			removeBtn.addEventListener("click", () => this.removeItem(index));
		});
	}

	// Get options disabled by a specific item
	private getDisabledOptionsByItem(item: string): string[] {
		const disabled: string[] = [];
		const allOptions = Object.values(
			CalloutMetadataSetting.METADATA_CATEGORIES
		).flat();

		for (const option of allOptions) {
			if (option === item || this.items.includes(option)) continue;

			const tempItems = this.items.filter((i) => i !== item);
			const wouldBeAvailableWithout = this.wouldOptionBeAvailable(
				option,
				tempItems
			);
			const isAvailableWith = this.wouldOptionBeAvailable(
				option,
				this.items
			);

			if (wouldBeAvailableWithout && !isAvailableWith) {
				disabled.push(option);
			}
		}

		return disabled;
	}

	// Check if option would be available with different item set
	private wouldOptionBeAvailable(
		option: string,
		currentItems: string[]
	): boolean {
		if (currentItems.includes(option)) return false;

		// Temporarily replace items to check availability
		const originalItems = this.items;
		this.items = currentItems;

		const currentCalloutType = this.getCalloutType();

		// Check callout type dependency for column-layout-specific options
		const isColumnLayoutRequired = this.isColumnLayoutOption(option);
		if (isColumnLayoutRequired && currentCalloutType !== "column-layout") {
			this.items = originalItems;
			return false;
		}

		// Check if styling options are incompatible with column-layout
		const isStylingOption = this.isStylingOption(option);
		if (isStylingOption && currentCalloutType === "column-layout") {
			this.items = originalItems;
			return false;
		}

		// Use existing validation logic
		const result = this.isOptionAvailable(option);
		this.items = originalItems;

		return result;
	}

	// Notify parent of changes
	private notifyChange(): void {
		this.onChange([...this.items]);
	}

	// Public API methods
	public getItems(): string[] {
		return [...this.items];
	}

	public getMetadataString(): string {
		return this.items.join(" ");
	}

	public setItems(items: string[]): void {
		this.items = [...items];
		this.updateDropdownOptions();
		this.renderPills();
	}

	public setMetadataString(metadataString: string): void {
		this.setItems(this.parseMetadataString(metadataString));
	}

	public clear(): void {
		this.items = [];
		this.updateDropdownOptions();
		this.renderPills();
		this.notifyChange();
	}

	public refreshOptions(): void {
		this.updateDropdownOptions();
	}

	public disable(): void {
		this.dropdownComponent.setDisabled(true);
	}

	public enable(): void {
		this.dropdownComponent.setDisabled(false);
	}
}

enum ReferenceContent {
	SETUP,
	MARKDOWN,
	CALLOUT_METADATA,
	CALLOUT_TYPES,
}

import markdownReference from "./assets/markdown_reference.md";
import projectDeltaSetupReference from "./assets/project_delta_setup.md";
import calloutTypesReference from "./assets/callout_types.md";
import calloutMetadataReference from "./assets/callout_metadata.md";

class ReferenceInformationModal extends Modal {
	plugin: CustomSettingsPlugin;
	contentType: ReferenceContent;

	constructor(
		app: App,
		plugin: CustomSettingsPlugin,
		contentType: ReferenceContent
	) {
		super(app);
		this.plugin = plugin;
		this.contentType = contentType;
	}

	private getContent(contentType: ReferenceContent): string {
		const setUpContent = projectDeltaSetupReference;
		const markdownGuideContent = markdownReference;
		const calloutTypeContent = calloutTypesReference;
		const calloutMetadataContent = calloutMetadataReference;

		switch (contentType) {
			case ReferenceContent.SETUP:
				return setUpContent;
			case ReferenceContent.MARKDOWN:
				return markdownGuideContent;
			case ReferenceContent.CALLOUT_TYPES:
				return calloutTypeContent;
			case ReferenceContent.CALLOUT_METADATA:
				return calloutMetadataContent;
			default:
				return "";
		}
	}

	async onOpen() {
		const { contentEl } = this;

		const container = contentEl.createDiv();

		// Create a MarkdownRenderChild for lifecycle management
		const renderChild = new MarkdownRenderChild(container);

		const content = this.getContent(this.contentType);

		// Use the new render method with app parameter
		await MarkdownRenderer.render(
			this.app, // app parameter
			content, // markdown content
			container, // target element
			"", // sourcePath
			renderChild // component for lifecycle management
		);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

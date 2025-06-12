/* eslint-disable @typescript-eslint/no-explicit-any */
import { App, Modal, Notice, TFile } from "obsidian";
import CustomSettingsPlugin from "./main";

interface MigrationChange {
	file: string;
	changes: {
		migratedMilestonesNote?: string;
		removedProjectName?: string;
		renamedProjectToParentProject?: string;
		renamedTimelineCase?: string;
		renamedStartDate?: string;
	};
}

export class DataMigrationManager {
	constructor(private app: App, private plugin: CustomSettingsPlugin) {}

	async migrateParentFields(dryRun = true): Promise<MigrationChange[]> {
		const files = this.app.vault.getMarkdownFiles();
		const changes: MigrationChange[] = [];

		for (const file of files) {
			const fileChanges: any = {};

			await this.app.fileManager.processFrontMatter(
				file,
				(frontmatter) => {
					let modified = false;

					// 1. Migrate milestones_note to child note
					if (frontmatter["milestones_note"]) {
						fileChanges.migratedMilestonesNote =
							frontmatter["milestones_note"];
						if (!dryRun) {
							frontmatter["child note"] =
								frontmatter["milestones_note"];
							delete frontmatter["milestones_note"];
						}
						modified = true;
					}

					// 2. Remove "project name" field everywhere
					if (frontmatter["project name"]) {
						fileChanges.removedProjectName =
							frontmatter["project name"];
						if (!dryRun) {
							delete frontmatter["project name"];
						}
						modified = true;
					}

					// 3. In tasks folder: rename "project" to "parent project"
					if (this.isInTasksFolder(file) && frontmatter["project"]) {
						fileChanges.renamedProjectToParentProject =
							frontmatter["project"];
						if (!dryRun) {
							frontmatter["parent project"] =
								frontmatter["project"];
							delete frontmatter["project"];
						}
						modified = true;
					}

					// 4. Rename "Timeline" to "timeline"
					if (frontmatter["Timeline"]) {
						fileChanges.renamedTimelineCase =
							frontmatter["Timeline"];
						if (!dryRun) {
							frontmatter["timeline"] = frontmatter["Timeline"];
							delete frontmatter["Timeline"];
						}
						modified = true;
					}

					// 5. Rename "start_date" to "start date"
					if (frontmatter["start_date"]) {
						fileChanges.renamedStartDate =
							frontmatter["start_date"];
						if (!dryRun) {
							frontmatter["start date"] =
								frontmatter["start_date"];
							delete frontmatter["start_date"];
						}
						modified = true;
					}

					if (modified) {
						changes.push({ file: file.path, changes: fileChanges });
					}

					return !dryRun && modified;
				}
			);
		}

		return changes;
	}

	private isInTasksFolder(file: TFile): boolean {
		return file.path.startsWith("tasks/") || file.path.includes("/tasks/");
	}

	async performMigration(): Promise<void> {
		await this.migrateParentFields(false);
		await this.plugin.updateUserPluginVersion(this.plugin.manifest.version);
		new Notice("Migration completed successfully!");
	}
}

export class BackupConfirmationModal extends Modal {
	constructor(app: App, private onConfirm: () => void) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		const warningWrapper = contentEl.createDiv("ocs-settings-reset-modal");
		warningWrapper.createEl("h2", { text: "Backup Confirmation Required" });

		const warningDiv = warningWrapper.createDiv("reset-warning-container");
		warningDiv.createEl("p", {
			text: "Before proceeding with the data migration, you must backup your vault.",
		});

		warningDiv.createEl("p", {
			text: "This migration will modify frontmatter fields in your notes. While the process is designed to be safe, having a backup ensures you can recover if anything goes wrong.",
		});

		const backupSteps = warningDiv.createEl("ol");
		backupSteps.createEl("li", { text: "Close Obsidian completely" });
		backupSteps.createEl("li", {
			text: "Copy your entire vault folder to a safe location",
		});
		backupSteps.createEl("li", {
			text: "Reopen Obsidian and return to this dialog",
		});

		warningDiv.createEl("b", {
			text: "Have you completed a full backup of your vault?",
		});

		const buttonContainer = warningWrapper.createDiv(
			"modal-button-container"
		);

		const cancelButton = buttonContainer.createEl("button", {
			text: "No, I need to backup first",
			cls: "mod-cta",
		});
		cancelButton.addEventListener("click", () => this.close());

		const confirmButton = buttonContainer.createEl("button", {
			text: "Yes, I have a backup",
			cls: "mod-warning",
		});
		confirmButton.addEventListener("click", () => {
			this.onConfirm();
			this.close();
		});

		cancelButton.focus();
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

export class MigrationModal extends Modal {
	private migrationManager: DataMigrationManager;
	private dryRunResults: MigrationChange[] = [];
	private hasRunDryRun = false;

	constructor(
		app: App,
		private plugin: CustomSettingsPlugin,
		private currentVersion: string,
		private targetVersion: string
	) {
		super(app);
		this.migrationManager = new DataMigrationManager(app, plugin);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl("h2", {
			text: `Migration: ${this.currentVersion} → ${this.targetVersion}`,
		});

		this.createUpdateNotes(contentEl);
		this.createMigrationSection(contentEl);
	}

	private createUpdateNotes(containerEl: HTMLElement) {
		const notesSection = containerEl.createDiv();
		notesSection.createEl("h3", { text: "Update Notes" });

		const notesList = notesSection.createEl("ul");
		notesList.createEl("li", {
			text: "Migrate 'milestones_note' field to 'parent'",
		});
		notesList.createEl("li", {
			text: "Remove 'project name' field from all notes",
		});
		notesList.createEl("li", {
			text: "In tasks folder: rename 'project' to 'parent project'",
		});
		notesList.createEl("li", { text: "Rename 'Timeline' to 'timeline'" });
		notesList.createEl("li", {
			text: "Rename 'start_date' to 'start date'",
		});
	}

	private createMigrationSection(containerEl: HTMLElement) {
		const migrationSection = containerEl.createDiv();

		const buttonContainer = migrationSection.createDiv(
			"modal-button-container"
		);

		migrationSection.createEl("h3", { text: "Migration Preview" });

		const dryRunButton = buttonContainer.createEl("button", {
			text: "Preview Changes (Dry Run)",
			cls: "mod-cta",
		});

		const resultsContainer = migrationSection.createDiv();

		dryRunButton.addEventListener("click", async () => {
			dryRunButton.textContent = "Running preview...";
			dryRunButton.disabled = true;

			try {
				this.dryRunResults =
					await this.migrationManager.migrateParentFields(true);
				this.displayDryRunResults(resultsContainer);
				this.hasRunDryRun = true;

				dryRunButton.textContent = "Dry Run Complete";
				migrateButton.disabled = false;

				if (this.dryRunResults.length === 0) {
					migrateButton.textContent =
						"No changes needed - Complete migration";
				}
			} catch (error) {
				new Notice("Error during preview: " + error.message);
				dryRunButton.textContent = "Preview Changes (Dry Run)";
				dryRunButton.disabled = false;
			}
		});

		const migrateButton = buttonContainer.createEl("button", {
			text: "Run Migration",
			cls: "mod-warning",
		});
		migrateButton.disabled = true;

		migrateButton.addEventListener("click", async () => {
			if (!this.hasRunDryRun) {
				new Notice("Please run the preview first");
				return;
			}

			migrateButton.textContent = "Running migration...";
			migrateButton.disabled = true;

			try {
				await this.migrationManager.performMigration();
				this.close();
			} catch (error) {
				new Notice("Error during migration: " + error.message);
				migrateButton.textContent = "Run Migration";
				migrateButton.disabled = false;
			}
		});
	}

	private displayDryRunResults(containerEl: HTMLElement) {
		containerEl.empty();

		if (this.dryRunResults.length === 0) {
			const noChanges = containerEl.createEl("p");
			noChanges.textContent =
				"✅ No files need to be changed. Your vault is already up to date!";
			noChanges.style.color = "var(--text-success)";
			noChanges.style.fontWeight = "bold";
			return;
		}

		containerEl.createEl("h4", {
			text: `Preview Results: ${this.dryRunResults.length} files will be modified`,
		});

		const resultsDiv = containerEl.createDiv();
		resultsDiv.style.maxHeight = "300px";
		resultsDiv.style.overflowY = "auto";
		resultsDiv.style.border = "1px solid var(--background-modifier-border)";
		resultsDiv.style.padding = "1rem";
		resultsDiv.style.borderRadius = "4px";
		resultsDiv.style.backgroundColor = "var(--background-secondary)";

		this.dryRunResults.forEach((change) => {
			const fileDiv = resultsDiv.createDiv();
			fileDiv.style.marginBottom = "1rem";
			fileDiv.style.paddingBottom = "0.5rem";
			fileDiv.style.borderBottom =
				"1px solid var(--background-modifier-border)";

			const fileName = fileDiv.createEl("strong");
			fileName.textContent = change.file;
			fileName.style.color = "var(--text-accent)";

			const changesList = fileDiv.createEl("ul");
			changesList.style.marginTop = "0.5rem";
			changesList.style.fontSize = "0.9em";

			Object.entries(change.changes).forEach(([changeType, value]) => {
				const listItem = changesList.createEl("li");
				listItem.style.marginBottom = "0.25rem";

				switch (changeType) {
					case "migratedMilestonesNote":
						listItem.innerHTML = `<code>milestones_note</code> → <code>parent</code>: "${value}"`;
						break;
					case "removedProjectName":
						listItem.innerHTML = `Remove <code>project name</code>: "${value}"`;
						break;
					case "renamedProjectToParentProject":
						listItem.innerHTML = `<code>project</code> → <code>parent project</code>: "${value}"`;
						break;
					case "renamedTimelineCase":
						listItem.innerHTML = `<code>Timeline</code> → <code>timeline</code>: "${value}"`;
						break;
					case "renamedStartDate":
						listItem.innerHTML = `<code>start_date</code> → <code>start date</code>: "${value}"`;
						break;
				}
			});
		});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

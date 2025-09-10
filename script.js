// Trading Strategy Manager - Optimized JavaScript
class TradingStrategyManager {
    constructor() {
        this.strategies = [];
        this.currentStrategy = null;
        this.selectedStrategyId = null;
        this.deletedStrategy = null;
        this.undoTimeout = null;
        this.init();
    }

    init() {
        this.loadStrategies();
        this.setupEventListeners();
        this.renderStrategyList();
        
        // Seed with sample strategy if empty
        if (this.strategies.length === 0) {
            //this.seedSampleStrategy();
        }
    }

    // Generate UUID v4
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // Setup event listeners
    setupEventListeners() {
        // Toolbar buttons
        document.getElementById('btn-new').addEventListener('click', () => this.openNewStrategyModal());
        document.getElementById('btn-delete').addEventListener('click', () => this.deleteStrategy());

        // Edit button in right panel
        document.getElementById('btn-edit').addEventListener('click', () => this.openEditStrategyModal());

        // Search
        document.getElementById('search-input').addEventListener('input', (e) => this.filterStrategies(e.target.value));

        // Form validation
        document.getElementById('name').addEventListener('input', () => this.validateForm());

        // Strategy details modal
        document.getElementById('modal-close').addEventListener('click', () => this.closeModal());
        document.getElementById('btn-visual-view').addEventListener('click', () => this.showVisualView());
        document.getElementById('btn-json-view').addEventListener('click', () => this.showJsonView());

        // Edit modal
        document.getElementById('edit-modal-close').addEventListener('click', () => this.closeEditModal());
        document.getElementById('btn-save-strategy').addEventListener('click', () => this.saveCurrentStrategy());
        document.getElementById('btn-cancel-edit').addEventListener('click', () => this.closeEditModal());

        // Undo toast
        document.getElementById('undo-btn').addEventListener('click', () => this.undoDelete());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Modal close on ESC and click outside
        this.setupModalEvents();
    }

    // Setup modal events
    setupModalEvents() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                this.closeEditModal();
            }
        });

        document.getElementById('strategy-modal').addEventListener('click', (e) => {
            if (e.target.id === 'strategy-modal') {
                this.closeModal();
            }
        });

        document.getElementById('edit-modal').addEventListener('click', (e) => {
            if (e.target.id === 'edit-modal') {
                this.closeEditModal();
            }
        });
    }

    // Keyboard shortcuts
    handleKeyboardShortcuts(e) {
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            this.openNewStrategyModal();
        } else if (e.key === 'Delete' && this.selectedStrategyId) {
            this.deleteStrategy();
        }
    }

    // Load strategies from localStorage
    loadStrategies() {
        const stored = localStorage.getItem('trading_strategies_v1');
        if (stored) {
            try {
                this.strategies = JSON.parse(stored);
            } catch (e) {
                console.error('Error loading strategies:', e);
                this.strategies = [];
            }
        }
    }

    // Save strategies to localStorage
    saveStrategies() {
        localStorage.setItem('trading_strategies_v1', JSON.stringify(this.strategies));
    }

    // Render strategy list
    renderStrategyList() {
        const listContainer = document.getElementById('strategy-list');
        listContainer.innerHTML = '';

        this.strategies.forEach(strategy => {
            const item = this.createStrategyListItem(strategy);
            listContainer.appendChild(item);
        });
    }

    // Create strategy list item
    createStrategyListItem(strategy) {
        const item = document.createElement('div');
        item.className = 'strategy-item';
        item.dataset.id = strategy.id;

        if (strategy.id === this.selectedStrategyId) {
            item.classList.add('selected');
        }

        const tagsText = strategy.tags?.length > 0 ? strategy.tags.join(', ') : 'No tags';
        const updatedDate = new Date(strategy.meta.updatedAt).toLocaleDateString();

        item.innerHTML = `
            <div class="strategy-name">${this.escapeHtml(strategy.name)}</div>
            <div class="strategy-meta">Tags: ${this.escapeHtml(tagsText)} | Updated: ${updatedDate}</div>
        `;

        // Event listeners
        item.addEventListener('click', () => this.selectStrategy(strategy.id));
        item.addEventListener('dblclick', () => this.openStrategyModal(strategy.id));

        return item;
    }

    // Filter strategies
    filterStrategies(searchTerm) {
        const items = document.querySelectorAll('.strategy-item');
        const term = searchTerm.toLowerCase();

        items.forEach(item => {
            const name = item.querySelector('.strategy-name').textContent.toLowerCase();
            const meta = item.querySelector('.strategy-meta').textContent.toLowerCase();
            item.style.display = (name.includes(term) || meta.includes(term)) ? 'block' : 'none';
        });
    }

    // Select strategy
    selectStrategy(id) {
        this.selectedStrategyId = id;
        this.currentStrategy = this.strategies.find(s => s.id === id);

        // Update UI selection
        document.querySelectorAll('.strategy-item').forEach(item => {
            item.classList.remove('selected');
        });
        document.querySelector(`[data-id="${id}"]`)?.classList.add('selected');

        // Show strategy details in right panel
        this.showStrategyDetails(this.currentStrategy);

        // Show edit button
        document.getElementById('btn-edit').style.display = 'inline-block';
    }

    // Show strategy details in right panel
    showStrategyDetails(strategy) {
        const detailsContainer = document.getElementById('strategy-details');
        const titleElement = document.getElementById('details-title');
        const editButton = document.getElementById('btn-edit');

        if (!strategy) {
            detailsContainer.innerHTML = `
                <div class="no-selection">
                    <p>Select a strategy from the list to view details</p>
                    <p>Double-click to view in modal or use the Edit button</p>
                </div>
            `;
            titleElement.textContent = 'Strategy Details';
            editButton.style.display = 'none';
            return;
        }

        titleElement.textContent = strategy.name;
        detailsContainer.innerHTML = this.generateStrategyDetailsHTML(strategy);
    }

    // Generate strategy details HTML
    generateStrategyDetailsHTML(strategy) {
        return `
            <div class="detail-section">
                <h3>Overview</h3>
                <div class="detail-content">
                    <p><strong>Description:</strong> ${this.escapeHtml(strategy.description || 'No description')}</p>
                    <p><strong>Tags:</strong> ${this.generateBadges(strategy.tags)}</p>
                    <p><strong>Timeframes:</strong> ${this.generateBadges(strategy.timeframes)}</p>
                    <p><strong>Created:</strong> ${new Date(strategy.meta.createdAt).toLocaleString()}</p>
                    <p><strong>Updated:</strong> ${new Date(strategy.meta.updatedAt).toLocaleString()}</p>
                </div>
            </div>

            <div class="detail-section">
                <h3>Indicators</h3>
                <div class="detail-content">
                    ${this.generateBadges(strategy.indicators)}
                </div>
            </div>

            <div class="detail-section">
                <h3>Entry Rules</h3>
                <div class="detail-content">
                    <ul class="rule-list">
                        ${strategy.entry_rules.map(rule => `<li>${this.escapeHtml(rule)}</li>`).join('')}
                    </ul>
                </div>
            </div>

            <div class="detail-section">
                <h3>Exit Rules</h3>
                <div class="detail-content">
                    <ul class="rule-list">
                        ${strategy.exit_rules.map(rule => `<li>${this.escapeHtml(rule)}</li>`).join('')}
                    </ul>
                </div>
            </div>

            <div class="detail-section">
                <h3>Risk Management</h3>
                <div class="detail-content">
                    <p><strong>Stop Loss:</strong> ${this.escapeHtml(strategy.stoploss_rule || 'Not specified')}</p>
                    <p><strong>Take Profit:</strong> ${this.escapeHtml(strategy.takeprofit_rule || 'Not specified')}</p>
                    <p><strong>Position Size:</strong> ${this.escapeHtml(strategy.position_size_rule || 'Not specified')}</p>
                </div>
            </div>

            <div class="detail-section">
                <h3>Management Options</h3>
                <div class="detail-content">
                    <div class="management-status">
                        ${this.generateManagementStatus(strategy.management)}
                    </div>
                </div>
            </div>
        `;
    }

    // Generate badges HTML
    generateBadges(items) {
        if (!items || items.length === 0) return '<span class="no-items">None</span>';
        return items.map(item => `<span class="badge">${this.escapeHtml(item)}</span>`).join('');
    }

    // Generate management status HTML
    generateManagementStatus(management) {
        const options = [
            {
                key: 'trailing_stop',
                label: 'Trailing Stop',
                extra: management.trailing_stop?.multiplier ? ` (${management.trailing_stop.multiplier}x)` : ''
            },
            {
                key: 'scale_out',
                label: 'Scale Out',
                extra: management.scale_out?.percent_first ? ` (${management.scale_out.percent_first}%)` : ''
            },
            {
                key: 'dca',
                label: 'DCA',
                extra: ''
            },
            {
                key: 'manual',
                label: 'Manual',
                extra: ''
            }
        ];

        return options.map(option => {
            const enabled = management[option.key]?.enabled;
            const statusClass = enabled ? 'enabled' : 'disabled';
            const statusText = enabled ? 'Enabled' : 'Disabled';
            return `<div class="status-item ${statusClass}">
                ${option.label}: ${statusText}${enabled ? option.extra : ''}
            </div>`;
        }).join('');
    }

    // Load strategy into form
    loadStrategyIntoForm(strategy) {
        if (!strategy) return;

        const formFields = [
            'name', 'description', 'stoploss_rule', 'takeprofit_rule', 'position_size_rule'
        ];

        formFields.forEach(field => {
            const element = document.getElementById(field);
            if (element) element.value = strategy[field] || '';
        });

        // Handle array fields
        document.getElementById('tags').value = strategy.tags?.join(', ') || '';
        document.getElementById('timeframes').value = strategy.timeframes?.join(', ') || '';
        document.getElementById('indicators').value = strategy.indicators?.join(', ') || '';
        document.getElementById('entry_rules').value = strategy.entry_rules?.join('\n') || '';
        document.getElementById('exit_rules').value = strategy.exit_rules?.join('\n') || '';

        // Handle management options
        const mgmt = strategy.management || {};
        document.getElementById('trailing_stop_enabled').checked = mgmt.trailing_stop?.enabled || false;
        document.getElementById('trailing_stop_multiplier').value = mgmt.trailing_stop?.multiplier || '';
        document.getElementById('scale_out_enabled').checked = mgmt.scale_out?.enabled || false;
        document.getElementById('scale_out_percent').value = mgmt.scale_out?.percent_first || '';
        document.getElementById('dca_enabled').checked = mgmt.dca?.enabled || false;
        document.getElementById('manual_enabled').checked = mgmt.manual?.enabled || false;

        this.validateForm();
    }

    // Open new strategy modal
    openNewStrategyModal() {
        this.currentStrategy = null;
        document.getElementById('edit-modal-title').textContent = 'New Strategy';
        document.getElementById('strategy-form').reset();
        document.getElementById('edit-modal').style.display = 'block';
        
        setTimeout(() => document.getElementById('name').focus(), 100);
        this.validateForm();
    }

    // Open edit strategy modal
    openEditStrategyModal() {
        if (!this.currentStrategy) return;
        
        document.getElementById('edit-modal-title').textContent = `Edit: ${this.currentStrategy.name}`;
        this.loadStrategyIntoForm(this.currentStrategy);
        document.getElementById('edit-modal').style.display = 'block';
    }

    // Save current strategy
    saveCurrentStrategy() {
        if (!this.validateForm()) return;

        const formData = this.getFormData();

        if (this.currentStrategy) {
            // Update existing strategy
            const index = this.strategies.findIndex(s => s.id === this.currentStrategy.id);
            if (index !== -1) {
                this.strategies[index] = {
                    ...this.currentStrategy,
                    ...formData,
                    meta: {
                        ...this.currentStrategy.meta,
                        updatedAt: new Date().toISOString(),
                        version: (this.currentStrategy.meta.version || 1) + 1
                    }
                };
                this.currentStrategy = this.strategies[index];
            }
        } else {
            // Create new strategy
            const newStrategy = {
                id: this.generateUUID(),
                ...formData,
                meta: {
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    version: 1
                }
            };
            this.strategies.push(newStrategy);
            this.currentStrategy = newStrategy;
            this.selectedStrategyId = newStrategy.id;
        }

        this.saveStrategies();
        this.renderStrategyList();
        this.closeEditModal();
        this.showStrategyDetails(this.currentStrategy);
        this.showToast('Strategy saved successfully!', 2000);
    }

    // Get form data
    getFormData() {
        const splitAndTrim = (value) => value.split(',').map(t => t.trim()).filter(t => t);
        const splitLines = (value) => value.split('\n').map(r => r.trim()).filter(r => r);

        return {
            name: document.getElementById('name').value.trim(),
            description: document.getElementById('description').value.trim(),
            tags: splitAndTrim(document.getElementById('tags').value),
            timeframes: splitAndTrim(document.getElementById('timeframes').value),
            indicators: splitAndTrim(document.getElementById('indicators').value),
            entry_rules: splitLines(document.getElementById('entry_rules').value),
            exit_rules: splitLines(document.getElementById('exit_rules').value),
            stoploss_rule: document.getElementById('stoploss_rule').value.trim(),
            takeprofit_rule: document.getElementById('takeprofit_rule').value.trim(),
            position_size_rule: document.getElementById('position_size_rule').value.trim(),
            management: {
                trailing_stop: {
                    enabled: document.getElementById('trailing_stop_enabled').checked,
                    multiplier: document.getElementById('trailing_stop_multiplier').value || ""
                },
                scale_out: {
                    enabled: document.getElementById('scale_out_enabled').checked,
                    percent_first: document.getElementById('scale_out_percent').value || ""
                },
                dca: {
                    enabled: document.getElementById('dca_enabled').checked
                },
                manual: {
                    enabled: document.getElementById('manual_enabled').checked
                }
            }
        };
    }

    // Delete strategy
    deleteStrategy() {
        if (!this.selectedStrategyId) {
            alert('Please select a strategy to delete.');
            return;
        }

        const strategy = this.strategies.find(s => s.id === this.selectedStrategyId);
        if (!strategy) return;

        if (confirm(`Are you sure you want to delete "${strategy.name}"?`)) {
            // Store for undo
            this.deletedStrategy = {
                strategy: { ...strategy },
                index: this.strategies.findIndex(s => s.id === this.selectedStrategyId)
            };

            // Remove from array
            this.strategies = this.strategies.filter(s => s.id !== this.selectedStrategyId);

            // Clear selection
            this.selectedStrategyId = null;
            this.currentStrategy = null;

            // Update UI
            this.saveStrategies();
            this.renderStrategyList();
            this.showStrategyDetails(null);
            this.showUndoToast(`Deleted "${strategy.name}"`);
        }
    }

    // Validate form
    validateForm() {
        const nameInput = document.getElementById('name');
        const nameError = document.getElementById('name-error');
        let isValid = true;

        if (!nameInput.value.trim()) {
            nameError.textContent = 'Name is required';
            isValid = false;
        } else if (nameInput.value.length > 80) {
            nameError.textContent = 'Name must be 80 characters or less';
            isValid = false;
        } else {
            nameError.textContent = '';
        }

        return isValid;
    }

    // Open strategy modal
    openStrategyModal(id) {
        const strategy = this.strategies.find(s => s.id === id);
        if (!strategy) return;

        document.querySelector('.modal-title').textContent = `Strategy: ${strategy.name}`;
        this.populateModalContent(strategy);
        document.getElementById('strategy-modal').style.display = 'block';
    }

    // Populate modal content
    populateModalContent(strategy) {
        const visualContent = document.getElementById('modal-content-visual');
        const jsonContent = document.getElementById('json-display');

        // Visual view - reuse the same HTML generation
        visualContent.innerHTML = `
            <div class="detail-section">
                <h3>Overview</h3>
                <div class="detail-content">
                    <p><strong>Name:</strong> ${this.escapeHtml(strategy.name)}</p>
                    <p><strong>Description:</strong> ${this.escapeHtml(strategy.description || 'No description')}</p>
                    <p><strong>Tags:</strong> ${this.generateBadges(strategy.tags)}</p>
                    <p><strong>Timeframes:</strong> ${this.generateBadges(strategy.timeframes)}</p>
                    <p><strong>Created:</strong> ${new Date(strategy.meta.createdAt).toLocaleString()}</p>
                    <p><strong>Updated:</strong> ${new Date(strategy.meta.updatedAt).toLocaleString()}</p>
                    <p><strong>Version:</strong> ${strategy.meta.version}</p>
                </div>
            </div>
            ${this.generateStrategyDetailsHTML(strategy).replace('<div class="detail-section">', '').replace('</div>', '')}
        `;

        // JSON view
        jsonContent.textContent = JSON.stringify(strategy, null, 2);
    }

    // Modal view controls
    showVisualView() {
        document.getElementById('modal-content-visual').style.display = 'block';
        document.getElementById('modal-content-json').style.display = 'none';
        document.getElementById('btn-visual-view').setAttribute('data-active', 'true');
        document.getElementById('btn-json-view').setAttribute('data-active', 'false');
    }

    showJsonView() {
        document.getElementById('modal-content-visual').style.display = 'none';
        document.getElementById('modal-content-json').style.display = 'block';
        document.getElementById('btn-visual-view').setAttribute('data-active', 'false');
        document.getElementById('btn-json-view').setAttribute('data-active', 'true');
    }

    // Close modals
    closeModal() {
        document.getElementById('strategy-modal').style.display = 'none';
    }

    closeEditModal() {
        document.getElementById('edit-modal').style.display = 'none';
    }

    // Undo functionality
    showUndoToast(message) {
        const toast = document.getElementById('undo-toast');
        const messageEl = document.getElementById('undo-message');

        messageEl.textContent = message;
        toast.style.display = 'flex';

        if (this.undoTimeout) clearTimeout(this.undoTimeout);

        this.undoTimeout = setTimeout(() => {
            toast.style.display = 'none';
            this.deletedStrategy = null;
        }, 6000);
    }

    undoDelete() {
        if (!this.deletedStrategy) return;

        this.strategies.splice(this.deletedStrategy.index, 0, this.deletedStrategy.strategy);
        this.saveStrategies();
        this.renderStrategyList();
        this.selectStrategy(this.deletedStrategy.strategy.id);

        document.getElementById('undo-toast').style.display = 'none';
        this.deletedStrategy = null;

        if (this.undoTimeout) clearTimeout(this.undoTimeout);
    }

    // Show toast message
    showToast(message, duration = 3000) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.style.display = 'flex';
        toast.innerHTML = `<span>${this.escapeHtml(message)}</span>`;
        document.body.appendChild(toast);

        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, duration);
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new TradingStrategyManager();
});
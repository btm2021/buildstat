# Trading Strategy Manager

## Tổng quan
Ứng dụng web quản lý chiến lược giao dịch với giao diện Windows 98, được xây dựng bằng vanilla HTML, CSS, JavaScript. Ứng dụng cho phép người dùng tạo, chỉnh sửa, xem và xóa các chiến lược giao dịch với đầy đủ thông tin chi tiết.

## Kiến trúc hệ thống

### Công nghệ sử dụng
- **Frontend**: Vanilla HTML5, CSS3, JavaScript ES6+
- **Storage**: LocalStorage (client-side)
- **UI Framework**: Windows 98 theme (custom CSS)
- **Architecture**: Single Page Application (SPA)

### Cấu trúc file
```
├── index.html          # Main HTML structure
├── styles.css          # Windows 98 themed styles
├── script.js           # Core application logic
└── README.md          # Documentation
```

## Chức năng chính

### 1. Quản lý Strategy (CRUD)
- **Create**: Tạo strategy mới qua modal form
- **Read**: Xem danh sách và chi tiết strategy
- **Update**: Chỉnh sửa strategy hiện có
- **Delete**: Xóa strategy với tính năng undo (6 giây)

### 2. Giao diện người dùng
- **Layout 3 panel**: Toolbar, Strategy List (trái), Strategy Details (phải)
- **Modal system**: New/Edit modal, Details modal
- **Search/Filter**: Tìm kiếm theo tên và tags
- **Responsive**: Tối ưu cho các kích thước màn hình

### 3. Tính năng nâng cao
- **Keyboard shortcuts**: Ctrl+N (new), Delete (delete)
- **Form validation**: Real-time validation với error messages
- **Toast notifications**: Feedback cho các actions
- **Undo functionality**: Khôi phục strategy đã xóa

## Data Schema

### Strategy Object Structure
```javascript
{
  "id": "uuid-v4",                    // Unique identifier
  "name": "string",                   // Strategy name (required, max 80 chars)
  "description": "string",            // Description (optional, max 800 chars)
  "indicators": ["string"],           // Array of technical indicators
  "timeframes": ["string"],           // Array of timeframes (1m, 5m, 1H, etc.)
  "entry_rules": ["string"],          // Array of entry conditions
  "exit_rules": ["string"],           // Array of exit conditions
  "stoploss_rule": "string",          // Stop loss rule
  "takeprofit_rule": "string",        // Take profit rule
  "position_size_rule": "string",     // Position sizing rule
  "management": {                     // Risk management options
    "trailing_stop": {
      "enabled": boolean,
      "multiplier": "string"
    },
    "scale_out": {
      "enabled": boolean,
      "percent_first": "string"
    },
    "dca": {
      "enabled": boolean
    },
    "manual": {
      "enabled": boolean
    }
  },
  "tags": ["string"],                 // Array of tags for categorization
  "meta": {                          // Metadata
    "createdAt": "ISO-8601",
    "updatedAt": "ISO-8601",
    "version": number
  }
}
```

### LocalStorage Structure
```javascript
// Key: "trading_strategies_v1"
// Value: Array of Strategy objects
[
  { /* Strategy 1 */ },
  { /* Strategy 2 */ },
  // ...
]
```

## API Reference (Internal Methods)

### Core Class: TradingStrategyManager

#### Data Management
```javascript
// Storage operations
loadStrategies()                    // Load from localStorage
saveStrategies()                    // Save to localStorage
generateUUID()                      // Generate unique ID

// CRUD operations
saveCurrentStrategy()               // Create/Update strategy
deleteStrategy()                    // Delete selected strategy
undoDelete()                       // Restore deleted strategy
```

#### UI Management
```javascript
// Rendering
renderStrategyList()               // Render strategy list
showStrategyDetails(strategy)      // Show details in right panel
populateModalContent(strategy)     // Populate modal with strategy data

// Modal controls
openNewStrategyModal()             // Open new strategy modal
openEditStrategyModal()            // Open edit strategy modal
openStrategyModal(id)              // Open details modal
closeModal()                       // Close details modal
closeEditModal()                   // Close edit modal

// Form handling
loadStrategyIntoForm(strategy)     // Load strategy data into form
getFormData()                      // Extract data from form
validateForm()                     // Validate form inputs
```

#### Event Handling
```javascript
setupEventListeners()             // Initialize all event listeners
handleKeyboardShortcuts(event)    // Handle keyboard shortcuts
filterStrategies(searchTerm)      // Filter strategy list
selectStrategy(id)                // Select strategy from list
```

## Input/Output Specifications

### Inputs
1. **User Form Data**
   - Text inputs: name, description, rules
   - Arrays: tags, timeframes, indicators (comma-separated)
   - Checkboxes: management options
   - Numbers: multipliers, percentages

2. **User Actions**
   - Button clicks (New, Delete, Edit, Save, Cancel)
   - Keyboard shortcuts (Ctrl+N, Delete)
   - Search input
   - Strategy selection (click, double-click)

3. **LocalStorage Data**
   - Existing strategies array
   - Persisted user data

### Outputs
1. **Visual Updates**
   - Strategy list rendering
   - Details panel updates
   - Modal displays
   - Toast notifications
   - Form validation messages

2. **Data Persistence**
   - LocalStorage updates
   - Strategy versioning
   - Metadata tracking

3. **User Feedback**
   - Success/error messages
   - Form validation states
   - Loading states
   - Undo notifications

## Extensibility Points

### 1. Data Layer Extensions
```javascript
// Potential additions:
- Server-side API integration
- Database connectivity
- Data export/import functionality
- Backup/restore features
- Data synchronization
```

### 2. UI/UX Enhancements
```javascript
// Potential additions:
- Drag & drop reordering
- Bulk operations
- Advanced filtering/sorting
- Theme customization
- Mobile responsiveness improvements
```

### 3. Feature Extensions
```javascript
// Potential additions:
- Strategy backtesting integration
- Performance analytics
- Strategy templates
- Collaboration features
- Version control for strategies
```

### 4. Integration Points
```javascript
// Potential integrations:
- Trading platforms APIs
- Market data feeds
- Notification systems
- Cloud storage services
- Analytics platforms
```

## Development Guidelines

### Code Organization
- **Single Responsibility**: Each method has one clear purpose
- **Modular Design**: Functions are reusable and composable
- **Event-Driven**: Clean separation of concerns
- **Error Handling**: Graceful degradation and user feedback

### Performance Considerations
- **DOM Manipulation**: Efficient rendering with minimal reflows
- **Memory Management**: Proper cleanup of event listeners
- **Data Processing**: Optimized array operations
- **Storage**: Efficient localStorage usage

### Security Considerations
- **XSS Prevention**: HTML escaping for user inputs
- **Data Validation**: Client-side validation (server-side needed for production)
- **Storage Security**: LocalStorage limitations and considerations

## Browser Compatibility
- **Modern Browsers**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **Features Used**: ES6+ syntax, LocalStorage, CSS Grid/Flexbox
- **Fallbacks**: Graceful degradation for older browsers

## Future Roadmap

### Phase 1: Core Enhancements
- [ ] Advanced search with filters
- [ ] Strategy categories/folders
- [ ] Bulk operations
- [ ] Data export functionality

### Phase 2: Integration
- [ ] Server-side API
- [ ] User authentication
- [ ] Cloud synchronization
- [ ] Real-time collaboration

### Phase 3: Advanced Features
- [ ] Strategy backtesting
- [ ] Performance analytics
- [ ] Template system
- [ ] Mobile application

## Contributing
Khi mở rộng ứng dụng, vui lòng:
1. Tuân thủ coding style hiện tại
2. Thêm documentation cho functions mới
3. Maintain backward compatibility
4. Test thoroughly trên multiple browsers
5. Update README khi thêm features mới

## License
Private project - All rights reserved
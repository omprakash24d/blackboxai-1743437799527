# React Native Document Annotation App

A mobile application for viewing, annotating, and managing PDF documents with AI-powered tools.

## Features

- **Document Management**
  - View and annotate PDF documents
  - Cloud synchronization
  - File organization

- **AI Tools**
  - AI-powered document analysis
  - Smart annotation suggestions
  - Text recognition

- **Security**
  - Secure document handling
  - Authentication system
  - Network security

- **Cross-platform**
  - Works on both iOS and Android
  - Responsive UI components

## Project Structure

```
/project
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── AIToolsPanel.js    # AI tools interface
│   │   └── AnnotationCanvas.js # Document annotation canvas
│   ├── navigation/            # App navigation
│   │   └── AppNavigator.js    # Main navigation setup
│   ├── screens/               # App screens
│   │   ├── AuthScreen.js      # Authentication screen
│   │   ├── HomeScreen.js      # Main dashboard
│   │   └── ViewerScreen.js    # Document viewer
│   └── services/              # Business logic services
│       ├── AIService.js       # AI integration
│       ├── annotationService.js # Annotation logic
│       ├── cloudSyncService.js # Cloud storage
│       ├── fileService.js     # Local file management
│       ├── networkService.js  # API communication
│       ├── pdfService.js      # PDF processing
│       └── securityService.js # Security utilities
├── App.js                     # Main application entry
├── babel.config.js            # Babel configuration
├── package.json               # Project dependencies
└── .env                       # Environment variables
```

## Installation

1. Clone the repository
   ```bash
   git clone [repository-url]
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Configure environment variables
   - Create `.env` file with required keys
   - See `.env.example` for reference

4. Run the app
   ```bash
   # For Android
   npx react-native run-android

   # For iOS
   npx react-native run-ios
   ```

## Configuration

### Babel
The project uses Babel with the following configuration:
- Metro React Native preset
- TypeScript support
- Reanimated plugin
- Environment variables support

### Environment Variables
Required variables:
- `API_BASE_URL`: Base URL for API endpoints
- `AI_SERVICE_KEY`: API key for AI services
- `CLOUD_STORAGE_KEY`: Credentials for cloud storage

## Development

### Running the App
```bash
npx react-native start
npx react-native run-[platform]
```

### Testing
```bash
npm test
```

### Building for Production
```bash
# Android
cd android && ./gradlew assembleRelease

# iOS
cd ios && xcodebuild -workspace App.xcworkspace -scheme App -configuration Release
```

## Dependencies

### Core Libraries
- React Native
- React Navigation
- React Native Reanimated
- React Native PDF

### AI Integration
- TensorFlow.js
- Custom AI service integration

### Utility Libraries
- Axios
- Formik
- React Native Dotenv

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

[MIT](https://choosealicense.com/licenses/mit/)
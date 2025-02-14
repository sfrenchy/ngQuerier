# Querier Angular Frontend

This repository contains the Angular frontend part of the Querier project, a dynamic dashboard builder and database management system. This application provides an intuitive interface for creating and managing dashboards with various types of visualizations.

## Features

- **Dynamic Dashboard Builder**
  - Drag and drop interface for card management
  - Customizable layouts with responsive design
  - Multiple card types:
    - Data Tables
    - Line Charts
    - Pie Charts
    - More to come...

- **Database Connection Management**
  - Configure and manage database connections
  - Dynamic form generation based on JSON schemas
  - Visual query builder (coming soon)

- **Internationalization**
  - Multi-language support (English, French)
  - Extensible translation system

## Tech Stack

- Angular 17+
- TailwindCSS for styling
- NgRx for state management
- Chart.js for data visualization
- RxJS for reactive programming

## Prerequisites

- Node.js (v18+)
- npm or yarn
- Angular CLI (`npm install -g @angular/cli`)

## Getting Started

1. Clone the repository

```bash
git clone https://github.com/yourusername/ngQuerier.git
```

2. Install dependencies

```bash
cd ngQuerier
npm install
```

3. Start the development server

```bash
ng serve
```

The application will be available at `http://localhost:4200`

## Project Structure

```
src/
├── app/
│   ├── cards/              # Card components (charts, tables, etc.)
│   ├── shared/            
│   │   ├── components/     # Reusable components
│   │   ├── directives/     # Custom directives
│   │   └── pipes/         # Custom pipes
│   ├── services/          # Application services
│   └── models/            # TypeScript interfaces and types
├── assets/
│   └── i18n/             # Translation files
└── styles/               # Global styles and themes
```

## Development

### Adding a New Card Type

The project includes a custom schematic to generate new card types. To create a new card:

```bash
ng generate card <card-name>
```

This will automatically:

1. Create a new component in the `cards` directory with the proper structure
2. Implement the base card interface
3. Set up the configuration options
4. Register the card in the card factory service
5. Create the necessary service and model files
6. Add translation files

After generation, you can customize the card implementation according to your needs.

### Adding New Features

1. Create necessary components, services, and models
2. Follow Angular best practices and coding standards
3. Add unit tests for new functionality
4. Update translations if needed

### Building for Production

```bash
ng build --configuration production
```

The build artifacts will be stored in the `dist/` directory.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Related Projects

- [Querier API](https://github.com/sfrenchy/Querier) - The .NET Core backend API

## License

This project is licensed under the MIT License - see the LICENSE file for details.

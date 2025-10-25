# BlockQuest

A decentralized AI model commitment and staking platform built with blockchain technology.

## Project Structure

- **blockquest/**: Backend services including registrar, smart contracts, and infrastructure
- **frontend/**: Next.js web application for user interface
- **smart-contracts/**: Solidity smart contracts for blockchain interactions
- **infra/**: Docker and deployment configurations

## Features

- AI model commitment registration
- Staking and challenge system
- Blockchain anchoring
- Decentralized identity management
- Real-time dashboard and analytics

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- Docker (optional)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/hash066/blockquest.git
cd blockquest
```

2. Install dependencies:
```bash
# Backend
cd blockquest/registrar
npm install

# Frontend
cd ../../frontend
npm install
```

3. Set up environment variables (see Deployment section)

4. Start the services:
```bash
# Backend
cd blockquest/registrar
node server.js

# Frontend
cd frontend
npm run dev
```

## Deployment

See environment variables section below for required configuration.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License

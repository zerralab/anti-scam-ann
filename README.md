# Reliable Ann (防詐小安)

**Reliable Ann (防詐小安)**  is an open-source web application and LINE chatbot designed to assist users in identifying and responding to scams. With the empathetic persona, Ann  provides a supportive platform for scam prevention. 

🌐 **Demo HomePage**: [https://www.reliableann.com/](https://www.reliableann.com/)
🌐 [GPTs](https://chatgpt.com/g/g-67c6f94123908191b78d6bf552d0803f-fang-zha-xiao-an)

## Project Overview

This project combines a Python FastAPI backend with a React+TypeScript frontend to deliver a web-based landing page and a LINE chatbot (under development). The backend leverages OpenAI’s GPT-4 for scam detection and emotional support, while the frontend uses Tailwind CSS and shadcn UI for a warm, accessible design. The LINE Messaging API enables chatbot functionality.

For product details, including core features like scam identification and reporting guidance, refer to PRD.md.

## Technical Stack

- **Frontend**:
  - React + TypeScript
  - Tailwind CSS + shadcn UI
  - Package Manager: `yarn`
  - Development Server: Vite (port 5173, proxies API requests to backend on port 8000)
- **Backend**:
  - Python + FastAPI
  - Package Manager: `uv`
  - AI Model: OpenAI GPT-4
  - Platform: LINE Messaging API
  - Server Port: 8000
- **Deployment**: Databutton platform

## Quickstart

### Prerequisites

- Node.js (v18 or later) for frontend
- Python (3.10 or later) for backend
- `yarn` and `uv` installed globally
- Environment variables (see Environment Setup)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/zerralab/anti-scam-ann.git
   cd fraudguard
   ```

2. Install dependencies:

   ```bash
   make
   ```

### Running the Application

1. Start the backend server (port 8000):

   ```bash
   make run-backend
   ```

2. In a separate terminal, start the frontend development server (port 5173):

   ```bash
   make run-frontend
   ```

3. Visit http://localhost:5173 to view the application.

**Note**: The Vite frontend server proxies API requests to the backend on port 8000.

## Environment Setup

Configure the following environment variables in a `.env` file or your system:

- `ANTHROPIC_API_KEY`: API key for Anthropic (if used for additional AI features)
- `OPENAI_API_KEY`: API key for OpenAI GPT-4
- `LINE_CHANNEL_ACCESS_TOKEN`: LINE Messaging API access token
- `LINE_CHANNEL_SECRET`: LINE channel secret
- `LINE_CHANNEL_ID`: LINE channel ID
- `LINE_RELAY_API_KEY`: API key for LINE relay service

Example `.env` file:

```bash
ANTHROPIC_API_KEY=your-anthropic-key
OPENAI_API_KEY=your-openai-key
LINE_CHANNEL_ACCESS_TOKEN=your-line-token
LINE_CHANNEL_SECRET=your-line-secret
LINE_CHANNEL_ID=your-line-id
LINE_RELAY_API_KEY=your-relay-key
```

## System Architecture

### Frontend Pages

- **Home/Landing Page**: Introduces Ann and her features
- **Web-based Chatbot**: Interactive interface for testing scam detection
- **System Configuration**: Admin panel for settings
- **Keyword Management**: Interface for managing scam-related keywords
- **API Usage Management**: Tracks API usage
- **Malicious Behavior Monitoring**: Monitors system abuse

### Backend APIs

- `/ai_conversation`: Powers AI-driven conversations
- `/scam_detector`: Analyzes messages for scam risks
- `/emotional_support`: Provides empathetic responses
- `/keyword_match`: Matches scam-related keywords
- `/line_relay`: Processes LINE messages
- `/abuse_management`: Monitors and prevents system abuse

## Development Notes

- **Frontend**: The Vite server (port 5173) proxies API requests to the backend (port 8000). Ensure both servers are running for full functionality.
- **Backend**: The FastAPI server uses `uv` for dependency management. Run `uv sync` to update dependencies.
- **LINE Bot**: The LINE Bot is under development. The current demo at https://www.reliableann.com/ uses a GPT-based interface.

## Contribution Guidelines

We welcome contributions to improve 小安’s scam prevention capabilities. Key areas for contribution include:

- Enhancing scam detection algorithms
- Adding multilingual support
- Improving accessibility (e.g., ARIA compliance)
- Optimizing performance (e.g., reducing API latency)

To contribute:

1. Fork the repository and create a feature branch (e.g., `feature/scam-detection`).
2. Follow the code style (e.g., Prettier for frontend, Black for backend).
3. Test changes locally with both servers running.
4. Submit a Pull Request with a clear description of your changes.
5. For major changes, open a GitHub Issue first to discuss.

See CONTRIBUTING.md for details.

## License

This project is licensed under the MIT License for non-commercial use. You are free to use, modify, and distribute the code, provided you retain the original copyright notice and license text.

**For commercial use**, a paid license is required. Please contact [zerralee.lab@gmail.com] to obtain a commercial license and discuss licensing fees.

See LICENSE and COMMERCIAL_LICENSE.md for details.

## Contact

For technical support or inquiries, email [zerralee.lab@gmail.com] or open a GitHub Issue.

## Emergency Resources

- **Anti-Fraud Hotline**: 165 (Taiwan)
- **Psychological Support Hotline**: 1995 (Taiwan)
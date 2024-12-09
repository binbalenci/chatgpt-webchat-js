# ChatGPT Web Chat

A simple, interactive Javascript web chat interface to communicate with ChatGPT.

## Features

- **Interactive Chat**: Chat with ChatGPT through a clean and responsive web interface.
- **Code Formatting**: Displays code responses with syntax highlighting.
- **Thinking Message**: Displays a "Thinking..." message while waiting for a response.
- **Export Chat**: Export the entire chat log to a text file.

## Installation

To get started with this project, clone the repository and install the necessary dependencies:

```bash
npm install
```

## Instructions

1. Add a `.env` file and add a variable named `API_KEY` with the value of your ChatGPT API key (has to be a have credit balance)

```bash
API_KEY=your-chatgpt-api-key
```

2. Start the application

```bash
npm run dev
```

## Usage

Simply start chatting. This project uses `marked.js` to format the response so it can be displayed nicely. You can press the **Export** button to download the chat log in `txt` format.

> Keep in mind that you lost all the chat when refreshing your browser!!!

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

# Hypertoons Wallet Checker

A simple web application to check if a wallet address is on the Hypertoons OG or Whitelist.

## Features

- Check if a wallet is on the OG list
- Check if a wallet is on the Whitelist
- Instant verification
- Beautiful UI with animations
- Mobile responsive

## Technology Stack

- React
- Tailwind CSS
- Vite

## Project Structure

```
hypertoons-wallet-checker/
├── src/
│   ├── components/
│   │   └── WalletChecker.jsx   # Main wallet checking component
│   ├── data/
│   │   ├── og-allowlist.json   # OG wallet addresses
│   │   └── wl-allowlist.json   # Whitelist addresses
│   ├── App.jsx                 # Main app component
│   └── main.jsx               # Entry point
├── public/
│   └── images/                # Static images
├── index.html
└── README.md
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open http://localhost:5173 in your browser

## Usage

1. Enter a wallet address in the input field
2. Click "Check Wallet Status"
3. The result will show if the wallet is:
   - On the OG list (⭐)
   - On the Whitelist (🎯)
   - Not on any list (❌)

## Contributing

Feel free to submit issues and enhancement requests! 
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/system32miro/AI-personal-finance-simulator)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/system32miro/AI-personal-finance-simulator/graphs/commit-activity)

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

# Finance Simulator 💰

A modern web application for personal finance analysis and management, built with React, TypeScript and powered by AI.

## 🚀 Features

- Detailed financial transaction analysis
- AI-powered personalized recommendations
- Spending pattern insights
- Modern and intuitive interface
- Full English language support

## 🛠️ Technologies

- React + TypeScript
- Vite
- Tailwind CSS
- Supabase (Backend as a Service)
- Groq AI (Mistral 7B Model)

## 📋 Prerequisites

- Node.js (version 16 or higher)
- npm or bun

## 🔧 Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd simulador-financas
```

2. Install dependencies:
```bash
npm install
# or
bun install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Fill the `.env` file with your credentials:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key
- `VITE_GROQ_API_KEY`: Groq API key

4. Start the development server:
```bash
npm run dev
# or
bun dev
```

## 🔒 Security

- All API keys are managed through environment variables
- Secure authentication via Supabase
- Automatic token and session management

## 📦 Project Structure

```
├── src/
│   ├── components/     # Reusable React components
│   ├── pages/         # Application pages
│   ├── integrations/  # Integrations (Supabase, Groq)
│   ├── hooks/         # Custom React hooks
│   ├── types/         # TypeScript type definitions
│   └── lib/           # Utilities and configurations
├── public/            # Static resources
└── supabase/          # Supabase configurations
```

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Development Notes

- Use `npm run build` or `bun run build` to create the production version
- Project follows TypeScript best practices
- Uses Tailwind for styling
- Implements AI analysis via Groq for financial insights

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## 🗄️ Database (Supabase)

### Structure
The project uses Supabase as backend, with the following main tables:

1. **user_profiles**
   - User profile
   - Preferences (currency, theme, language)
   - Notification settings
   - Monthly budget

2. **transactions**
   - Financial transaction records
   - Expense/income categorization
   - Time history
   - User linking

3. **financial_goals**
   - User financial goals
   - Savings progress
   - Visual customization (colors)

4. **auth_rate_limits**
   - Authentication attempt control
   - Brute force protection

### Initial Setup

1. Create a new Supabase project
2. Run the initialization script:
   ```bash
   cd supabase
   supabase db push
   ```
   Or manually copy and execute the contents of `supabase/init.sql` in the SQL Editor.

### Security

The project implements:
- Row Level Security (RLS) on all tables
- User-based access policies
- Automatic session management
- Brute force protection
- Automatic rate limiting data cleanup

### Automatic Functions

- `handle_new_user()`: Creates automatic profile for new users
- `handle_updated_at()`: Automatically updates timestamps
- `cleanup_rate_limits()`: Cleans up old login attempt records

### Access Policies

- Users can only view and modify their own data
- Transactions and financial goals are private
- User profiles have controlled access

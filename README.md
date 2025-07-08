# Medication Reminder App

A full-stack web application built with React, TypeScript, and Supabase to help patients track their medications and notify caretakers about missed doses.

## 🚀 Features

- **User Authentication**: Secure login/signup with Supabase Auth
- **Medication Management**: Add, view, and delete medications with dosage and timing information
- **Daily Tracking**: Mark medications as taken each day
- **Caretaker Notifications**: Email alerts when medications are missed via SendGrid
- **Automated Scheduling**: Cron jobs to check for missed medications daily
- **Responsive Design**: Modern UI built with Tailwind CSS
- **Type Safety**: Full TypeScript implementation with proper typing
- **Production Ready**: Deployed to Vercel with full email integration

## 🛠️ Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Email Service**: SendGrid for medication reminder notifications
- **Form Validation**: React Hook Form + Zod
- **Icons**: Lucide React
- **Deployment**: Vercel-ready with API routes
- **Scheduling**: GitHub Actions / Vercel Cron for automated checks

## 📋 Prerequisites

Before running this application, make sure you have:

- Node.js 18+ installed
- A Supabase account and project
- Git installed

## 🔧 Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd medication-reminder-app
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API to get your credentials
3. In the SQL Editor, run the schema from `supabase-schema.sql`

### 4. Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Server-side Supabase key (for API routes)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Email Service Configuration (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key_here

# Cron Job Security
CRON_SECRET=your_random_secret_key_here
```

Replace the values with your actual credentials:
- Get Supabase credentials from your project dashboard
- Get SendGrid API key from [sendgrid.com](https://sendgrid.com)
- Generate a random string for CRON_SECRET

### 5. Email Setup

For full email functionality, follow the detailed guide in `EMAIL_SETUP.md`.

### 6. Run the development server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 🗄️ Database Schema

The application uses three main tables:

- **profiles**: User profile information including caretaker email
- **medications**: Medication details (name, dosage, time)
- **medication_logs**: Daily tracking records

## 📱 Usage

### For Patients:
1. Sign up or log in to your account
2. Add your medications with name, dosage, and time
3. Mark medications as taken each day
4. View your medication list and tracking history

### For Caretakers:
1. When setting up the patient account, add your email as the caretaker
2. Receive notifications when medications are missed
3. Both patient and caretaker can use the same login for simplicity

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy!

### Deploy to Netlify

1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Add environment variables in Netlify dashboard

## 🔒 Security Features

- Row Level Security (RLS) enabled on all tables
- User data isolation - users can only access their own data
- Input validation with Zod schemas
- Secure authentication with Supabase Auth

## 🧪 Testing

```bash
# Run type checking
npm run lint

# Build for production (also runs type checking)
npm run build
```

## 📄 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check that all environment variables are correctly set
2. Ensure your Supabase project has the correct schema
3. Verify that RLS policies are properly configured
4. Check the browser console for any error messages

## 🔮 Future Enhancements

- [ ] Push notifications for mobile devices
- [ ] Medication reminder scheduling
- [ ] Multiple caretaker support
- [ ] Medication history analytics
- [ ] Integration with pharmacy APIs
- [ ] Offline support with service workers

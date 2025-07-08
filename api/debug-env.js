export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const config = {
      supabase_url: process.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing',
      supabase_anon_key: process.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
      supabase_service_key: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing',
      sendgrid_api_key: process.env.SENDGRID_API_KEY ? '✅ Set' : '❌ Missing',
      cron_secret: process.env.CRON_SECRET ? '✅ Set' : '❌ Missing',
      timestamp: new Date().toISOString()
    }

    const allConfigured = Object.values(config).every(value => value.includes('✅'))

    res.status(200).json({
      status: allConfigured ? 'All configured' : 'Missing configuration',
      config,
      next_steps: allConfigured ? [
        'Configuration looks good!',
        'Make sure your caretaker email is set in your profile',
        'Test the email functionality in the app'
      ] : [
        'Add missing environment variables to .env file',
        'Get SendGrid API key from https://sendgrid.com',
        'Get Supabase service role key from dashboard',
        'Restart your dev server after adding variables'
      ]
    })
  } catch (error) {
    res.status(500).json({ 
      message: 'Debug check failed',
      error: error.message 
    })
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { to, from, subject, html } = req.body

    if (!to || !subject || !html) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    const sgMail = require('@sendgrid/mail')
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)

    const msg = {
      to,
      from: from || 'noreply@yourdomain.com',
      subject,
      html,
    }

    await sgMail.send(msg)
    
    res.status(200).json({ message: 'Email sent successfully' })
  } catch (error) {
    console.error('Email sending error:', error)
    res.status(500).json({ 
      message: 'Failed to send email',
      error: error.message 
    })
  }
}

# Invoice Generator API Setup Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Get Your API Key
1. Go to https://invoice-generator.com
2. Click "Sign Up" (it's free!)
3. Verify your email
4. Go to Dashboard → API Settings
5. Copy your API key

### Step 2: Add API Key to Your Project
1. Open your `.env` file (in the root folder)
2. Add this line (replace with your actual key):
```
VITE_INVOICE_API_KEY=your_api_key_here
```

### Step 3: Restart Your Dev Server
```bash
npm run dev
```

## ✅ That's It! You're Ready!

### How It Works Now:
- **Blue Download Button** → Uses Invoice Generator API (professional quality)
- **Green Eye Button** → Uses your local jsPDF generator (backup)
- **Automatic Fallback** → If API fails, it automatically uses local generator

### Free Tier Limits:
- ✅ 500 invoices per month
- ✅ Professional templates
- ✅ No watermarks
- ✅ Custom branding

### If You Want to Upgrade Later:
- **Pro Plan ($9/month)** → 5,000 invoices + custom logo
- **Business Plan ($29/month)** → 25,000 invoices + white-label

## 🔧 Testing

1. Go to your app → Projects → Invoice tab
2. Click the blue download button
3. Should generate a professional PDF instantly!

## 🆘 Troubleshooting

### If API doesn't work:
1. Check your API key in `.env` file
2. Make sure you restarted the dev server
3. Check browser console for errors
4. The green button (local generator) will always work as backup

### Support:
- Invoice Generator API: https://invoice-generator.com/support
- Your local backup generator will always work even if API is down

## 🎨 Customization Options (Pro Plan)

When you upgrade to Pro plan, you can:
- Upload your custom logo
- Change colors and branding
- Use different templates
- Add custom fields

The integration is already set up to support all these features!
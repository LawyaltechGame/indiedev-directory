# Appwrite Authentication Setup Guide

## 🚀 Quick Start

This guide will help you set up Appwrite authentication for the IndieDev Directory application.

## 📋 Prerequisites

1. An Appwrite account (sign up at https://cloud.appwrite.io)
2. A new Appwrite project created

## 🔧 Step-by-Step Setup

### 1. Get Your Appwrite Credentials

1. Go to https://cloud.appwrite.io
2. Create a new project or select an existing one
3. Go to **Settings** → **Project Settings**
4. Copy your **Project ID**

### 2. Configure Environment Variables

1. Create a `.env` file in the root of your project:

```env
VITE_APPWRITE_PROJECT_ID=YOUR_PROJECT_ID_HERE
```

Replace `YOUR_PROJECT_ID_HERE` with your actual project ID from Appwrite.

### 3. Configure Appwrite Authentication

1. In your Appwrite console, go to **Auth** → **Settings**
2. Configure the following:

#### Email/Password Authentication
- Enable **Email/Password** authentication
- Set up **Password** requirements
- Configure email verification (optional for development)

#### OAuth Providers (Optional)
- Go to **Auth** → **Providers**
- Enable the providers you want to use:
  - **Google OAuth**
  - **GitHub OAuth**
  - **Discord OAuth**

For each provider, you'll need to:
1. Create credentials in the respective provider's developer console
2. Add the credentials to Appwrite
3. Set the redirect URLs:
   - `http://localhost:5173/auth/callback` (development)
   - `https://yourdomain.com/auth/callback` (production)

### 4. Configure Redirect URLs

In your Appwrite console under **Auth** → **Settings**:

Add these redirect URLs:
- `http://localhost:5173/auth/callback` (for local development)
- `https://yourdomain.com/auth/callback` (for production)

### 5. Update Appwrite Configuration

Edit `src/config/appwrite.ts` if you need to change the endpoint or use a self-hosted instance:

```typescript
const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1') // or your self-hosted URL
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);
```

### 6. Run the Application

```bash
npm run dev
```

## ✨ Features Implemented

### Authentication Features
- ✅ Email/Password Registration
- ✅ Email/Password Login
- ✅ OAuth Login (Google, GitHub, Discord)
- ✅ User Session Management
- ✅ Logout Functionality
- ✅ Protected UI (shows different content for logged in users)

### User Interface
- ✅ Login Modal with email/password
- ✅ Signup Modal with validation
- ✅ OAuth provider buttons
- ✅ User profile display in header
- ✅ Conditional rendering based on auth state

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit your `.env` file
2. **Password Strength**: Minimum 8 characters required
3. **HTTPS**: Use HTTPS in production
4. **Session Management**: Sessions are managed automatically by Appwrite
5. **OAuth**: Use secure OAuth credentials from provider dashboards

## 🐛 Troubleshooting

### Common Issues

#### 1. "Project ID not found"
- Make sure your `.env` file exists and has the correct `VITE_APPWRITE_PROJECT_ID`
- Restart your dev server after adding environment variables

#### 2. OAuth not working
- Check that redirect URLs are properly configured in Appwrite
- Verify OAuth credentials are correct in both Appwrite and the provider (Google, GitHub, etc.)

#### 3. CORS errors
- Make sure your domain is added to Appwrite's allowed domains
- Check that redirect URLs match exactly

#### 4. Login fails with "User not found"
- Make sure you're using the correct email/password
- Check that the user exists in Appwrite's Auth dashboard

## 📚 Additional Resources

- [Appwrite Documentation](https://appwrite.io/docs)
- [Appwrite Authentication Docs](https://appwrite.io/docs/products/auth)
- [OAuth Providers Setup](https://appwrite.io/docs/products/auth/oauth)

## 🎯 Next Steps

After setting up authentication, you can:

1. **Connect to Database**: Store user profiles in Appwrite Databases
2. **File Storage**: Allow users to upload studio logos/images
3. **Realtime Updates**: Use Appwrite Realtime for live updates
4. **Permissions**: Set up collections and permissions for user data

## 💡 Need Help?

If you encounter any issues:
1. Check the browser console for errors
2. Verify your Appwrite configuration
3. Review the Appwrite dashboard for user activity
4. Check the network tab in dev tools for API responses

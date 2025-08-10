# 🚀 Supabase Migration Guide - Addiction Recovery App

This guide will help you migrate from MongoDB to Supabase for your addiction recovery app.

## 📋 Table of Contents
1. [Supabase Project Setup](#supabase-project-setup)
2. [Database Schema Setup](#database-schema-setup)
3. [Environment Configuration](#environment-configuration)
4. [Frontend Integration](#frontend-integration)
5. [Component Updates](#component-updates)
6. [Testing & Verification](#testing--verification)
7. [Deployment](#deployment)

## 🏗️ Supabase Project Setup

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up/Login with GitHub
4. Click "New Project"
5. Choose your organization
6. Fill in project details:
   - **Name**: `addiction-recovery-app`
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your users
7. Click "Create new project"
8. Wait for project to be ready (2-3 minutes)

### Step 2: Get Project Credentials
1. Go to Settings > API
2. Copy your project credentials:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (for admin operations)

## 🗄️ Database Schema Setup

### Step 1: Run Database Schema
1. Go to SQL Editor in your Supabase dashboard
2. Copy the entire content from `supabase-schema.sql`
3. Paste it in the SQL Editor
4. Click "Run" to execute the schema
5. Verify all tables are created in Table Editor

### Step 2: Enable Real-time (Optional)
1. Go to Database > Replication
2. Enable real-time for these tables:
   - `messages`
   - `notifications`
   - `reel_likes`
   - `reel_comments`

### Step 3: Configure Authentication
1. Go to Authentication > Settings
2. Configure these settings:
   - **Site URL**: `http://localhost:8085` (for development)
   - **Redirect URLs**: Add your production domain when ready
   - **Email Templates**: Customize if needed
   - **Providers**: Enable email/password (default)

## ⚙️ Environment Configuration

### Step 1: Create Environment File
Create `.env.local` in your project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Service Role Key (for admin operations)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# App Configuration
VITE_APP_NAME="Addiction Recovery App"
VITE_APP_VERSION="2.0.0"
```

### Step 2: Update .gitignore
Add to `.gitignore`:
```
.env.local
.env.production
```

## 🔧 Frontend Integration

### Step 1: Update App.tsx
Replace your current App.tsx with Supabase integration:

```tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import SupabaseLoginPage from '@/pages/SupabaseLoginPage';
import SupabaseChatPage from '@/pages/SupabaseChatPage';
import SupabaseAdminDashboard from '@/components/SupabaseAdminDashboard';
// ... other imports

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useSupabaseAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  return user ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <SupabaseAuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<SupabaseLoginPage />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <SupabaseAdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/chat" element={
            <ProtectedRoute>
              <SupabaseChatPage />
            </ProtectedRoute>
          } />
          {/* Add other protected routes */}
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </SupabaseAuthProvider>
  );
}

export default App;
```

### Step 2: Update Main.tsx
Ensure Supabase context is available:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

## 🔄 Component Updates

### Step 1: Replace Authentication Components
- Replace `LoginPage` with `SupabaseLoginPage`
- Replace `AuthContext` with `SupabaseAuthContext`
- Update all auth-related imports

### Step 2: Update Chat Components
- Replace `MERNChatPage` with `SupabaseChatPage`
- Update chat-related API calls to use `supabaseApi`

### Step 3: Update Admin Dashboard
- Replace MongoDB admin with `SupabaseAdminDashboard`
- Update admin routes and permissions

### Step 4: Update Other Components
Update these components to use Supabase:

#### AchievementsPage Counter Updates:
```tsx
import { adminAPI } from '@/services/supabaseApi';

const fetchStats = async () => {
  const stats = await adminAPI.getPlatformStats();
  // Update counters with stats.users, stats.reels, stats.messages
};
```

#### ReelsPage Updates:
```tsx
import { reelsAPI } from '@/services/supabaseApi';

const fetchReels = async () => {
  const { data, error } = await reelsAPI.getReels();
  if (data) setReels(data);
};
```

## 🧪 Testing & Verification

### Step 1: Test Authentication
1. Start your development server: `npm run dev`
2. Go to `/login`
3. Test registration with a new account
4. Check Supabase Authentication tab for new user
5. Test login with created account
6. Verify JWT token in browser storage

### Step 2: Test Database Operations
1. Create a test user profile
2. Test chat functionality
3. Test real-time message updates
4. Verify data in Supabase Table Editor

### Step 3: Test Admin Dashboard
1. Update a user's role to 'admin' in Supabase
2. Login with admin account
3. Go to `/admin`
4. Verify admin dashboard loads with data

## 🚀 Deployment

### Step 1: Update Production Environment
1. Add production domain to Supabase Auth settings
2. Update environment variables for production
3. Configure CORS if needed

### Step 2: Deploy Frontend
```bash
npm run build
# Deploy to your hosting platform (Netlify, Vercel, etc.)
```

### Step 3: Configure Production Database
1. Review Row Level Security policies
2. Set up database backups
3. Monitor performance

## 📊 Migration Benefits

### ✅ What You Gain with Supabase:
- **Built-in Authentication**: JWT, email verification, password reset
- **Real-time Features**: Live chat, notifications, live updates
- **PostgreSQL Database**: More robust than MongoDB for relational data
- **Admin Dashboard**: Built-in database management
- **Automatic API Generation**: REST and GraphQL APIs
- **Row Level Security**: Fine-grained access control
- **Scalability**: Auto-scaling infrastructure
- **Backup & Recovery**: Automated backups

### 🔄 Migration Checklist:
- [ ] Supabase project created
- [ ] Database schema executed
- [ ] Environment variables configured
- [ ] Authentication context updated
- [ ] Login page migrated
- [ ] Chat page migrated
- [ ] Admin dashboard migrated
- [ ] API services updated
- [ ] Real-time features working
- [ ] Testing completed
- [ ] Production deployment ready

## 🆘 Troubleshooting

### Common Issues:

#### 1. Authentication Errors
```
Error: Invalid JWT token
```
**Solution**: Check environment variables and ensure anon key is correct.

#### 2. Database Connection Issues
```
Error: relation "profiles" does not exist
```
**Solution**: Ensure database schema was executed successfully.

#### 3. Real-time Not Working
```
Real-time subscriptions not receiving updates
```
**Solution**: Enable real-time replication for required tables.

#### 4. CORS Errors
```
Access to fetch blocked by CORS policy
```
**Solution**: Add your domain to allowed origins in Supabase settings.

## 📞 Support

- **Supabase Docs**: [docs.supabase.com](https://docs.supabase.com)
- **Community**: [github.com/supabase/supabase/discussions](https://github.com/supabase/supabase/discussions)
- **Discord**: [discord.supabase.com](https://discord.supabase.com)

---

## 🎉 Next Steps After Migration

Once migration is complete, you can enhance your app with:

1. **Advanced Real-time Features**
   - Typing indicators
   - Online presence
   - Live notifications

2. **Enhanced Security**
   - Multi-factor authentication
   - Advanced RLS policies
   - Audit logging

3. **Performance Optimization**
   - Database indexing
   - Query optimization
   - Caching strategies

4. **Additional Features**
   - File uploads with Supabase Storage
   - Edge functions for serverless logic
   - Advanced analytics

Your addiction recovery app will be more robust, scalable, and feature-rich with Supabase! 🚀

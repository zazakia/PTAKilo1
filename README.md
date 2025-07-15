# Vel PTA Management Web App

A comprehensive web application for managing Parent-Teacher Association (PTA) payments, expenses, and reporting for Vel Elementary School.

## 🎯 Overview

This application streamlines PTA financial management by providing:
- **Multi-role access** for Admin, Principal, Teachers, Treasurers, and Parents
- **Automated payment tracking** with parent-student linking
- **Receipt management** with secure cloud storage
- **Real-time reporting** and KPI dashboards
- **Comprehensive audit trails** for transparency

## 🛠️ Technology Stack

- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **ORM:** Prisma for type-safe database operations
- **UI Components:** Headless UI + Heroicons
- **Forms:** React Hook Form + Zod validation
- **Charts:** Recharts for data visualization
- **Deployment:** Vercel

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pta-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. **Setup database**
   - Run the migration script in your Supabase SQL editor:
   ```bash
   # Copy contents of database-migration.sql to Supabase SQL Editor
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 👥 User Roles & Access

### Admin (cybergada@gmail.com)
- Full system access
- User management
- System configuration
- All reports and analytics

### Principal
- View all financial reports
- Access KPI dashboards
- Monitor school-wide payment status
- Export reports for auditing

### Teachers
- View payment status for their assigned classes
- Monitor student payment compliance
- Access class-specific reports

### Treasurer/Assistant
- Record income and expense transactions
- Upload and manage receipts
- Issue payment confirmations
- Manage parent and student records

### Parents/Guardians
- View payment history
- Access receipts
- Update contact information
- View children's payment status

## 💰 Key Features

### Income Management
- **PTA Contribution Fee:** ₱250 one-time payment per family
- **Per-student fees:** SPG, supplies, field trips, etc.
- **Automatic status updates:** All children marked paid for family fees
- **Receipt generation:** Digital and physical receipt options

### Expense Tracking
- **Categorized expenses:** Guards, snacks, supplies, maintenance
- **Budget monitoring:** Track spending against category limits
- **Approval workflow:** Multi-level expense approval
- **Receipt attachment:** Secure storage of expense receipts

### Reporting & Analytics
- **Real-time dashboards:** Live KPI monitoring
- **Payment status reports:** Per-class and school-wide views
- **Financial summaries:** Income vs expenses analysis
- **Audit trails:** Complete transaction history
- **Export capabilities:** PDF and Excel export options

## 📊 Database Schema

The application uses PostgreSQL with the `ptaVOID_` prefix for all tables:

### Core Tables
- `ptaVOID_users` - User authentication and roles
- `ptaVOID_parents` - Parent/guardian information
- `ptaVOID_students` - Student records
- `ptaVOID_teachers` - Teacher information
- `ptaVOID_grades` - Grade/year levels
- `ptaVOID_sections` - Class sections
- `ptaVOID_income_categories` - Income types
- `ptaVOID_expense_categories` - Expense types
- `ptaVOID_income_transactions` - Payment records
- `ptaVOID_expense_transactions` - Expense records
- `ptaVOID_receipts` - File attachments
- `ptaVOID_audit_logs` - Transaction audit trail

### Key Relationships
- One parent can have multiple students
- PTA contribution fee payment covers all children in family
- Other fees are charged per student
- All transactions have audit trails
- Receipts are linked to transactions

## 🔐 Security Features

### Authentication
- Supabase Auth integration
- Role-based access control
- Secure session management
- Password reset functionality

### Data Protection
- Row Level Security (RLS) policies
- Encrypted file storage
- Input validation and sanitization
- SQL injection prevention

### Audit & Compliance
- Complete transaction logging
- User activity tracking
- Data change history
- Export capabilities for audits

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- Print-friendly layouts for reports

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run integration tests
npm run test:integration

# Run end-to-end tests
npm run test:e2e
```

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production
```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
NEXTAUTH_SECRET=your_production_secret
NEXTAUTH_URL=https://your-domain.com
```

## 📚 Documentation

- [API Documentation](docs/api.md)
- [User Guide](docs/user-guide.md)
- [Deployment Guide](docs/deployment.md)
- [Troubleshooting](docs/troubleshooting.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Email: cybergada@gmail.com
- Create an issue in the GitHub repository
- Check the troubleshooting guide

## 🔄 Version History

### v1.0.0 (Current)
- Initial release
- Core PTA management functionality
- Multi-role authentication
- Income and expense tracking
- Reporting and analytics
- Receipt management

## 🎯 Roadmap

### Future Enhancements
- Mobile app development
- SMS notifications
- Online payment integration
- Advanced analytics
- Multi-school support
- API for third-party integrations

---

**Developed for Vel Elementary School PTA Management**
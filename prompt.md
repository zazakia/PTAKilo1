 Vel PTA Management Web App – PRD & Developer Specification
analyze all files and make a  plan and suggestions. make plan.md and todo.md use this as your guide and make task done. Continue building web app end to end and work more autonomous dont keep  asking me only very important things, help with file analysis, editing, bash commands and  git
## 📌 1. Overview

### **Problem Statement**

Manual tracking of PTA payments is inefficient:

- the teacher is having a hard time to know which students has paid to remind them.
- The treasurer is having a hard time to keep track of all the payments received and issued receipts.
- The system lacks flexibility for managing various types of income and expenses.
- Limited reporting capabilities for principals and PTA officers.
- Lack of transparency and auditing clarity.
- No real-time reporting for principals, teachers, PTA officers.
- There's no easy way to generate reports for principals and PTA officers.
- It's difficult to manage different types of income such as SPG per student and other type of collection income.
- Expense management lacks proper categorization and also income categories.
- Audit trails are limited; it's challenging to trace transactions accurately.
- Lacks transparency and auditing clarity.
- No real-time reporting for principals, teachers, PTA officers.
- one parent can have multiple students but only one payment for the pta contribution fee this is income.   There are other categories of income. so make a crud also for income category.
- crud for teacher-section, parent-guardian, students, grade also.


### **Objective**


## 👥 2. Users

- **Parents / Guardians:** Pay PTA contributions.  
- **Teachers:** Monitor class payment statuses.  
- **Treasurer / Assistant:** Record and receive payments.  
- **Principal / PTA Officers:** View reports and KPI dashboards.
-**Admin account full access cybergada@gmail.com password Qweasd145698@

---

## 💡 3. Key Features

### **3.1 Income Workflow**

1. **Parents Pay - income form flow:**  
  - payment form or income form should be able to add new parents and studensts and link parent and one or many students. and other data needed in income form can be add with entering the income form.
---
   - **PTA contribution fee of Php 250 one-time payment per family/parent/guardian.**
   - Multiple students under the same parent are marked as paid upon single payment.
   and other types of income like SPG per student and other type of collection income per student.

2. **Receive Payment:**  
   - Treasurer/assistant receives and records payment.
   - Issues receipt (physical or digital).

3. **Record Collection:**  
   - Payment is linked to parent/guardian.  
   - System updates **all student records under that parent as paid** for PTA contribution fees. but other income is per student.

4. **Live Reporting:**  
   - KPI dashboards for principal and PTA officers:
     - Total collections
     - Per class paid/unpaid students

5. **Detailed Reports:**  
   - Teachers see payment status per student in class/section.

6. **Upload recipts :**
   - per transaction upload receipts for both income and expenses.
   - Receipts are stored securely in cloud storage.

---

### **3.2 Expenses Workflow**

- Record expenses by category/account (e.g. guards, snacks).
- uploading of receipts for expenses.
- Live reporting for principal and PTA officers:
  - Total expenses
  - Per category/account breakdown
- Detailed reports for teachers:
  - Expenses incurred per student/class.
- Audit trails for accurate transaction tracing.
- Export expense reports for audit.

---

## 🗃️ 4. Data Relationships

- **Parent/Guardian → Students:** One-to-many.
- **Payment → Parent/Guardian:** One-to-one per school year.

When a parent/guardian payment is recorded for PTA Contribution Fee:

✅ All students linked to them are marked as paid for PTA Contribution Fee.

---

## 🔐 5. Technical Requirements

### **Framework & Stack**

- **Frontend:** Next.js + React / Tailwind CSS / typeScript
- **Backend:** Supabase (PostgreSQL, Auth, Storage) create and use ptaVOID_ prefix in the public schema.


### **Security-First**

- RLS enforced for role-based data access.  
- Secure auth via Supabase Auth.  
- Encrypted storage for receipts.

---

## 📝 6. SQL Schema Updates

```sql
-- Parents table
  ID - generate uniqui 
  contact_number text,
  email text unique,
  payment_status boolean default false,
  payment_date timestamp,
  created_at timestamp default now()
);

-- Students table
create table students (
  ID - generate uniqui
  name text not null,
  class_id uuid references classes(id),
  parent_id uuid references parents(id),
  payment_status boolean default false,
  created_at timestamp default now()
);

-- Payments table
create table payments (
  ID - generate uniqui
  parent_id uuid references parents(id),
  amount numeric not null,
  receipt_url text,
  created_by uuid references users(id),
  created_at timestamp default now()
);


#Prompt 1 – SQL Migration
You are a senior database engineer. Generate SQL migration scripts to:

- Create parents, students, payments, teacher, Section/Grade tables for PTA Contribution Fees.
- Add foreign key constraints for relationships between tables.
- Include triggers to auto-update student payment status upon parent payment record for PTA Contribution Fees.
- Add foreign key constraints for relationships between tables.
Ensure schema compatibility with Supabase PostgreSQL.

#Prompt 2 – Next.js Supabase API
You are a senior Next.js Supabase developer. Generate an API handler to:

- Accept POST requests for recording parent payments.
- Call Supabase insert into payments table.
- Return updated student payment statuses for the parent’s students.
Include error handling and modular exports.
ing interactive starfield that moves with mouse gestures
# **App Name**: ClientFlow CRM

## Core Features:

- Client Management: View, add, edit, and filter client records with essential details like name, company, contact info, and status (active/inactive) in a table format. Visualize associated appointments and payments.
- Appointment Scheduling & Tracking: Manage client appointments with fields for client ID, date, time, type (WhatsApp/Meet), and status (pending/completed). Display separate lists for pending and completed appointments, and allow marking as completed.
- Payment Tracking & Overview: Record and track client payments including amount, payment date, due date, status (paid/pending), method, and notes. Segregate payments into pending and completed lists, and provide a clear visual overview of each client's outstanding debt. Enable editing of due dates and marking payments as paid.
- Local Storage Persistence: Centralized system for performing CRUD (Create, Read, Update, Delete) operations on all application data using browser's localStorage, ensuring data continuity without a dedicated backend.
- Mock Data Initialization: Automatically load and hydrate the application with pre-defined mock data for 5 active clients, including appointments and payments, upon first run if no data exists in localStorage, to provide a functional starting point.
- Reusable UI Components: Development of a core library of minimalist and highly reusable UI components, such as data tables, input fields, and navigation elements, built with TailwindCSS for consistent design across the application.
- Interactive UI Enhancements: Integrate user-friendly elements including basic form validations for critical input fields and descriptive tooltips on important buttons and form elements for enhanced usability and guidance.

## Style Guidelines:

- Primary: A professional, deep cadet blue (#2273C3) conveying reliability and clarity. Based on the concept of professionalism.
- Background: A subtle, cool-toned light grey-blue (#F0F2F4) to ensure content readability and provide a clean foundation.
- Accent: A sophisticated, dark cool-grey (#5C6666) to define secondary elements, text, and interactive states, providing subtle contrast without distraction.
- Status - Success: A vibrant, clear green (#3DA33D) for completed items like 'pagado' or 'completado'.
- Status - Danger: A bold, distinct red (#E52626) to highlight urgent or critical states such as 'pendiente'.
- Status - Warning: A bright, eye-catching yellow (#F2C91A) for statuses like 'próximo' or alerts that require attention.
- Universal font: 'Inter' (sans-serif) for both headlines and body text. Chosen for its modern, clean, and highly readable characteristics, perfect for data-dense interfaces.
- Minimalist, line-art style SVG icons. Icons should be clear and concise, drawn from a reputable open-source library like Heroicons, to complement the clean UI and convey information quickly.
- Classic dashboard layout featuring a fixed, narrow sidebar for primary navigation and a flexible main content area for displaying data. All tables will be designed for reusability and responsiveness, adapting cleanly to various screen sizes.
- Subtle hover and focus effects on interactive elements such as buttons and navigation links. Employ light-weight, purposeful transitions for state changes to provide clear user feedback without creating visual clutter.
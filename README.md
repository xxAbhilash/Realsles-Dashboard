# Realsales Dashboard

## Project Overview

Realsales Dashboard is a modern, interactive web application designed to help sales teams and managers track, analyze, and improve their sales performance. The dashboard provides tools for both sales representatives and managers, including AI-powered training sessions, performance analytics, persona-based practice, and team/company management.

## Features

### For Sales Representatives
- **Profile Management:** View and edit your personal information and account settings.
- **AI Training Sessions:** Start and review AI-powered sales training sessions, including cold calling, product demos, objection handling, discovery calls, and closing techniques.
- **Performance Analytics:** Track your overall performance, skill breakdown, achievements, and monthly trends.
- **Personas:** Practice with a variety of AI buyer personas (Aggressive, Skeptical, Budget-Conscious, Technical, Friendly, Time-Pressed) to simulate real-world sales scenarios.
- **Modes Used:** Analyze your usage and performance across different training modes.

### For Sales Managers
- **Manager Profile:** Manage your account and view management-specific statistics.
- **Company Management:** Create, edit, and manage companies, including details like industry, employees, and teams.
- **Team Management:** Create and manage teams, assign members, and track team performance and growth.
- **Management Analytics:** View statistics on companies, teams, team members, and overall performance.

## Technologies Used
- **Vite** (build tool)
- **TypeScript**
- **React**
- **shadcn-ui** (UI components)
- **Tailwind CSS** (utility-first CSS framework)

## Getting Started

### Prerequisites
- [Node.js & npm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Installation
1. **Clone the repository:**
   ```sh
   git clone <YOUR_GIT_URL>
   cd Realsales-Dashboard
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Start the development server:**
   ```sh
   npm run dev
   ```
4. **Open your browser:**
   Visit [http://localhost:5173](http://localhost:5173) (or the port shown in your terminal) to view the dashboard.

## Project Structure
- `src/pages/` — Main pages (Dashboard, Index, NotFound)
- `src/components/dashboard/` — Dashboard feature components (Profile, Sessions, Performance, ModesUsed, Personas, Company, Teams, ManagerProfile)
- `src/components/ui/` — Reusable UI components
- `src/hooks/` — Custom React hooks
- `src/lib/` — Utility functions

## Deployment
You can deploy this project to any static hosting provider that supports Vite/React apps, such as Vercel, Netlify, or GitHub Pages. Build the project with:
```sh
npm run build
```
Then follow your hosting provider's instructions to deploy the `dist/` folder.

## Customization
- **Design:** Tailwind CSS and shadcn-ui make it easy to customize the look and feel.
- **Data:** The current dashboard uses mock data. Integrate your backend or APIs for real data.
- **Roles:** The dashboard supports both sales representatives and managers, with role-based navigation and features.

## License
This project is for internal use. Please contact the project owner for licensing or usage questions.

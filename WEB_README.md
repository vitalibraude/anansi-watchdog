# 🌐 Anansi Watchdog Web Dashboard

Beautiful, interactive web dashboard for monitoring AI model safety in real-time.

## ✨ Features

### 📊 **Live Dashboard**
- Real-time model scores with automatic updates
- Interactive charts (Line, Bar, Radar)
- Live score tracking
- Category breakdown visualization

### 🏆 **Leaderboard**
- Model rankings with podium display
- Trend indicators (up/down/stable)
- Filterable by time period (7d, 30d, all-time)
- Sortable by different metrics

### ⚔️ **Model Comparison**
- Side-by-side comparison of up to 4 models
- Multi-dimensional radar charts
- Category breakdown charts
- Detailed strength/weakness analysis
- Cost and performance metrics

### 🧪 **Test Runner**
- Interactive test configuration
- Multiple model selection
- Category-based testing
- Real-time progress tracking
- Instant results preview

### 📚 **Documentation**
- Quick start guide
- API usage examples
- Test category overview
- Architecture explanation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
cd web
npm install
```

### Development

```bash
npm run dev
```

Dashboard will be available at `http://localhost:3000`

### Production Build

```bash
npm run build
npm run preview
```

## 🎨 Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Recharts** - Data visualization
- **React Router** - Navigation
- **TanStack Query** - Data fetching
- **Vite** - Build tool

## 📁 Project Structure

```
web/
├── src/
│   ├── components/      # Reusable components
│   ├── pages/          # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Leaderboard.tsx
│   │   ├── ModelComparison.tsx
│   │   ├── TestRunner.tsx
│   │   └── Documentation.tsx
│   ├── App.tsx         # Main app component
│   ├── main.tsx        # Entry point
│   └── index.css       # Global styles
├── public/             # Static assets
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## 🎨 Design System

### Colors
- **Primary**: Purple (#8b5cf6)
- **Secondary**: Blue (#3b82f6)
- **Success**: Green (#10b981)
- **Warning**: Yellow (#f59e0b)
- **Danger**: Red (#ef4444)

### Components
- Glass-morphism effects
- Gradient backgrounds
- Smooth animations
- Responsive grid layouts
- Interactive charts

## 📊 Data Visualization

### Charts Used
1. **Line Charts** - Trends over time
2. **Bar Charts** - Category comparisons
3. **Radar Charts** - Multi-dimensional analysis
4. **Progress Bars** - Score indicators

### Interactive Features
- Hover tooltips
- Click interactions
- Zoom and pan
- Legend filtering

## 🔌 API Integration

The dashboard connects to the backend API at `http://localhost:8000`:

```typescript
// Example API call
const fetchScores = async () => {
  const response = await fetch('http://localhost:8000/api/v1/scores/latest');
  return response.json();
};
```

### API Endpoints Used
- `GET /api/v1/scores/latest` - Live scores
- `GET /api/v1/leaderboard` - Model rankings
- `GET /api/v1/trends/{model}` - Historical data
- `POST /api/v1/test` - Run tests

## 🎭 Animations

Using Framer Motion for smooth animations:

```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.1 }}
>
  Content
</motion.div>
```

## 📱 Responsive Design

Fully responsive with breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🎯 Performance

- Code splitting
- Lazy loading
- Image optimization
- Caching strategies
- Bundle optimization

## 🔧 Configuration

### Environment Variables

Create `.env` in the web directory:

```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws
```

### Vite Proxy

Configured to proxy API requests:

```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
```

## 📦 Deployment

### Vercel
```bash
vercel deploy
```

### Netlify
```bash
netlify deploy --prod
```

### Docker
```bash
docker build -t anansi-web .
docker run -p 3000:3000 anansi-web
```

## 🤝 Contributing

See main [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

### Adding New Pages

1. Create component in `src/pages/`
2. Add route in `App.tsx`
3. Add navigation link
4. Update this README

### Styling Guidelines

- Use Tailwind utility classes
- Follow existing color scheme
- Maintain consistent spacing
- Keep animations subtle

## 📄 License

MIT License - see [LICENSE](../LICENSE)

---

**Built with ❤️ using React + TypeScript + Tailwind**

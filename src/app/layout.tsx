import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: {
    default: 'DataCanvas.Design — Data Visualization Chart Reference',
    template: '%s | DataCanvas.Design',
  },
  description: 'The complete reference for data visualization. Learn which chart to use, when to use it, and how to design it well. 30+ chart types with interactive examples.',
  keywords: ['data visualization', 'chart types', 'when to use a pie chart', 'best chart for comparison', 'data visualization examples'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://datacanvas.design',
    siteName: 'DataCanvas.Design',
    title: 'DataCanvas.Design — Data Visualization Chart Reference',
    description: 'The complete reference for data visualization. 30+ chart types with best practices, examples, and interactive previews.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DataCanvas.Design',
    description: 'The complete reference for data visualization.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}

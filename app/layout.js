import './globals.css';
import { Providers } from '../components/providers';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DemoNotice from '../components/ui/DemoNotice';

export const metadata = {
  title: { default: 'TraceIt — Lost Somewhere? Found Together.', template: '%s | TraceIt' },
  description: "India's intelligent lost and found network. Report missing belongings, discover found items and reconnect people with what matters.",
  applicationName: 'TraceIt',
  keywords: ['lost and found India', 'lost item', 'found item', 'community recovery'],
};

export const viewport = { themeColor: '#102a56', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <DemoNotice />
          <Navbar />
          <main className="min-h-[55vh]">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F6F8] p-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-jakarta font-black text-navy mb-2" style={{ fontWeight: 900 }}>404</div>
        <h1 className="font-jakarta text-2xl font-bold text-navy mb-3">Page Not Found</h1>
        <p className="text-gray-500 mb-8">The page you are looking for does not exist or may have been moved.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary justify-center">Go to Home</Link>
          <Link href="/dashboard" className="btn-outline justify-center">Dashboard</Link>
        </div>
      </div>
    </div>
  );
}

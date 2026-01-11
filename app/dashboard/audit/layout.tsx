
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Audit Trail (Log Aktivitas) | Mavlana ERP',
    description: 'Pantau semua aktivitas pengguna dan perubahan sistem secara real-time.',
};

export default function AuditLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}

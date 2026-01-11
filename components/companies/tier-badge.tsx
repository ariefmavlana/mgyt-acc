import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TierBadgeProps {
    tier: string;
    className?: string;
}

export const TierBadge = ({ tier, className }: TierBadgeProps) => {
    const getTierStyles = (tier: string) => {
        switch (tier.toUpperCase()) {
            case 'UMKM':
                return 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100';
            case 'SMALL':
                return 'bg-green-100 text-green-700 border-green-200 hover:bg-green-100';
            case 'MEDIUM':
                return 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100';
            case 'ENTERPRISE':
                return 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-100';
            case 'CUSTOM':
                return 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-100';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-100';
        }
    };

    return (
        <Badge variant="outline" className={cn('px-2 py-0 text-[10px] font-bold uppercase tracking-wider h-5', getTierStyles(tier), className)}>
            {tier}
        </Badge>
    );
};

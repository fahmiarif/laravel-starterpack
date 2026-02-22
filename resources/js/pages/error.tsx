import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    ShieldAlert,
    FileQuestion,
    ServerCrash,
    Lock,
    Clock,
    ArrowLeft,
    Home,
    RefreshCw,
} from 'lucide-react';

interface ErrorPageProps {
    status: number;
    message?: string;
}

const errorConfig: Record<number, {
    title: string;
    description: string;
    icon: React.ElementType;
    gradient: string;
    iconColor: string;
}> = {
    401: {
        title: 'Unauthorized',
        description: 'Anda belum terautentikasi. Silakan login terlebih dahulu untuk mengakses halaman ini.',
        icon: Lock,
        gradient: 'from-amber-500/20 to-orange-500/20 dark:from-amber-500/10 dark:to-orange-500/10',
        iconColor: 'text-amber-500',
    },
    403: {
        title: 'Forbidden',
        description: 'Anda tidak memiliki izin untuk mengakses halaman ini. Hubungi administrator jika Anda merasa ini adalah kesalahan.',
        icon: ShieldAlert,
        gradient: 'from-red-500/20 to-rose-500/20 dark:from-red-500/10 dark:to-rose-500/10',
        iconColor: 'text-red-500',
    },
    404: {
        title: 'Halaman Tidak Ditemukan',
        description: 'Halaman yang Anda cari tidak ada atau telah dipindahkan. Periksa kembali URL atau kembali ke beranda.',
        icon: FileQuestion,
        gradient: 'from-blue-500/20 to-indigo-500/20 dark:from-blue-500/10 dark:to-indigo-500/10',
        iconColor: 'text-blue-500',
    },
    419: {
        title: 'Sesi Kedaluwarsa',
        description: 'Sesi Anda telah berakhir. Silakan muat ulang halaman dan coba lagi.',
        icon: Clock,
        gradient: 'from-yellow-500/20 to-amber-500/20 dark:from-yellow-500/10 dark:to-amber-500/10',
        iconColor: 'text-yellow-500',
    },
    429: {
        title: 'Terlalu Banyak Permintaan',
        description: 'Anda telah mengirim terlalu banyak permintaan. Harap tunggu beberapa saat sebelum mencoba lagi.',
        icon: Clock,
        gradient: 'from-orange-500/20 to-red-500/20 dark:from-orange-500/10 dark:to-red-500/10',
        iconColor: 'text-orange-500',
    },
    500: {
        title: 'Kesalahan Server',
        description: 'Terjadi kesalahan pada server kami. Tim teknis telah diberitahu dan sedang menangani masalah ini.',
        icon: ServerCrash,
        gradient: 'from-purple-500/20 to-pink-500/20 dark:from-purple-500/10 dark:to-pink-500/10',
        iconColor: 'text-purple-500',
    },
    503: {
        title: 'Layanan Tidak Tersedia',
        description: 'Server sedang dalam pemeliharaan atau overload. Silakan coba lagi dalam beberapa menit.',
        icon: ServerCrash,
        gradient: 'from-gray-500/20 to-slate-500/20 dark:from-gray-500/10 dark:to-slate-500/10',
        iconColor: 'text-gray-500',
    },
};

export default function ErrorPage() {
    const { props } = usePage<{ status: number; message?: string }>();
    const status = props.status ?? 500;
    const customMessage = props.message;

    const config = errorConfig[status] ?? {
        title: 'Terjadi Kesalahan',
        description: 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi atau hubungi administrator.',
        icon: ServerCrash,
        gradient: 'from-gray-500/20 to-slate-500/20 dark:from-gray-500/10 dark:to-slate-500/10',
        iconColor: 'text-gray-500',
    };

    const Icon = config.icon;

    return (
        <>
            <Head title={`${status} - ${config.title}`} />

            <div className="flex min-h-screen items-center justify-center bg-background p-4">
                <div className="w-full max-w-lg">
                    {/* Decorative background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-50 pointer-events-none`} />

                    <Card className="relative overflow-hidden border-0 shadow-2xl">
                        {/* Top gradient bar */}
                        <div className={`h-1.5 w-full bg-gradient-to-r ${config.gradient.replace('/20', '/80').replace('/10', '/60')}`} />

                        <CardContent className="flex flex-col items-center text-center px-8 py-12">
                            {/* Icon with animated ring */}
                            <div className="relative mb-8">
                                <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${config.gradient} animate-pulse scale-150`} />
                                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-background shadow-lg ring-1 ring-border">
                                    <Icon className={`h-12 w-12 ${config.iconColor}`} />
                                </div>
                            </div>

                            {/* Error code */}
                            <span className="mb-2 text-7xl font-extrabold tracking-tighter text-foreground/10">
                                {status}
                            </span>

                            {/* Title */}
                            <h1 className="mb-3 text-2xl font-bold tracking-tight text-foreground">
                                {config.title}
                            </h1>

                            {/* Description */}
                            <p className="mb-8 max-w-sm text-sm leading-relaxed text-muted-foreground">
                                {customMessage || config.description}
                            </p>

                            {/* Actions */}
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <Button
                                    variant="outline"
                                    onClick={() => window.history.back()}
                                    className="gap-2"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Kembali
                                </Button>

                                <Button asChild className="gap-2">
                                    <Link href="/">
                                        <Home className="h-4 w-4" />
                                        Beranda
                                    </Link>
                                </Button>

                                {(status === 419 || status === 500 || status === 503) && (
                                    <Button
                                        variant="secondary"
                                        onClick={() => window.location.reload()}
                                        className="gap-2"
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                        Muat Ulang
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Footer hint */}
                    <p className="mt-6 text-center text-xs text-muted-foreground/60">
                        Jika masalah berlanjut, hubungi tim support kami.
                    </p>
                </div>
            </div>
        </>
    );
}

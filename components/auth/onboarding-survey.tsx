'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CheckCircle2, ArrowRight, ArrowLeft, Building2, Users, ShieldCheck } from 'lucide-react';

interface SurveyData {
    cabang: string;
    karyawan: string;
    fiturEnterprise: string;
}

export const OnboardingSurvey = ({ onComplete }: { onComplete: (tier: string) => void }) => {
    const [step, setStep] = useState(1);
    const [data, setData] = useState<SurveyData>({
        cabang: '1',
        karyawan: 'under10',
        fiturEnterprise: 'no'
    });

    const calculateTier = () => {
        const { cabang, karyawan, fiturEnterprise } = data;

        if (cabang === 'above20' || fiturEnterprise === 'yes') return 'ENTERPRISE';
        if (cabang === '6to20' || karyawan === 'above50') return 'MEDIUM';
        if (cabang === '2to5' || karyawan === '10to50') return 'SMALL';

        return 'UMKM';
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const finish = () => {
        onComplete(calculateTier());
    };

    return (
        <Card className="w-full max-w-xl mx-auto shadow-xl border-t-4 border-t-primary">
            <CardHeader>
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-primary uppercase tracking-widest">Langkah {step} dari 3</span>
                    <div className="flex gap-1">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`h-1.5 w-8 rounded-full ${i <= step ? 'bg-primary' : 'bg-slate-200'}`} />
                        ))}
                    </div>
                </div>
                <CardTitle className="text-2xl">Bantu Kami Mengenal Bisnis Anda</CardTitle>
                <CardDescription>Kami akan merekomendasikan fitur terbaik sesuai kebutuhan skala usaha Anda.</CardDescription>
            </CardHeader>
            <CardContent className="py-6">
                {step === 1 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        <div className="flex items-center gap-3 text-slate-800 font-semibold mb-4">
                            <Building2 className="text-primary h-5 w-5" />
                            <Label className="text-lg">Berapa banyak jumlah cabang yang Anda kelola?</Label>
                        </div>
                        <RadioGroup value={data.cabang} onValueChange={(v) => setData({ ...data, cabang: v })} className="grid grid-cols-1 gap-3">
                            <div className="flex items-center space-x-3 border rounded-xl p-4 cursor-pointer hover:bg-slate-50 transition-colors has-checked:border-primary has-checked:bg-primary/5">
                                <RadioGroupItem value="1" id="c1" />
                                <Label htmlFor="c1" className="flex-1 cursor-pointer">Hanya 1 (Pusat)</Label>
                            </div>
                            <div className="flex items-center space-x-3 border rounded-xl p-4 cursor-pointer hover:bg-slate-50 transition-colors has-checked:border-primary has-checked:bg-primary/5">
                                <RadioGroupItem value="2to5" id="c2" />
                                <Label htmlFor="c2" className="flex-1 cursor-pointer">2 - 5 Cabang</Label>
                            </div>
                            <div className="flex items-center space-x-3 border rounded-xl p-4 cursor-pointer hover:bg-slate-50 transition-colors has-checked:border-primary has-checked:bg-primary/5">
                                <RadioGroupItem value="6to20" id="c3" />
                                <Label htmlFor="c3" className="flex-1 cursor-pointer">6 - 20 Cabang</Label>
                            </div>
                            <div className="flex items-center space-x-3 border rounded-xl p-4 cursor-pointer hover:bg-slate-50 transition-colors has-checked:border-primary has-checked:bg-primary/5">
                                <RadioGroupItem value="above20" id="c4" />
                                <Label htmlFor="c4" className="flex-1 cursor-pointer">Lebih dari 20 Cabang</Label>
                            </div>
                        </RadioGroup>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        <div className="flex items-center gap-3 text-slate-800 font-semibold mb-4">
                            <Users className="text-primary h-5 w-5" />
                            <Label className="text-lg">Berapa estimasi jumlah karyawan Anda?</Label>
                        </div>
                        <RadioGroup value={data.karyawan} onValueChange={(v) => setData({ ...data, karyawan: v })} className="grid grid-cols-1 gap-3">
                            <div className="flex items-center space-x-3 border rounded-xl p-4 cursor-pointer hover:bg-slate-50 transition-colors has-checked:border-primary has-checked:bg-primary/5">
                                <RadioGroupItem value="under10" id="k1" />
                                <Label htmlFor="k1" className="flex-1 cursor-pointer">Di bawah 10 Orang</Label>
                            </div>
                            <div className="flex items-center space-x-3 border rounded-xl p-4 cursor-pointer hover:bg-slate-50 transition-colors has-checked:border-primary has-checked:bg-primary/5">
                                <RadioGroupItem value="10to50" id="k2" />
                                <Label htmlFor="k2" className="flex-1 cursor-pointer">10 - 50 Orang</Label>
                            </div>
                            <div className="flex items-center space-x-3 border rounded-xl p-4 cursor-pointer hover:bg-slate-50 transition-colors has-checked:border-primary has-checked:bg-primary/5">
                                <RadioGroupItem value="above50" id="k3" />
                                <Label htmlFor="k3" className="flex-1 cursor-pointer">Lebih dari 50 Orang</Label>
                            </div>
                        </RadioGroup>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        <div className="flex items-center gap-3 text-slate-800 font-semibold mb-4">
                            <ShieldCheck className="text-primary h-5 w-5" />
                            <Label className="text-lg">Apakah Anda memerlukan Approval Bertingkat & Audit Trail?</Label>
                        </div>
                        <RadioGroup value={data.fiturEnterprise} onValueChange={(v) => setData({ ...data, fiturEnterprise: v })} className="grid grid-cols-1 gap-3">
                            <div className="flex items-center space-x-3 border rounded-xl p-4 cursor-pointer hover:bg-slate-50 transition-colors has-checked:border-primary has-checked:bg-primary/5">
                                <RadioGroupItem value="no" id="f1" />
                                <Label htmlFor="f1" className="flex-1 cursor-pointer">Tidak, cukup pencatatan standar</Label>
                            </div>
                            <div className="flex items-center space-x-3 border rounded-xl p-4 cursor-pointer hover:bg-slate-50 transition-colors has-checked:border-primary has-checked:bg-primary/5">
                                <RadioGroupItem value="yes" id="f2" />
                                <Label htmlFor="f2" className="flex-1 cursor-pointer">Ya, keamanan data & persetujuan hirarki sangat penting</Label>
                            </div>
                        </RadioGroup>
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex justify-between border-t p-6 bg-slate-50/50">
                {step === 1 ? (
                    <Link href="/">
                        <Button variant="ghost">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                        </Button>
                    </Link>
                ) : (
                    <Button variant="ghost" onClick={prevStep}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                    </Button>
                )}
                {step < 3 ? (
                    <Button onClick={nextStep}>
                        Lanjut <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                ) : (
                    <Button onClick={finish} className="bg-primary hover:bg-primary/90">
                        Lihat Rekomendasi <CheckCircle2 className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
};

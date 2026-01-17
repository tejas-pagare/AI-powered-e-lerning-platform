'use client';

import { useState, useContext } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { FileDown, Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { userContextProvider } from '@/context/userContext';
import { isFeatureAvailable } from '@/lib/ai-config';

export default function ExportPDFButton({ courseId, courseName }) {
    const [isExporting, setIsExporting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const { userDetails } = useContext(userContextProvider);

    const userTier = userDetails?.tier || 'Free';
    const canExport = isFeatureAvailable('pdfExport', userTier);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const response = await axios.post(
                '/api/export-pdf',
                { courseId },
                { responseType: 'blob' }
            );

            // Create download link
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${courseName.replace(/[^a-z0-9]/gi, '_')}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success('PDF Exported Successfully!', {
                description: 'Your course has been downloaded as a PDF.',
            });
            setIsOpen(false);
        } catch (error) {
            console.error('Export error:', error);
            const errorMessage = error.response?.status === 403
                ? 'PDF Export is only available for Pro and Enterprise users'
                : 'Failed to export PDF. Please try again.';
            toast.error('Export Failed', {
                description: errorMessage,
            });
        } finally {
            setIsExporting(false);
        }
    };

    if (!canExport) {
        return (
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                        <Lock className="w-4 h-4 mr-2" />
                        Export as PDF
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Premium Feature</DialogTitle>
                        <DialogDescription>
                            PDF Export is available for Pro and Enterprise users only.
                            Upgrade your plan to unlock this feature and export your courses as professional PDFs.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { }}>
                            Close
                        </Button>
                        <Button onClick={() => window.location.href = '/workspace/billing'}>
                            Upgrade Now
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <FileDown className="w-4 h-4 mr-2" />
                    Export as PDF
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Export Course as PDF</DialogTitle>
                    <DialogDescription>
                        Download a professionally formatted PDF containing all course chapters, content, and quizzes.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                        <p className="font-medium text-blue-900 mb-2">What's included:</p>
                        <ul className="space-y-1 text-blue-800">
                            <li>✓ Course title and description</li>
                            <li>✓ Table of contents</li>
                            <li>✓ All chapter content</li>
                            <li>✓ Quizzes with answers</li>
                        </ul>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isExporting}>
                        Cancel
                    </Button>
                    <Button onClick={handleExport} disabled={isExporting}>
                        {isExporting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Generating PDF...
                            </>
                        ) : (
                            <>
                                <FileDown className="w-4 h-4 mr-2" />
                                Export PDF
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

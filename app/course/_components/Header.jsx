"use client";

import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { exportCourseToPDF } from '@/lib/pdfExport';
import { toast } from 'sonner';

function Header({ enrolledCourse }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    if (!enrolledCourse) {
      toast.error('No course data available');
      return;
    }

    setIsExporting(true);
    try {
      await exportCourseToPDF(
        enrolledCourse.course.courseContent,
        enrolledCourse.course.name,
        enrolledCourse.course.courseBannerUrl
      );
      toast.success('PDF exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className='w-full p-4 flex items-center justify-between shadow-sm'>
      <SidebarTrigger />

      <div className="flex items-center gap-3">
        {enrolledCourse && (
          <Button
            onClick={handleExportPDF}
            disabled={isExporting}
            variant="outline"
            size="sm"
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <FileDown className="mr-2 h-4 w-4" />
                Export to PDF
              </>
            )}
          </Button>
        )}
        <UserButton />
      </div>
    </div>
  );
}

export default Header;

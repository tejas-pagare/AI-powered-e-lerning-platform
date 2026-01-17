import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Sanitize HTML content to plain text
 */
function sanitizeHTML(html) {
    if (!html) return '';

    // Create a temporary div to parse HTML
    const temp = document.createElement('div');
    temp.innerHTML = html;

    // Get text content
    let text = temp.textContent || temp.innerText || '';

    // Clean up extra whitespace
    text = text.replace(/\s+/g, ' ').trim();

    return text;
}

/**
 * Add banner image to PDF
 */
async function addBannerImage(pdf, bannerUrl) {
    try {
        // Create an image element
        const img = new Image();
        img.crossOrigin = 'anonymous';

        // Load image
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = bannerUrl;
        });

        // Convert to canvas
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        // Add to PDF
        const imgData = canvas.toDataURL('image/jpeg', 0.8);
        const imgWidth = 170; // Width in mm
        const imgHeight = (img.height * imgWidth) / img.width;

        pdf.addImage(imgData, 'JPEG', 20, 20, imgWidth, Math.min(imgHeight, 80));

        return Math.min(imgHeight, 80) + 30; // Return Y position after image
    } catch (error) {
        console.error('Error adding banner image:', error);
        return 20; // Return default Y position if image fails
    }
}

/**
 * Export course to PDF
 */
export async function exportCourseToPDF(courseData, courseName, courseBanner) {
    try {
        // Create new PDF document (A4 size)
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 20;
        const maxWidth = pageWidth - (margin * 2);
        let yPosition = margin;

        // === COVER PAGE ===

        // Add banner image if available
        if (courseBanner) {
            yPosition = await addBannerImage(pdf, courseBanner);
        }

        // Course title
        pdf.setFontSize(24);
        pdf.setFont('helvetica', 'bold');
        const titleLines = pdf.splitTextToSize(courseName || 'Course Material', maxWidth);
        pdf.text(titleLines, margin, yPosition);
        yPosition += titleLines.length * 10 + 10;

        // Generated date
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Generated: ${new Date().toLocaleDateString()}`, margin, yPosition);
        yPosition += 10;

        // Chapter count
        const chapterCount = courseData?.length || 0;
        pdf.text(`Total Chapters: ${chapterCount}`, margin, yPosition);
        yPosition += 20;

        // === CONTENT PAGES ===

        if (courseData && Array.isArray(courseData)) {
            for (let i = 0; i < courseData.length; i++) {
                const chapter = courseData[i];
                const chapterData = chapter.courseData;

                if (!chapterData) continue;

                // Add new page for each chapter (except first)
                if (i > 0 || yPosition > pageHeight - 40) {
                    pdf.addPage();
                    yPosition = margin;
                }

                // Chapter title
                pdf.setFontSize(18);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(51, 51, 51); // Dark gray

                const chapterTitle = chapterData.chapterName || `Chapter ${i + 1}`;
                const chapterTitleLines = pdf.splitTextToSize(chapterTitle, maxWidth);

                // Check if we need a new page
                if (yPosition + (chapterTitleLines.length * 8) > pageHeight - margin) {
                    pdf.addPage();
                    yPosition = margin;
                }

                pdf.text(chapterTitleLines, margin, yPosition);
                yPosition += chapterTitleLines.length * 8 + 10;

                // Chapter topics
                if (chapterData.topics && Array.isArray(chapterData.topics)) {
                    for (const topic of chapterData.topics) {
                        // Topic title
                        pdf.setFontSize(14);
                        pdf.setFont('helvetica', 'bold');
                        pdf.setTextColor(0, 0, 0); // Black

                        const topicTitle = topic.topic || 'Topic';
                        const topicTitleLines = pdf.splitTextToSize(topicTitle, maxWidth);

                        // Check if we need a new page
                        if (yPosition + (topicTitleLines.length * 6) > pageHeight - margin) {
                            pdf.addPage();
                            yPosition = margin;
                        }

                        pdf.text(topicTitleLines, margin, yPosition);
                        yPosition += topicTitleLines.length * 6 + 5;

                        // Topic content
                        pdf.setFontSize(11);
                        pdf.setFont('helvetica', 'normal');

                        const content = sanitizeHTML(topic.content);
                        const contentLines = pdf.splitTextToSize(content, maxWidth);

                        // Add content with page breaks
                        for (const line of contentLines) {
                            if (yPosition > pageHeight - margin) {
                                pdf.addPage();
                                yPosition = margin;
                            }

                            pdf.text(line, margin, yPosition);
                            yPosition += 6; // Line height
                        }

                        yPosition += 5; // Space after topic
                    }
                }

                yPosition += 10; // Space after chapter
            }
        }

        // === PAGE NUMBERS ===
        const totalPages = pdf.internal.getNumberOfPages();
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(128, 128, 128); // Gray

        for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            pdf.text(
                `Page ${i} of ${totalPages}`,
                pageWidth / 2,
                pageHeight - 10,
                { align: 'center' }
            );
        }

        // === SAVE PDF ===
        const fileName = `${courseName || 'Course'} - Course Material.pdf`;
        pdf.save(fileName);

        return { success: true, fileName };
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw new Error('Failed to generate PDF: ' + error.message);
    }
}

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { courseTable, usersTable } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { currentUser } from '@clerk/nextjs/server';
import { isFeatureAvailable } from '@/lib/ai-config';
import { Document, Page, Text, View, StyleSheet, pdf, Font } from '@react-pdf/renderer';

// Register fonts (optional, for better typography)
Font.register({
    family: 'Inter',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2' },
        { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiA.woff2', fontWeight: 'bold' },
    ],
});

// PDF Styles
const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Inter',
        fontSize: 11,
        lineHeight: 1.6,
    },
    coverPage: {
        padding: 40,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#1a202c',
    },
    subtitle: {
        fontSize: 14,
        color: '#718096',
        marginBottom: 8,
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 12,
        color: '#2d3748',
    },
    subheader: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
        color: '#4a5568',
    },
    text: {
        fontSize: 11,
        marginBottom: 8,
        color: '#2d3748',
    },
    chapterTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 24,
        marginBottom: 12,
        color: '#2b6cb0',
        borderBottom: '2px solid #2b6cb0',
        paddingBottom: 8,
    },
    topicTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 12,
        marginBottom: 6,
        color: '#2d3748',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        fontSize: 9,
        color: '#a0aec0',
    },
    badge: {
        backgroundColor: '#edf2f7',
        padding: '4 8',
        borderRadius: 4,
        fontSize: 10,
        marginBottom: 12,
    },
});

// PDF Document Component
const CoursePDF = ({ course, courseContent, quiz }) => {
    const courseJson = course.courseJson;

    return (
        <Document>
            {/* Cover Page */}
            <Page size="A4" style={styles.coverPage}>
                <View>
                    <Text style={styles.title}>{course.name}</Text>
                    <Text style={styles.subtitle}>{course.description}</Text>
                    <Text style={styles.badge}>
                        Level: {courseJson?.course?.level || 'Beginner'} |
                        Chapters: {courseJson?.chapters?.length || 0}
                    </Text>
                </View>
            </Page>

            {/* Table of Contents */}
            <Page size="A4" style={styles.page}>
                <Text style={styles.header}>Table of Contents</Text>
                {courseJson?.chapters?.map((chapter, idx) => (
                    <View key={idx} style={{ marginBottom: 8 }}>
                        <Text style={styles.text}>
                            {idx + 1}. {chapter.chapterName}
                        </Text>
                        {chapter.topics?.map((topic, topicIdx) => (
                            <Text key={topicIdx} style={{ ...styles.text, marginLeft: 20, fontSize: 10 }}>
                                • {topic}
                            </Text>
                        ))}
                    </View>
                ))}
            </Page>

            {/* Course Content */}
            {courseContent?.map((chapterData, chapterIdx) => (
                <Page key={chapterIdx} size="A4" style={styles.page}>
                    <Text style={styles.chapterTitle}>
                        Chapter {chapterIdx + 1}: {chapterData.courseData?.chapterName}
                    </Text>

                    {chapterData.courseData?.topics?.map((topic, topicIdx) => (
                        <View key={topicIdx} style={{ marginBottom: 16 }}>
                            <Text style={styles.topicTitle}>{topic.topic}</Text>
                            {/* Strip HTML tags for PDF (simplified) */}
                            <Text style={styles.text}>
                                {topic.content?.replace(/<[^>]*>/g, ' ').replace(/&[^;]+;/g, ' ').trim() || 'No content available'}
                            </Text>
                        </View>
                    ))}

                    {/* Quiz Section */}
                    {quiz && quiz[courseJson?.chapters?.[chapterIdx]?.chapterName] && (
                        <View style={{ marginTop: 20 }}>
                            <Text style={styles.subheader}>Chapter Quiz</Text>
                            {quiz[courseJson?.chapters?.[chapterIdx]?.chapterName]?.map((q, qIdx) => (
                                <View key={qIdx} style={{ marginBottom: 12 }}>
                                    <Text style={styles.text}>
                                        Q{qIdx + 1}. {q.questionText}
                                    </Text>
                                    {q.options?.map((opt, optIdx) => (
                                        <Text key={optIdx} style={{ ...styles.text, marginLeft: 20, fontSize: 10 }}>
                                            {optIdx === q.correctAnswerIndex ? '✓ ' : '  '}{opt}
                                        </Text>
                                    ))}
                                    <Text style={{ ...styles.text, marginLeft: 20, fontSize: 9, color: '#48bb78' }}>
                                        Answer: {q.explanation}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}

                    <Text style={styles.footer}>
                        Page {chapterIdx + 3} | {course.name}
                    </Text>
                </Page>
            ))}
        </Document>
    );
};

export async function POST(req) {
    try {
        const { courseId } = await req.json();
        const user = await currentUser();

        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const email = user.primaryEmailAddress?.emailAddress;

        // Check user's tier and permissions
        const [dbUser] = await db.select().from(usersTable).where(eq(usersTable.email, email));
        const userTier = dbUser?.tier || 'Free';

        // Check if user has access to PDF export
        if (!isFeatureAvailable('pdfExport', userTier)) {
            return new NextResponse('PDF Export is only available for Pro and Enterprise users', { status: 403 });
        }

        // Fetch course data
        const [course] = await db.select().from(courseTable).where(eq(courseTable.cid, courseId));

        if (!course) {
            return new NextResponse('Course not found', { status: 404 });
        }

        // Verify ownership
        if (course.userEmail !== email) {
            return new NextResponse('Unauthorized access to this course', { status: 403 });
        }

        // Generate PDF
        const pdfDoc = <CoursePDF course={course} courseContent={course.courseContent} quiz={course.quiz} />;
        const pdfBytes = await pdf(pdfDoc).toBlob();

        // Convert blob to buffer
        const buffer = await pdfBytes.arrayBuffer();

        // Return PDF as download
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${course.name.replace(/[^a-z0-9]/gi, '_')}.pdf"`,
            },
        });
    } catch (error) {
        console.error('PDF Export Error:', error);
        return new NextResponse(`Error generating PDF: ${error.message}`, { status: 500 });
    }
}

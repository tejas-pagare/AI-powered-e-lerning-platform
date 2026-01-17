"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, ChevronRight, ChevronLeft, RotateCcw } from "lucide-react";

export default function QuizSection({ quizData, chapterName, onComplete }) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);

    if (!quizData || quizData.length === 0) {
        return (
            <Card className="w-full max-w-3xl mx-auto mt-8">
                <CardHeader>
                    <CardTitle>Quiz Not Available</CardTitle>
                    <CardDescription>
                        No quiz questions are available for this chapter yet.
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    const currentQuestion = quizData[currentQuestionIndex];
    const totalQuestions = quizData.length;
    const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

    const handleAnswerSelect = (answerIndex) => {
        setSelectedAnswers({
            ...selectedAnswers,
            [currentQuestionIndex]: answerIndex,
        });
    };

    const handleNext = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleSubmit = () => {
        let correctCount = 0;
        quizData.forEach((question, index) => {
            if (selectedAnswers[index] === question.correctAnswerIndex) {
                correctCount++;
            }
        });
        setScore(correctCount);
        setShowResults(true);
        if (onComplete) {
            onComplete(correctCount, totalQuestions);
        }
    };

    const handleRetry = () => {
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setShowResults(false);
        setScore(0);
    };

    const isAnswered = selectedAnswers[currentQuestionIndex] !== undefined;
    const allAnswered = Object.keys(selectedAnswers).length === totalQuestions;

    if (showResults) {
        const percentage = Math.round((score / totalQuestions) * 100);
        const passed = percentage >= 60;

        return (
            <Card className="w-full max-w-3xl mx-auto mt-8">
                <CardHeader>
                    <CardTitle className="text-2xl">Quiz Results - {chapterName}</CardTitle>
                    <CardDescription>
                        You scored {score} out of {totalQuestions} ({percentage}%)
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-center">
                        {passed ? (
                            <div className="text-center">
                                <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-4" />
                                <p className="text-xl font-semibold text-green-600">Great job! You passed!</p>
                            </div>
                        ) : (
                            <div className="text-center">
                                <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
                                <p className="text-xl font-semibold text-red-600">Keep studying and try again!</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Review Your Answers:</h3>
                        {quizData.map((question, index) => {
                            const userAnswer = selectedAnswers[index];
                            const isCorrect = userAnswer === question.correctAnswerIndex;

                            return (
                                <Card key={index} className={isCorrect ? "border-green-500" : "border-red-500"}>
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            {isCorrect ? (
                                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-red-500" />
                                            )}
                                            Question {index + 1}
                                        </CardTitle>
                                        <CardDescription>{question.questionText}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">Your answer:</p>
                                            <p className={`text-sm ${isCorrect ? "text-green-600" : "text-red-600"}`}>
                                                {question.options[userAnswer]}
                                            </p>
                                        </div>
                                        {!isCorrect && (
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium">Correct answer:</p>
                                                <p className="text-sm text-green-600">
                                                    {question.options[question.correctAnswerIndex]}
                                                </p>
                                            </div>
                                        )}
                                        <div className="mt-3 p-3 bg-muted rounded-md">
                                            <p className="text-sm font-medium mb-1">Explanation:</p>
                                            <p className="text-sm text-muted-foreground">{question.explanation}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleRetry} className="w-full" variant="outline">
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Retry Quiz
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-3xl mx-auto mt-8">
            <CardHeader>
                <div className="flex justify-between items-center mb-2">
                    <CardTitle className="text-xl">Quiz - {chapterName}</CardTitle>
                    <span className="text-sm text-muted-foreground">
                        Question {currentQuestionIndex + 1} of {totalQuestions}
                    </span>
                </div>
                <Progress value={progress} className="h-2" />
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold mb-4">{currentQuestion.questionText}</h3>
                    <RadioGroup
                        value={selectedAnswers[currentQuestionIndex]?.toString()}
                        onValueChange={(value) => handleAnswerSelect(parseInt(value))}
                    >
                        <div className="space-y-3">
                            {currentQuestion.options.map((option, index) => (
                                <div
                                    key={index}
                                    className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-accent cursor-pointer transition-colors"
                                >
                                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                                    <Label
                                        htmlFor={`option-${index}`}
                                        className="flex-1 cursor-pointer font-normal"
                                    >
                                        {option}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </RadioGroup>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                    variant="outline"
                >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                </Button>

                {currentQuestionIndex === totalQuestions - 1 ? (
                    <Button onClick={handleSubmit} disabled={!allAnswered}>
                        Submit Quiz
                    </Button>
                ) : (
                    <Button onClick={handleNext} disabled={!isAnswered}>
                        Next
                        <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}

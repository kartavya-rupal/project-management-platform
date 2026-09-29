"use client";

import { useEffect } from "react";

import {
    AlertTriangle,
    Brain,
    CheckCircle2,
    CircleAlert,
    Loader2,
    RefreshCw,
    ListChecks,
} from "lucide-react";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import useFetch from "@/hooks/use-fetch";

import { analyzeSprint } from "@/actions/sprint";

const SprintAnalysis = ({ sprint }) => {
    const {
        loading,
        error,
        data: analysis,
        fn: analyzeSprintFn,
        setData: setAnalysis,
    } = useFetch(analyzeSprint);

    useEffect(() => {
        setAnalysis(null);
    }, [sprint.id, setAnalysis]);

    const handleAnalyze = async () => {
        await analyzeSprintFn(sprint.id);
    };

    return (
        <Card className="relative overflow-hidden rounded-2xl border border-primary/10 bg-background/80 backdrop-blur-sm shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />

            <CardHeader className="relative z-10 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                            <Brain className="h-5 w-5 text-primary" />
                        </div>

                        <div>
                            <CardTitle className="text-lg">
                                AI Sprint Analysis
                            </CardTitle>

                            <p className="text-sm text-muted-foreground mt-1">
                                Analyze progress, blockers, risks, and next steps
                            </p>
                        </div>
                    </div>

                    <Button
                        onClick={handleAnalyze}
                        disabled={loading}
                        className="rounded-full px-5 cursor-pointer"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Analyzing...
                            </>
                        ) : analysis ? (
                            <>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Re-analyze
                            </>
                        ) : (
                            <>
                                <Brain className="mr-2 h-4 w-4" />
                                Analyze Sprint
                            </>
                        )}
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="relative z-10">
                {!analysis && !loading && !error && (
                    <div className="rounded-xl border border-dashed border-primary/20 bg-primary/5 p-5">
                        <p className="text-sm text-muted-foreground">
                            Generate an AI summary of{" "}
                            <span className="font-medium text-foreground">
                                {sprint.name}
                            </span>{" "}
                            using the sprint's current issues, priorities,
                            statuses, assignees, dates, and recent activity.
                        </p>
                    </div>
                )}

                {loading && (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />

                        <span className="ml-3 text-sm text-muted-foreground">
                            Analyzing current sprint data...
                        </span>
                    </div>
                )}

                {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                        <div className="flex items-start gap-3">
                            <CircleAlert className="h-5 w-5 text-red-600 mt-0.5" />

                            <div>
                                <p className="font-medium text-red-700">
                                    AI analysis failed
                                </p>

                                <p className="text-sm text-red-600 mt-1">
                                    {error.message}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {analysis && (
                    <div className="space-y-5">
                        <div className="rounded-xl border border-primary/10 bg-primary/5 p-5">
                            <div className="flex items-center gap-2 mb-2">
                                <Brain className="h-4 w-4 text-primary" />

                                <h3 className="text-sm font-semibold">
                                    Sprint Summary
                                </h3>
                            </div>

                            <p className="text-sm leading-6 text-muted-foreground">
                                {analysis.summary}
                            </p>
                        </div>

                        <div className="rounded-xl border bg-background/60 p-5">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />

                                <h3 className="text-sm font-semibold">
                                    Progress
                                </h3>
                            </div>

                            <p className="text-sm leading-6 text-muted-foreground">
                                {analysis.progressSummary}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="rounded-xl border bg-background/60 p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <CircleAlert className="h-4 w-4 text-red-500" />

                                    <h3 className="text-sm font-semibold">
                                        Blockers
                                    </h3>
                                </div>

                                {analysis.blockers.length > 0 ? (
                                    <ul className="space-y-2">
                                        {analysis.blockers.map(
                                            (blocker, index) => (
                                                <li
                                                    key={index}
                                                    className="text-sm text-muted-foreground leading-5 flex gap-2"
                                                >
                                                    <span className="text-red-500">
                                                        •
                                                    </span>

                                                    <span>
                                                        {blocker}
                                                    </span>
                                                </li>
                                            )
                                        )}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        No concrete blockers were identified
                                        from the available sprint data.
                                    </p>
                                )}
                            </div>

                            <div className="rounded-xl border bg-background/60 p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <AlertTriangle className="h-4 w-4 text-amber-500" />

                                    <h3 className="text-sm font-semibold">
                                        Risks
                                    </h3>
                                </div>

                                {analysis.risks.length > 0 ? (
                                    <ul className="space-y-2">
                                        {analysis.risks.map(
                                            (risk, index) => (
                                                <li
                                                    key={index}
                                                    className="text-sm text-muted-foreground leading-5 flex gap-2"
                                                >
                                                    <span className="text-amber-500">
                                                        •
                                                    </span>

                                                    <span>
                                                        {risk}
                                                    </span>
                                                </li>
                                            )
                                        )}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        No significant risks were identified
                                        from the available sprint data.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="rounded-xl border bg-background/60 p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <ListChecks className="h-4 w-4 text-primary" />

                                <h3 className="text-sm font-semibold">
                                    Recommended Next Steps
                                </h3>
                            </div>

                            {analysis.nextSteps.length > 0 ? (
                                <ol className="space-y-2">
                                    {analysis.nextSteps.map(
                                        (step, index) => (
                                            <li
                                                key={index}
                                                className="text-sm text-muted-foreground leading-5 flex gap-3"
                                            >
                                                <span className="font-semibold text-primary">
                                                    {index + 1}.
                                                </span>

                                                <span>
                                                    {step}
                                                </span>
                                            </li>
                                        )
                                    )}
                                </ol>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    No additional next steps were identified.
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default SprintAnalysis;
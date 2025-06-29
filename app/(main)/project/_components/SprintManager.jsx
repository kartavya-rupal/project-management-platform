"use client";

import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { format, formatDistanceToNow, isAfter, isBefore } from "date-fns";
import { Badge } from "@/components/ui/badge";
import React, { useEffect, useState } from "react";
import useFetch from "@/hooks/use-fetch";
import { updateSprintStatus, deleteSprint } from "@/actions/sprint";
import { toast } from "sonner";
import { useRouter, useSearchParams } from 'next/navigation';

const SprintManager = ({ sprint, setSprint, sprints, projectId }) => {
    const [status, setStatus] = useState(sprint.status);
    const searchParams = useSearchParams();
    const router = useRouter();

    const {
        loading,
        error,
        data: updatedStatus,
        fn: updateSprintStatusFn,
    } = useFetch(updateSprintStatus);

    const {
        loading: deleteLoading,
        error: deleteError,
        data: deletedSprint,
        fn: deleteSprintFn,
    } = useFetch(deleteSprint);

    const startDate = new Date(sprint.startDate);
    const endDate = new Date(sprint.endDate);
    const now = new Date();

    const canStart = isBefore(now, endDate) && isAfter(now, startDate) && status === "PLANNED";
    const canEnd = status === "ACTIVE";
    const canDelete = status === "PLANNED";

    const getStatusText = () => {
        if (status === "COMPLETED") {
            return `Sprint Ended`;
        }

        if (status === "ACTIVE") {
            if (isAfter(now, endDate)) {
                return `Overdue by ${formatDistanceToNow(endDate)}`;
            }
            if (isBefore(now, endDate) && isAfter(now, startDate)) {
                return `Sprint Ongoing`;
            }
        }

        if (status === "PLANNED" && isBefore(now, startDate)) {
            return `Starts in ${formatDistanceToNow(startDate)}`;
        }

        return null;
    };

    const handleStatusChange = async (newStatus) => {
        await updateSprintStatusFn(sprint.id, newStatus);
    };

    const handleDeleteSprint = async () => {
        try {
            await deleteSprintFn(sprint.id);
            toast.success("Sprint deleted successfully");
            const remainingSprints = sprints.filter((s) => s.id !== sprint.id);
            setSprint(remainingSprints[0] || null);
            router.refresh();
        } catch (err) {
            toast.error("Failed to delete sprint");
        }
    };

    useEffect(() => {
        if (updatedStatus?.success) {
            setStatus(updatedStatus?.sprint.status);
            setSprint({
                ...sprint,
                status: updatedStatus?.sprint.status,
            });

            if (updatedStatus.sprint.status === "ACTIVE") {
                toast.success("Sprint started successfully");
            } else if (updatedStatus.sprint.status === "COMPLETED") {
                toast.success("Sprint ended successfully");
            }
        }
    }, [updatedStatus]);

    useEffect(() => {
        const sprintId = searchParams.get("sprint");
        if (sprintId && sprintId !== sprint.id) {
            const selectedSprint = sprints.find((s) => s.id === sprintId);
            if (selectedSprint) {
                setSprint(selectedSprint);
                setStatus(selectedSprint.status);
            }
        }
    }, [searchParams, sprints]);

    const handleSprintChange = (value) => {
        const selectedSprint = sprints.find((s) => s.id === value);
        setSprint(selectedSprint);
        setStatus(selectedSprint.status);
        router.replace(`/project/${projectId}`, undefined, { shallow: true });
    };

    useEffect(() => {
        setStatus(sprint.status);
    }, [sprint.id, sprint.status]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <Select value={sprint.id} onValueChange={handleSprintChange}>
                    <SelectTrigger className="w-full sm:w-64 rounded-full bg-background/80 backdrop-blur border border-primary/10 shadow-sm transition-all duration-300 focus:ring-2 focus:ring-primary/30">
                        <SelectValue placeholder="Select Sprint" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border border-primary/10 rounded-xl shadow-lg">
                        {sprints.map((sprint) => (
                            <SelectItem key={sprint.id} value={sprint.id}>
                                {sprint.name} (
                                {format(sprint.startDate, "MMM d, yyyy")} -{" "}
                                {format(sprint.endDate, "MMM d, yyyy")})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {canStart && (
                    <Button
                        onClick={() => handleStatusChange("ACTIVE")}
                        disabled={loading}
                        className="relative overflow-hidden rounded-full px-5 py-2 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20 hover:cursor-pointer"
                    >
                        Start Sprint
                    </Button>
                )}

                {canEnd && (
                    <Button
                        onClick={() => handleStatusChange("COMPLETED")}
                        disabled={loading}
                        className="relative overflow-hidden rounded-full px-5 py-2 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20 hover:cursor-pointer"
                    >
                        End Sprint
                    </Button>
                )}

                {canDelete && (
                    <Button
                        onClick={handleDeleteSprint}
                        disabled={deleteLoading}
                        className="relative overflow-hidden rounded-full px-5 py-2 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-400/50 bg-[#DC143C] hover:bg-[#DC143C] text-white cursor-pointer"
                    >
                        {deleteLoading ? "Deleting..." : "Delete Sprint"}
                    </Button>

                )}
            </div>

            {getStatusText() && (
                <Badge
                    variant="outline"
                    className="rounded-full border-primary/20 bg-primary/10 text-primary px-4 py-1 shadow-sm self-start animate-fade-in"
                >
                    {getStatusText()}
                </Badge>
            )}
        </div>
    );
};

export default SprintManager;

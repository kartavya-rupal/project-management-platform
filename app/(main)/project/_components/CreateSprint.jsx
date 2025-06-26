"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { sprintSchema } from "@/lib/validators"
import { zodResolver } from "@hookform/resolvers/zod"
import { addDays, format } from "date-fns"
import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import useFetch from "@/hooks/use-fetch"
import { createSprint } from "@/actions/sprint"
import { useRouter } from "next/navigation"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2, PlusCircle, X, ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const SprintCreationForm = ({ projectTitle, projectId, projectKey, sprints }) => {
    const router = useRouter()
    const [showForm, setShowForm] = useState(false)
    const [dateRange, setDateRange] = useState({
        from: new Date(),
        to: addDays(new Date(), 14),
    })

    const getNextSprintName = () => {
        const sprintNumbers = sprints.map((sprint) => {
            const match = sprint.name.match(/-(\d+)$/)
            return match ? parseInt(match[1], 10) : 0
        })
        const nextNumber = Math.max(0, ...sprintNumbers) + 1
        return `${projectKey}-${nextNumber}`
    }

    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm({
        resolver: zodResolver(sprintSchema),
        defaultValues: {
            startDate: dateRange.from,
            endDate: dateRange.to,
        }
    })

    useEffect(() => {
        if (showForm) {
            setValue("name", getNextSprintName())
        }
    }, [showForm, sprints, setValue])

    const { loading, error, data: sprint, fn: createSprintFn } = useFetch(createSprint)

    const onSubmit = async (data) => {
        try {
            await createSprintFn(projectId, {
                ...data,
                startDate: dateRange.from,
                endDate: dateRange.to,
            })
            setShowForm(false)
            toast.success("Sprint created successfully")
            router.refresh()
        } catch (error) {
            console.error("Sprint creation failed", error)
        }
    }

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    {projectTitle}
                </h1>
                <Button
                    onClick={() => setShowForm(!showForm)}
                    className={cn(
                        "relative overflow-hidden rounded-full px-5 py-2 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer",
                        !showForm ? "hover:shadow-primary/20" : "hover:shadow-primary/20",
                    )}
                >
                    <span
                        className={cn(
                            "absolute inset-0 opacity-90",
                            !showForm ? "bg-gradient-to-r from-primary to-primary/80" : "bg-gradient-to-r from-primary to-primary/8000",
                        )}
                    ></span>
                    <span className="relative flex items-center gap-2 text-primary-foreground">
                        {!showForm ? (
                            <>
                                <PlusCircle size={16} />
                                Create New Sprint
                            </>
                        ) : (
                            <>
                                <X size={16} />
                                Cancel
                            </>
                        )}
                    </span>
                </Button>
            </div>

            {showForm && (
                <Card className="relative backdrop-blur-sm rounded-2xl border border-primary/10 overflow-hidden mb-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
                    <CardContent className="relative z-10 pt-6">
                        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col md:flex-row gap-6 items-end">
                            <div className="flex-1 space-y-2">
                                <label htmlFor="name" className="text-sm font-medium text-primary/80">
                                    Sprint Name
                                </label>
                                <Input
                                    id="name"
                                    {...register("name")}
                                    readOnly
                                    className="bg-background/50 border-primary/20 focus:border-primary/50 backdrop-blur-sm"
                                />
                                {errors.name && (
                                    <p className="text-red-400 text-sm flex items-center gap-1 mt-1">
                                        <X className="h-3 w-3" />
                                        {errors.name.message}
                                    </p>
                                )}
                            </div>

                            <div className="flex-1 space-y-2">
                                <label className="text-sm font-medium text-primary/80">Sprint Duration</label>
                                <Controller
                                    control={control}
                                    name="dateRange"
                                    render={({ field }) => (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="w-full justify-start text-left font-normal bg-background/50 border-primary/20 hover:bg-primary/10 hover:border-primary/50"
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4 text-primary/70" />
                                                    {dateRange.from && dateRange.to ? (
                                                        <span>
                                                            {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                                                        </span>
                                                    ) : (
                                                        <span className="text-primary/70">Pick a date range</span>
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent
                                                className="w-auto bg-background/95 backdrop-blur-md border border-primary/10 p-0 rounded-xl shadow-lg"
                                                align="start"
                                            >
                                                <DayPicker
                                                    showOutsideDays
                                                    className="p-3"
                                                    components={{
                                                        IconLeft: () => <ChevronLeft className="h-4 w-4" />,
                                                        IconRight: () => <ChevronRight className="h-4 w-4" />,
                                                    }}
                                                    classNames={{
                                                        chevron: "fill-blue-700",
                                                        range_start: "bg-blue-800 text-white",
                                                        range_end: "bg-blue-800 text-white",
                                                        range_middle: "bg-blue-300 text-white",
                                                        day_button: "border-none",
                                                        today: "border rounded-full border-blue-500 text-white",
                                                    }}
                                                    mode="range"
                                                    disabled={[{ before: new Date() }]}
                                                    selected={dateRange}
                                                    onSelect={(range) => {
                                                        if (range?.from && range?.to) {
                                                            setDateRange(range)
                                                            field.onChange(range)
                                                        }
                                                    }}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="relative overflow-hidden rounded-full px-6 py-2 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20 cursor-pointer"
                            >
                                <span className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-90"></span>
                                <span className="relative flex items-center gap-2 text-primary-foreground">
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        "Create Sprint"
                                    )}
                                </span>
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}
        </>
    )
}

export default SprintCreationForm

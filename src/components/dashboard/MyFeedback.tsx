import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  MessageSquare,
  Calendar,
  Star,
  Clock,
  FileText,
  Info,
  CheckCircle,
  AlertCircle,
  XCircle,
  Plus,
} from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { apis } from "@/utils/apis";
import { Rating } from "@/components/ui/rating";
import { PlatformFeedback } from "@/components/PlatformFeedback";

interface FeedbackItem {
  feedback_id: string;
  user_id: string;
  rating: number;
  description: string;
  response: string | null;
  status: "pending" | "responded" | "resolved";
  created_at: string;
  updated_at: string;
  user?: {
    first_name?: string;
    last_name?: string;
    email?: string;
  };
}

export function MyFeedback() {
  const { Get } = useApi();
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const fetchFeedback = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await Get(apis.my_feedback);

      if (response && Array.isArray(response)) {
        setFeedbackList(response);
      } else if (response && response.data && Array.isArray(response.data)) {
        setFeedbackList(response.data);
      } else {
        setFeedbackList([]);
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to fetch feedback");
      setFeedbackList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRelativeTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const getRatingLabel = (rating: number) => {
    if (rating >= 4.5) return "Excellent";
    if (rating >= 3.5) return "Good";
    if (rating >= 2.5) return "Average";
    if (rating >= 1.5) return "Below Average";
    return "Poor";
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "bg-green-100 text-green-700 border-green-300";
    if (rating >= 3.5) return "bg-blue-100 text-blue-700 border-blue-300";
    if (rating >= 2.5) return "bg-yellow-100 text-yellow-700 border-yellow-300";
    if (rating >= 1.5) return "bg-orange-100 text-orange-700 border-orange-300";
    return "bg-red-100 text-red-700 border-red-300";
  };

  const getStatusBadge = (status: "pending" | "responded" | "resolved") => {
    switch (status) {
      case "pending":
        return {
          label: "Pending",
          className: "bg-yellow-100 text-yellow-700 border-yellow-300",
          icon: Clock,
        };
      case "responded":
        return {
          label: "Responded",
          className: "bg-blue-100 text-blue-700 border-blue-300",
          icon: MessageSquare,
        };
      case "resolved":
        return {
          label: "Resolved",
          className: "bg-green-100 text-green-700 border-green-300",
          icon: CheckCircle,
        };
      default:
        return {
          label: "Unknown",
          className: "bg-gray-100 text-gray-700 border-gray-300",
          icon: Info,
        };
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-black tracking-tight">
            My Platform Feedback
          </h1>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">
            View all your submitted platform feedback
          </p>
        </div>
        <Button
          onClick={() => setIsFeedbackOpen(true)}
          className="gap-2 border-2 border-solid !border-[#FFDE5A] !bg-[#FFDE5A] !text-[#060606] !text-base !px-5 !py-2 h-fit font-semibold transition-all shadow-[0px_4px_4px_0px_#00000040] !rounded hover:!bg-[#FFDE5A]/90"
        >
          <Plus className="w-4 h-4" />
          Create Feedback
        </Button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
            <p className="text-muted-foreground text-sm">Loading feedback...</p>
          </div>
        </div>
      ) : error ? (
        <Card className="border-destructive/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-destructive">
              <Info className="h-5 w-5" />
              <p className="font-medium">{error}</p>
            </div>
          </CardContent>
        </Card>
      ) : feedbackList.length > 0 ? (
        <>
          {/* Statistics Card */}
          <Card className="border-border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-yellow-100 border border-border">
                    <MessageSquare className="h-6 w-6 text-black" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-black/60 mb-1">
                      Total Feedback Submitted
                    </p>
                    <p className="text-4xl font-bold text-black">
                      {feedbackList.length}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-black/50 mb-1">Average Rating</p>
                  <div className="flex items-center gap-2 justify-end">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-2xl font-bold text-black">
                      {feedbackList.length > 0
                        ? (
                            feedbackList.reduce((acc, f) => acc + f.rating, 0) /
                            feedbackList.length
                          ).toFixed(1)
                        : "0.0"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feedback List with Accordion */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-4 border-b">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg bg-yellow-100 border border-border">
                  <FileText className="h-5 w-5 text-black" />
                </div>
                <span>Feedback History</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-4 p-6">
                {feedbackList
                  .sort(
                    (a, b) =>
                      new Date(b.created_at).getTime() -
                      new Date(a.created_at).getTime()
                  )
                  .map((feedback, index) => {
                    const statusBadge = getStatusBadge(feedback.status);
                    const StatusIcon = statusBadge.icon;
                    const hasResponse = feedback.response && feedback.response.trim() !== "";

                    return (
                      <div
                        key={feedback.feedback_id || index}
                        className="border border-border rounded-lg overflow-hidden"
                      >
                        {/* Feedback Content - Always Visible */}
                        <div className="p-6 space-y-4">
                          {/* Header: Rating, Status, Date */}
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-yellow-50 border border-border/50">
                                <MessageSquare className="h-4 w-4 text-black/70" />
                              </div>
                              <div className="flex items-center gap-3">
                                <Rating
                                  value={feedback.rating}
                                  readOnly
                                  size="sm"
                                  max={5}
                                />
                                <Badge
                                  variant="outline"
                                  className={`text-xs font-medium ${getRatingColor(
                                    feedback.rating
                                  )}`}
                                >
                                  {getRatingLabel(feedback.rating)}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className={`text-xs font-medium flex items-center gap-1 ${statusBadge.className}`}
                                >
                                  <StatusIcon className="h-3 w-3" />
                                  {statusBadge.label}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(feedback.created_at)}</span>
                            </div>
                          </div>

                          {/* Description - User's Feedback */}
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-black/50">
                              Your Feedback
                            </p>
                            <div className="bg-yellow-50/30 p-4 rounded-lg border border-border/50">
                              <p className="text-sm text-black leading-relaxed whitespace-pre-wrap">
                                {feedback.description || "No description provided."}
                              </p>
                            </div>
                          </div>

                          {/* Accordion for Response - Only if response exists */}
                          {hasResponse && (
                            <Accordion type="single" collapsible className="w-full">
                              <AccordionItem value={`response-${feedback.feedback_id}`} className="border-0">
                                <AccordionTrigger className="py-2 px-0 hover:no-underline">
                                  <div className="flex items-center gap-2 text-sm font-medium text-black">
                                    <MessageSquare className="h-4 w-4" />
                                    <span>View Response</span>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-0 pb-0">
                                  <div className="space-y-2 pt-2">
                                    <p className="text-xs font-medium text-black/50">
                                      Response
                                    </p>
                                    <div className="bg-white p-4 rounded-lg border border-border/50">
                                      <p className="text-sm text-black leading-relaxed whitespace-pre-wrap">
                                        {feedback.response}
                                      </p>
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          )}

                          {/* No Response Message */}
                          {!hasResponse && feedback.status === "pending" && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border/50">
                              <Clock className="h-4 w-4" />
                              <span>Awaiting response from the team</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <div className="p-4 rounded-full bg-yellow-50 border border-border">
                <MessageSquare className="h-8 w-8 text-black/40" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-black mb-1">
                  No feedback submitted yet
                </h3>
                <p className="text-sm text-muted-foreground">
                  You haven't submitted any platform feedback yet. Click the
                  "Create Feedback" button above to share your thoughts.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Platform Feedback Dialog */}
      <PlatformFeedback 
        open={isFeedbackOpen} 
        onOpenChange={(open) => {
          setIsFeedbackOpen(open);
          // Refresh feedback list when dialog closes (in case feedback was submitted)
          if (!open) {
            fetchFeedback();
          }
        }} 
      />
    </div>
  );
}


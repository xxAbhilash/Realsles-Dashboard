import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Rating } from "@/components/ui/rating";
import { useApi } from "@/hooks/useApi";
import { apis } from "@/utils/apis";
import { showToast } from "@/lib/toastConfig";
import { useSelector } from "react-redux";

interface PlatformFeedbackProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PlatformFeedback({ open, onOpenChange }: PlatformFeedbackProps) {
  const { Post } = useApi();
  const user = useSelector((state: any) => state.auth.user);
  
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitFeedback = async () => {
    if (!description.trim()) {
      showToast.error("Please provide a description");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await Post(apis.platform_feedback, {
        rating: rating,
        description: description.trim(),
      });

      if (data) {
        showToast.success("Thank you for your platform feedback!");
        // Reset form
        setDescription("");
        setRating(1);
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      showToast.error("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setDescription("");
      setRating(1);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <div className="flex flex-col items-center gap-6 py-2">
          {/* Header */}
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold text-[#060606]">
              Platform Feedback
            </h2>
            <p className="text-base text-gray-600">
              We value your feedback! Please let us know how we can improve.
            </p>
          </div>

          {/* Rating Section */}
          <div className="w-full space-y-3">
            <label className="text-sm font-medium text-[#060606] block text-center">
              Rate your experience
            </label>
            <div className="flex items-center justify-center py-2">
              <Rating
                value={rating}
                onChange={setRating}
                precision={0.5}
                max={5}
                size="lg"
              />
            </div>
          </div>

          {/* Description Section */}
          <div className="w-full space-y-2">
            <label className="text-sm font-medium text-[#060606]">
              Your Comments
            </label>
            <Textarea
              placeholder="Share your thoughts, suggestions, or any issues you've encountered..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[140px] resize-none focus:ring-2 focus:ring-[#060606] focus:border-transparent"
              rows={6}
            />
          </div>

          {/* Action Buttons */}
          <div className="w-full space-y-3 pt-2">
            <Button
              className={`w-full text-white uppercase font-semibold py-6 ${
                !description.trim()
                  ? `bg-gray-400 hover:bg-gray-400 cursor-not-allowed`
                  : `bg-[#060606] hover:bg-[#060606]/90`
              }`}
              onClick={submitFeedback}
              disabled={!description.trim() || isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </Button>

            <button
              className="w-full text-gray-600 font-medium text-center cursor-pointer hover:text-gray-800 transition-colors py-2"
              onClick={handleClose}
              type="button"
            >
              Cancel
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


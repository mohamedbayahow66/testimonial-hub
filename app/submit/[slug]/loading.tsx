import { FormSkeleton } from "@/components/public/form-skeleton";

export default function SubmitLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <FormSkeleton />
    </div>
  );
}



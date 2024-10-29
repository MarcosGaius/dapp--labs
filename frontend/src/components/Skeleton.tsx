import { ArrowDownUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function MainSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-md mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-40 bg-gray-700" />
          <Skeleton className="h-10 w-36 bg-gray-700 rounded-md" />
        </div>

        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-purple-500/20 space-y-6">
          <Skeleton className="h-6 w-32 bg-gray-700" />
          <div className="space-y-4">
            <div className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-8 w-8 rounded-full bg-gray-600" />
                <Skeleton className="h-6 w-16 bg-gray-600" />
              </div>
              <Skeleton className="h-8 w-24 bg-gray-600" />
            </div>
            <div className="flex justify-center">
              <Button variant="ghost" className="rounded-full p-2" disabled>
                <ArrowDownUp className="h-6 w-6 text-gray-500" />
              </Button>
            </div>
            <div className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-8 w-8 rounded-full bg-gray-600" />
                <Skeleton className="h-6 w-16 bg-gray-600" />
              </div>
              <Skeleton className="h-8 w-24 bg-gray-600" />
            </div>
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-24 bg-gray-700" />
              <Skeleton className="h-4 w-32 bg-gray-700" />
            </div>
            <Skeleton className="h-10 w-full bg-gray-700 rounded-md" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-purple-500/20 space-y-4">
          <Skeleton className="h-6 w-40 bg-gray-700" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full bg-gray-700" />
            <Skeleton className="h-10 w-full bg-gray-700" />
          </div>
          <div className="flex space-x-4">
            <Skeleton className="h-10 flex-1 bg-gray-700 rounded-md" />
            <Skeleton className="h-10 flex-1 bg-gray-700 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

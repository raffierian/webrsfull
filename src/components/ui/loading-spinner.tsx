import { cn } from "@/lib/utils";

export interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: number;
}

export const LoadingSpinner = ({
    size = 24,
    className,
    ...props
}: LoadingSpinnerProps) => {
    return (
        <div
            style={{ width: size, height: size }}
            className={cn("animate-spin text-blue-600", className)}
            {...props}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-full h-full"
            >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
        </div>
    );
};

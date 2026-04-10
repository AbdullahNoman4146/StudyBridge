interface CenteredLoaderProps {
  text?: string;
  containerClassName?: string;
  sizeClassName?: string;
}

export default function CenteredLoader({
  text = "Loading...",
  containerClassName = "min-h-screen",
  sizeClassName = "h-12 w-12",
}: CenteredLoaderProps) {
  return (
    <div className={`w-full flex items-center justify-center ${containerClassName}`}>
      <div className="flex flex-col items-center gap-4">
        <div
          className={`${sizeClassName} rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin`}
          aria-hidden="true"
        />
        <p className="text-sm text-gray-500">{text}</p>
      </div>
    </div>
  );
}
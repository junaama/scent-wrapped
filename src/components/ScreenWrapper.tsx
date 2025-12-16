interface ScreenWrapperProps {
  children: React.ReactNode;
  className?: string;
  outerClassName?: string;
  currentStep?: number;
  totalSteps?: number;
}

export function ScreenWrapper({
  children,
  className = '',
  outerClassName = '',
  currentStep,
  totalSteps = 5
}: ScreenWrapperProps) {
  const showProgress = currentStep !== undefined;
  const progressPercentage = showProgress ? (currentStep / totalSteps) * 100 : 0;

  return (
    <div className={`min-h-screen flex flex-col ${outerClassName}`}>
      {/* Progress bar */}
      {showProgress && (
        <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
          <div className="w-full max-w-md mx-auto">
            <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-black rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      )}

      <div className={`flex-1 flex items-center justify-center p-6 ${showProgress ? 'pt-12' : ''}`}>
        <div className={`w-full max-w-md mx-auto ${className}`}>
          {children}
        </div>
      </div>
    </div>
  );
}

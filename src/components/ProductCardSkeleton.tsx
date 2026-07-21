export default function ProductCardSkeleton() {
  return (
    <div className="floppy-card-skeleton">
      <div className="floppy-card-top">
        <div className="floppy-card-tab" />
        <div className="floppy-card-window mx-auto mt-8 mb-4 h-36 w-[92%] rounded-[1.25rem] bg-[#2f1a5a]" />
      </div>
      <div className="p-4 space-y-3">
        <div className="h-4 rounded bg-[#3b2a65]" />
        <div className="h-4 rounded bg-[#3b2a65] w-5/6" />
        <div className="h-10 rounded-full bg-[#b994ff]/20" />
      </div>
    </div>
  );
}
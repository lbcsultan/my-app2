export default function ProductsLoading() {
  return (
    <div className="mx-auto max-w-2xl flex-1 px-8 py-16">
      <div className="mb-8 h-7 w-64 animate-pulse rounded bg-black/[.06] dark:bg-white/[.08]" />
      <div className="flex flex-col gap-4">
        로딩중... 잠시 기다려주세요.
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-16 animate-pulse rounded-lg bg-black/[.04] dark:bg-white/[.06]"
          />
        ))}
      </div>
    </div>
  )
}

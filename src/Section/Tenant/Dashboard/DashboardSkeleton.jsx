import Card from "../../../Components/UI/Card";

const Lines = ({ count = 3 }) => (
  <div className="space-y-2 animate-pulse">
    {Array.from({ length: count }, (_, index) => (
      <div key={index} className="h-4 rounded bg-(--theme-border-subtle)" />
    ))}
  </div>
);

const DashboardSkeleton = () => (
  <div className="flex flex-col gap-5" aria-busy="true" aria-label="Loading dashboard">
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-7">
      {Array.from({ length: 7 }, (_, index) => (
        <Card key={index} padding="18px 20px">
          <div className="space-y-4 animate-pulse">
            <div className="h-10 w-10 rounded-xl bg-(--theme-border-subtle)" />
            <div className="h-8 w-16 rounded bg-(--theme-border-subtle)" />
            <Lines count={2} />
          </div>
        </Card>
      ))}
    </div>

    <Card padding="24px">
      <div className="space-y-6 animate-pulse"><Lines count={2} /><div className="h-24 rounded bg-(--theme-border-subtle)" /></div>
    </Card>

    <Card padding="24px">
      <div className="space-y-5 animate-pulse"><Lines count={2} /><div className="h-48 rounded bg-(--theme-border-subtle)" /></div>
    </Card>

    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {Array.from({ length: 2 }, (_, index) => <Card key={index} padding="24px"><Lines count={6} /></Card>)}
    </div>

    <Card padding="24px"><div className="space-y-5 animate-pulse"><Lines count={2} /><div className="h-64 rounded bg-(--theme-border-subtle)" /></div></Card>
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {Array.from({ length: 2 }, (_, index) => <Card key={index} padding="24px"><Lines count={2} /><div className="mt-5 h-52 rounded bg-(--theme-border-subtle)" /></Card>)}
    </div>
  </div>
);

export default DashboardSkeleton;

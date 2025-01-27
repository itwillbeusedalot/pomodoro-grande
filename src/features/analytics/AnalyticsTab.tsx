import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useEffect, useMemo, useState } from "react";
import { PomodoroHistory } from "@/types";

type CustomBarLabel = {
  x: number;
  y: number;
  width: number;
  value: number;
};

const CHART_DATA = [
  {
    createdAt: new Date().toDateString(),
    totalPomodoros: 0,
    completedTodos: 0,
    totalWorkTime: 0,
  },
];

const chartConfig = {
  totalPomodoros: {
    label: "Total Pomodoros",
    color: "hsl(var(--chart-1))",
  },
  completedTodos: {
    label: "Completed Todos",
    color: "hsl(var(--chart-2))",
  },
  totalWorkTime: {
    label: "Total Work Time",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

const AnalyticsTab = () => {
  const [chartData, setChartData] = useState<PomodoroHistory[]>(CHART_DATA);
  const [activeChart, setActiveChart] =
    useState<keyof typeof chartConfig>("totalPomodoros");

  useEffect(() => {
    chrome.storage.sync.get("pomodoroHistory").then((result) => {
      if (result.pomodoroHistory) {
        const data = result.pomodoroHistory as PomodoroHistory[];

        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 8);

        // Combine data with the same date and filter for the last 7 days
        const filteredData: PomodoroHistory[] = Object.values(
          data.reduce((acc: any, current) => {
            const date = new Date(current.createdAt)
              .toISOString()
              .split("T")[0];

            const currentDate = new Date(date);

            if (currentDate >= sevenDaysAgo && currentDate <= today) {
              if (!acc[date]) {
                acc[date] = { ...current };
              } else {
                acc[date].totalPomodoros += current.totalPomodoros;
                acc[date].completedTodos += current.completedTodos;
                acc[date].totalWorkTime += current.totalWorkTime;
              }
            }

            return acc;
          }, {})
        );

        setChartData(filteredData || CHART_DATA);
      }
    });
  }, []);

  const total = useMemo(
    () => ({
      totalWorkTime: chartData.reduce(
        (acc, curr) => acc + curr.totalWorkTime,
        0
      ),
      totalPomodoros: chartData.reduce(
        (acc, curr) => acc + curr.totalPomodoros,
        0
      ),
      completedTodos: chartData.reduce(
        (acc, curr) => acc + curr.completedTodos,
        0
      ),
    }),
    [chartData]
  );

  const renderCustomBarLabel = ({ x, y, width, value }: CustomBarLabel) => {
    const isWorkTime = activeChart === "totalWorkTime";
    const labelSuffix = isWorkTime ? (value > 1 ? "mins" : "min") : "";

    return (
      <text x={x + width / 2} y={y} fill="#666" textAnchor="middle" dy={-6}>
        {value} {labelSuffix}
      </text>
    );
  };

  return (
    <div className="w-full space-y-2">
      <h1 className="text-base text-center font-semibold">Your 7-Day Rhythm</h1>

      <div className="flex">
        {["totalPomodoros", "completedTodos", "totalWorkTime"].map((key) => {
          const chart = key as keyof typeof chartConfig;
          const count = total[key as keyof typeof total];

          return (
            <button
              key={chart}
              data-active={activeChart === chart}
              className="relative z-30 flex flex-1 flex-col  gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-primary-custom/10 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
              onClick={() => setActiveChart(chart)}
            >
              <span className="text-xs text-muted-foreground">
                {chartConfig[chart].label}
              </span>

              <div>
                <div className="flex items-center gap-1">
                  <span className="text-lg font-bold leading-none sm:text-3xl">
                    {chart === "totalWorkTime"
                      ? (count / 60).toFixed(2).replace(/\.00$/, "")
                      : count}
                  </span>
                  {chart === "totalWorkTime" && (
                    <span className="text-xs">
                      {count / 60 > 1 ? "hours" : "hour"}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <ChartContainer
        config={chartConfig}
        className="aspect-auto h-[250px] w-full"
      >
        <BarChart
          accessibilityLayer
          data={chartData}
          margin={{
            left: 12,
            right: 12,
          }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="createdAt"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={32}
            tickFormatter={(value) => {
              const date = new Date(value);
              const isToday =
                date.toLocaleDateString() === new Date().toLocaleDateString();

              if (isToday) return "Today";

              return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });
            }}
          />

          <ChartTooltip
            content={
              <ChartTooltipContent
                className="w-[150px]"
                nameKey="views"
                labelFormatter={(value) => {
                  return new Date(value).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });
                }}
              />
            }
          />

          <Bar
            dataKey={activeChart}
            fill={`#40A662`}
            label={renderCustomBarLabel}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
};

export default AnalyticsTab;

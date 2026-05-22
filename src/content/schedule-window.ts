import { cache } from "react";

import { readContent } from "@/lib/content-store";

export type { DayConfig, ScheduleWindow } from "@/content/schema";

export const getScheduleWindow = cache(() => readContent("scheduleWindow"));

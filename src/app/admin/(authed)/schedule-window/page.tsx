import { ScheduleWindowForm } from "@/app/admin/(authed)/schedule-window/_components/schedule-window-form";
import { getScheduleWindow } from "@/content/schedule-window";

export default async function AdminScheduleWindowPage() {
  const w = await getScheduleWindow("tr");
  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight">
        Program Saatleri
      </h2>
      <p className="mt-1 text-sm text-foreground/65">
        Haftalık yayın akışında gösterilen saat aralığını ve günleri buradan
        düzenle. Şu anki ayar: {String(w.startHour).padStart(2, "0")}:00 –{" "}
        {String(w.endHour).padStart(2, "0")}:00, {w.days.length} gün.
      </p>
      <div className="mt-8">
        <ScheduleWindowForm initial={w} />
      </div>
    </div>
  );
}
